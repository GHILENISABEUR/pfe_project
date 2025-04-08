from rest_framework import serializers
from .models import Users
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['full_name', 'email', 'password', 'google_id']  # Add google_id if it's a field in your model
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},  # Make password optional
            'google_id': {'required': False},  # Ensure google_id is not required if not provided
        }

    def create(self, validated_data):
        # Only hash the password if it's provided
        if 'password' in validated_data and validated_data['password']:
            validated_data['password'] = make_password(validated_data['password'])
        else:
            validated_data['password'] = ''  # Set to an empty string for Google users
        return Users.objects.create(**validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data and validated_data['password']:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)

    def validate_email(self, value):
        if Users.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email address must be unique")
        return value