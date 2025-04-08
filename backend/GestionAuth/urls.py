from django.urls import path
from . import views
from .views import forgot_password, verify_code

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('signin/', views.signin, name='signin'),
    path('logout/', views.logout, name='logout'),
    path('google-login/', views.google_login, name='google_login'), 
      path('verify-google-token/', views.verify_google_token, name='verify_google_token'),
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('verify-code/', verify_code, name='verify_code'),
    path('change-password/', views.change_password, name='change_password'),
]