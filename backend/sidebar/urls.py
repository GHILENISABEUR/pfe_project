from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SidebarViewSet, SidebarItemViewSet

router = DefaultRouter()
router.register(r'sidebars', SidebarViewSet)
router.register(r'sidebar-items', SidebarItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('sidebars/<int:sidebar_id>/items/', SidebarItemViewSet.as_view({'get': 'list', 'post': 'create'}), name='sidebar-items'),  # Ajoutez cette ligne pour permettre les POST
]
