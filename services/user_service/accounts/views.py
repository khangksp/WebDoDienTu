from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def user_list(request):
    users = User.objects.all().values('id', 'username', 'email')
    return Response({"users": list(users)})
