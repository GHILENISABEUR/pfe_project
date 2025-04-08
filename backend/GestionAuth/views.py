from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Users
from .serializers import UserSerializer
from django.contrib.auth.hashers import check_password
from .utils import verify_google_token  # Import your token verification function
from django.contrib.auth.hashers import make_password
import json
from django.contrib.auth import logout, login, authenticate
import requests
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from django.http import JsonResponse
from google.auth.transport import requests
from google.oauth2 import id_token
import json
import time
from django.core.mail import send_mail
import random
from django.template.loader import render_to_string 

@api_view(['POST'])
def signup(request):
    data = request.data
    serializer = UserSerializer(data=data)
    try:
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Signup successful!',
                'data': {
                    'id': user.id,
                    'full_name': user.full_name,
                    'email': user.email
                }
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'Signup failed!',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except IntegrityError as e:
        if 'unique constraint' in str(e).lower():
            return Response({
                'message': 'Signup failed!',
                'errors': {'email': ['A user with this email already exists.']}
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'message': 'Signup failed!',
                'errors': {'detail': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'message': 'Signup failed!',
            'errors': {'detail': str(e)}
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def signin(request):
    email = request.data.get('email')
    password = request.data.get('password')
    try:
        user = Users.objects.get(email=email)
        if check_password(password, user.password):
            serializer = UserSerializer(user)
            return Response({
                'id': user.id,
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    except Users.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@csrf_exempt
@api_view(['POST'])
def logout(request):
    # Perform logout actions here (e.g., token invalidation, session deletion)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(['POST'])
def google_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        token = data.get('token')

        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), '835235600448-uqpu4ohocelmu1nmohjv1q6hqvajejam.apps.googleusercontent.com')
            email = idinfo.get('email')

            # Check if user exists
            try:
                user = Users.objects.get(email=email)
                login(request, user)
                serializer = UserSerializer(user)
                return JsonResponse({'success': True, 'user': serializer.data})
            except Users.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'User not found'}, status=404)

        except ValueError:
            return JsonResponse({'success': False, 'error': 'Invalid Google token'}, status=401)

    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=400)

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter


@api_view(['POST'])
@csrf_exempt
def verify_google_token(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        token = data.get('token')
        
        print(f"Received token: {token}")  # Debugging line

        try:
            # Introducing a 30-second grace period to account for minor clock skews
            clock_skew_grace_period = 30

            idinfo = id_token.verify_oauth2_token(token, requests.Request(), '835235600448-uqpu4ohocelmu1nmohjv1q6hqvajejam.apps.googleusercontent.com')

            current_time = time.time()
            if idinfo['nbf'] - clock_skew_grace_period > current_time:
                return JsonResponse({'success': False, 'error': 'Token used too early'}, status=401)
            if idinfo['exp'] + clock_skew_grace_period < current_time:
                return JsonResponse({'success': False, 'error': 'Token expired'}, status=401)

            # ID token is valid. Get the user's Google Account ID from the decoded token.
            userid = idinfo['sub']
            email = idinfo.get('email')
            full_name = idinfo.get('name')
            
            print(f"Token info: {idinfo}")  # Debugging line

            # Check if user exists
            try:
                user = Users.objects.get(email=email)
                return JsonResponse({'success': True, 'id': user.id, 'user': UserSerializer(user).data, 'password_set': user.password != ''})
            except Users.DoesNotExist:
                # Create a new user
                user_data = {'email': email, 'full_name': full_name, 'password': ''}
                serializer = UserSerializer(data=user_data)
                if serializer.is_valid():
                    user = serializer.save()
                    return JsonResponse({'success': True, 'id': user.id, 'user': serializer.data, 'password_set': False}, status=201)
                else:
                    return JsonResponse({'success': False, 'error': serializer.errors}, status=400)
        except ValueError as e:
            print(f"Token verification error: {e}")  # Debugging line
            return JsonResponse({'success': False, 'error': 'Invalid Google token'}, status=401)

    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=400)




@csrf_exempt
def forgot_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')

        if email:
            # Generate a random 4-digit code
            verification_code = ''.join([str(random.randint(0, 9)) for _ in range(4)])

            # Render the email template with the verification code
            email_subject = 'Your Verification Code'
            email_body = render_to_string('verification_code_email.html', {'verification_code': verification_code})

            # Send the email
            send_mail(
                email_subject,
                email_body,
                'your-email@example.com',
                [email],
                fail_silently=False,
                html_message=email_body,  # Send HTML email
            )

            # Save the code and email to session for verification (or save to a database)
            request.session['verification_code'] = verification_code
            request.session['email'] = email
            request.session.save()  # Force save the session

            # Debug prints
            print(f"Session verification_code: {request.session['verification_code']}")
            print(f"Session email: {request.session['email']}")

            return JsonResponse({'status': 'success'}, status=200)
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid email'}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def verify_code(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        code = data.get('code')
        email = request.session.get('email')
        verification_code = request.session.get('verification_code')

        print(f"Received code: {code}")  # Debug print
        print(f"Session email: {email}")  # Debug print
        print(f"Session verification code: {verification_code}")  # Debug print

        if code and email and verification_code:
            if code == verification_code:
                try:
                    user = Users.objects.get(email=email)
                    serializer = UserSerializer(user)
                    return JsonResponse({'status': 'success', 'user': serializer.data}, status=200)
                except Users.DoesNotExist:
                    return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid verification code'}, status=400)
        else:
            return JsonResponse({'status': 'error', 'message': 'Verification failed'}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)



@csrf_exempt
@api_view(['POST'])
def change_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        password = data.get('password')
        email = request.session.get('email')

        if password and email:
            try:
                user = Users.objects.get(email=email)
                user.password = make_password(password)  # Hash the password before saving
                user.save()
                serializer = UserSerializer(user)
                return JsonResponse({'status': 'success', 'user': serializer.data}, status=200)
            except Users.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
        else:
            return JsonResponse({'status': 'error', 'message': 'Password change failed'}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)