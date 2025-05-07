import stripe
import logging
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import ThanhToan
from .utils import get_rabbitmq_client
from django.utils import timezone

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateCheckoutSessionView(APIView):
    def post(self, request):
        try:
            order_id = request.data.get('order_id')
            amount = request.data.get('amount')  # VND, đơn vị nhỏ nhất
            currency = request.data.get('currency', 'vnd')
            items = request.data.get('items', [])
            user_id = request.data.get('user_id')
            recipient_name = request.data.get('recipient_name')
            phone_number = request.data.get('phone_number')
            address = request.data.get('address')

            if not all([order_id, amount, items, user_id]):
                return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

            # Tạo line_items cho Stripe
            line_items = [
                {
                    'price_data': {
                        'currency': currency,
                        'product_data': {
                            'name': item['TenSanPham'] or item['name'],
                            'metadata': {
                                'product_id': item['id'],
                                'quantity': item['quantity']
                            }
                        },
                        'unit_amount': int((item['GiaBan'] or item['price'])),  # VND không cần nhân 100
                    },
                    'quantity': item['quantity'],
                }
                for item in items
            ]

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url='http://localhost:3000/',
                cancel_url='http://localhost:3000/',
                metadata={
                    'order_id': order_id,
                    'user_id': str(user_id),
                    'recipient_name': recipient_name,
                    'phone_number': phone_number,
                    'address': address
                }
            )

            return Response({
                'session_id': session.id,
                'publishable_key': settings.STRIPE_PUBLISHABLE_KEY
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error creating Stripe session: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class StripeWebhookView(APIView):
    @csrf_exempt
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except (ValueError, stripe.error.SignatureVerificationError) as e:
            logger.error(f"Webhook error: {str(e)}")
            return HttpResponse(status=400)

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            order_id = session['metadata']['order_id']
            payment_intent_id = session['payment_intent']

            with transaction.atomic():
                try:
                    thanh_toan = ThanhToan.objects.get(fk_MaDonHang=order_id)
                    thanh_toan.TrangThaiThanhToan = 'Hoàn tất'
                    thanh_toan.stripe_payment_intent_id = payment_intent_id
                    thanh_toan.save()

                    # Publish sự kiện payment.updated
                    client = get_rabbitmq_client()
                    payment_data = {
                        'payment_id': thanh_toan.pk_MaThanhToan,
                        'order_id': order_id,
                        'status': 'Hoàn tất',
                        'payment_method': 'stripe',
                        'updated_at': timezone.now().isoformat()
                    }
                    client.publish('payment.updated', payment_data)
                    client.close()

                    logger.info(f"Updated ThanhToan for order #{order_id}")
                except ThanhToan.DoesNotExist:
                    logger.error(f"Payment for order #{order_id} not found")

        return HttpResponse(status=200)