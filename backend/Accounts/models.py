
from django.db import  models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.utils.text import slugify

class User(AbstractUser):

    email = models.EmailField(unique=True)
    address = models.CharField(max_length=255)
    username = models.CharField(max_length=150, null=True, blank=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []


    def save(self, *args, **kwargs):
        if not self.username:
            self.username = f"{slugify(self.first_name)}_{slugify(self.last_name)}"
        super().save(*args, **kwargs)


class PasswordReset(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)