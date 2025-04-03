import os
import time
import requests
import random
from faker import Faker

# Initialize Faker
fake = Faker()

# Service URLs
AUTH_SERVICE_URL = os.environ.get('AUTH_SERVICE_URL', 'http://auth_service:8000')
PRODUCT_SERVICE_URL = os.environ.get('PRODUCT_SERVICE_URL', 'http://product_service:8000')
ORDER_SERVICE_URL = os.environ.get('ORDER_SERVICE_URL', 'http://order_service:8000')

# Wait for services to be ready
def wait_for_services():
    services = [
        ('Auth Service', f"{AUTH_SERVICE_URL}/api/auth/users/"),
        ('Product Service', f"{PRODUCT_SERVICE_URL}/api/products/"),
        ('Order Service', f"{ORDER_SERVICE_URL}/api/orders/")
    ]
    
    for service_name, url in services:
        ready = False
        retry_count = 0
        max_retries = 30
        
        print(f"Waiting for {service_name} to be ready...")
        
        while not ready and retry_count < max_retries:
            try:
                response = requests.get(url)
                if response.status_code in [200, 401, 403, 404]:
                    ready = True
                    print(f"{service_name} is ready!")
                else:
                    print(f"{service_name} returned status code {response.status_code}, retrying...")
                    retry_count += 1
                    time.sleep(1)
            except requests.RequestException:
                print(f"Cannot connect to {service_name}, retrying...")
                retry_count += 1
                time.sleep(1)
        
        if not ready:
            print(f"Failed to connect to {service_name} after {max_retries} attempts. Exiting.")
            exit(1)

# Create users
def create_users(count=5):
    users = []
    
    for i in range(count):
        user_data = {
            'email': fake.email(),
            'first_name': fake.first_name(),
            'last_name': fake.last_name(),
            'password': 'password123',
            'password_confirm': 'password123'
        }
        
        try:
            response = requests.post(f"{AUTH_SERVICE_URL}/api/auth/users/", json=user_data)
            if response.status_code == 201:
                user = response.json()['user']
                print(f"Created user: {user['email']}")
                
                # Login to get token
                login_response = requests.post(
                    f"{AUTH_SERVICE_URL}/api/auth/users/login/",
                    json={'email': user_data['email'], 'password': user_data['password']}
                )
                
                if login_response.status_code == 200:
                    user['token'] = login_response.json()['token']
                    users.append(user)
                else:
                    print(f"Failed to login user {user['email']}: {login_response.text}")
            else:
                print(f"Failed to create user: {response.text}")
        except requests.RequestException as e:
            print(f"Error creating user: {str(e)}")
    
    return users

# Create product categories
def create_categories():
    categories = [
        {'name': 'Electronics', 'description': 'Electronic devices and accessories'},
        {'name': 'Clothing', 'description': 'Apparel and fashion items'},
        {'name': 'Books', 'description': 'Books and publications'},
        {'name': 'Home & Garden', 'description': 'Items for home and garden'},
        {'name': 'Sports', 'description': 'Sports equipment and accessories'}
    ]
    
    created_categories = []
    
    for category_data in categories:
        try:
            response = requests.post(f"{PRODUCT_SERVICE_URL}/api/products/categories/", json=category_data)
            if response.status_code == 201:
                category = response.json()
                print(f"Created category: {category['name']}")
                created_categories.append(category)
            else:
                print(f"Failed to create category: {response.text}")
        except requests.RequestException as e:
            print(f"Error creating category: {str(e)}")
    
    return created_categories

# Create products
def create_products(categories, count_per_category=5):
    products = []
    
    for category in categories:
        for i in range(count_per_category):
            product_data = {
                'name': fake.catch_phrase(),
                'description': fake.paragraph(),
                'price': round(random.uniform(10.0, 1000.0), 2),
                'stock': random.randint(10, 100),
                'category': category['id'],
                'image_url': f"https://picsum.photos/id/{random.randint(1, 1000)}/500/500"
            }
            
            try:
                response = requests.post(f"{PRODUCT_SERVICE_URL}/api/products/", json=product_data)
                if response.status_code == 201:
                    product = response.json()
                    print(f"Created product: {product['name']}")
                    products.append(product)
                else:
                    print(f"Failed to create product: {response.text}")
            except requests.RequestException as e:
                print(f"Error creating product: {str(e)}")
    
    return products

# Create orders
def create_orders(users, products, count_per_user=2):
    for user in users:
        for i in range(count_per_user):
            # Select random products for this order
            order_items = []
            order_products = random.sample(products, random.randint(1, 3))
            
            for product in order_products:
                order_items.append({
                    'product_id': product['id'],
                    'quantity': random.randint(1, 3)
                })
            
            order_data = {
                'shipping_address': fake.address(),
                'contact_phone': fake.phone_number(),
                'items': order_items
            }
            
            try:
                response = requests.post(
                    f"{ORDER_SERVICE_URL}/api/orders/",
                    json=order_data,
                    headers={'Authorization': f"Bearer {user['token']}"}
                )
                
                if response.status_code == 201:
                    order = response.json()['order']
                    print(f"Created order #{order['id']} for user {user['email']}")
                    
                    # Randomly update order status for some orders
                    if random.random() > 0.5:
                        status_options = ['PROCESSING', 'SHIPPED', 'DELIVERED']
                        new_status = random.choice(status_options)
                        
                        status_response = requests.post(
                            f"{ORDER_SERVICE_URL}/api/orders/{order['id']}/update_status/",
                            json={'status': new_status},
                            headers={'Authorization': f"Bearer {user['token']}"}
                        )
                        
                        if status_response.status_code == 200:
                            print(f"Updated order #{order['id']} status to {new_status}")
                else:
                    print(f"Failed to create order: {response.text}")
            except requests.RequestException as e:
                print(f"Error creating order: {str(e)}")

def main():
    print("Starting data seeding...")
    
    # Wait for services to be ready
    wait_for_services()
    
    # Create users
    print("\n=== Creating Users ===")
    users = create_users(count=5)
    
    # Create categories
    print("\n=== Creating Categories ===")
    categories = create_categories()
    
    # Create products
    print("\n=== Creating Products ===")
    products = create_products(categories, count_per_category=5)
    
    # Create orders
    print("\n=== Creating Orders ===")
    create_orders(users, products, count_per_user=2)
    
    print("\nData seeding completed successfully!")

if __name__ == "__main__":
    # Add a small delay to ensure all services have fully started
    time.sleep(10)
    main()