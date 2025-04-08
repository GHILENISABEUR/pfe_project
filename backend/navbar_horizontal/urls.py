from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NavbarItemViewSet

router = DefaultRouter()
router.register(r'navbar', NavbarItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
