from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from .serializers import UserSerializer
from .models import User
import jwt, datetime
import random
import string
from django.core.mail import send_mail
from django.utils import timezone
from .models import PasswordReset
from .serializers import PasswordResetSerializer
import uuid
import logging
from django.utils import timezone
from django.contrib.auth import authenticate

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            return Response({
                'id': user.id,
                'email': user.email,
            }, status=201)
        return Response(serializer.errors, status=400)
    


class LoginView(APIView):
    def post(self, request):
        email = request.data['email']
        password = request.data['password']
        user = authenticate(email=email, password=password)

        if user is None:
            raise AuthenticationFailed('User not found!')

        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        payload = {
            'id': user.id,
            'username': user.username,  # Ensure username is included
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            'iat': datetime.datetime.utcnow()
        }

        secret_key = 'secret'  # Consider using environment variable for production
        token = jwt.encode(payload, secret_key, algorithm='HS256')

        response_data = {
            'jwt': token,
            'username': user.username  # Send username in response
        }

        response = Response()
        response.set_cookie(key='jwt', value=token, httponly=True, secure=True)
        response.data = response_data
        return response


class UserView(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logger.debug("Headers: %s", request.headers)
        logger.debug("Cookies: %s", request.COOKIES)
        logger.debug("Received cookie: %s", request.COOKIES)
        token = request.COOKIES.get('jwt')
        if not token:
            logger.error("No JWT token found in cookies")
            raise AuthenticationFailed('Unauthenticated!')

        try:
            logger.debug("Attempting to decode JWT")
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            logger.debug("JWT decoded successfully")
        except jwt.ExpiredSignatureError:
            logger.error("JWT token expired")
            raise AuthenticationFailed('Unauthenticated!')

        user = User.objects.filter(id=payload['id']).first()
        if not user:
            logger.error("User not found with ID from JWT payload")
            raise AuthenticationFailed('User not found!')
            
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class LogoutView(APIView):
    def post(self, request):
        response = Response()
        response.delete_cookie('jwt')
        response.data = {
            'message': 'success'
        }
        return response

class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()

        if user:
            reset_token = ''.join(random.choices(string.ascii_letters + string.digits, k=20))

            password_reset = PasswordReset(user=user, token=reset_token)
            password_reset.save()

            subject = 'Password Reset'
            message = f'Use this code to reset your password: {reset_token}'
            from_email = 'malekzarrouk296@gmail.com'
            recipient_list = [email]
            send_mail(subject, message, from_email, recipient_list)
        return Response({'message': 'If the email exists, a password reset code has been sent.'})
 