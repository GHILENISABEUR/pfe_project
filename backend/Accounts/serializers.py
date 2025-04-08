from rest_framework import serializers
from .models import User
from .models import PasswordReset
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'username', 'password', 'address']
        extra_kwargs = {'password': {'write_only': True}}
        
    def create(self, validated_data):
        validated_data['username'] = f"{slugify(validated_data.get('first_name'))}_{slugify(validated_data.get('last_name'))}"
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            address=validated_data.get('address')
        )
        user.save()
        return user
    
class PasswordResetSerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordReset
        fields = '__all__'
