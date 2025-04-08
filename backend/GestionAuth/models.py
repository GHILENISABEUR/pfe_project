from django.db import models
from django.contrib.auth.hashers import make_password

# Create your models here.


class Users(models.Model):
    id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255,blank=True,null=True)
    google_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.email