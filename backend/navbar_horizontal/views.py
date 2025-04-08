from rest_framework import viewsets
from .models import NavbarItem
from .serializers import NavbarItemSerializer

class NavbarItemViewSet(viewsets.ModelViewSet):
    queryset = NavbarItem.objects.all()
    serializer_class = NavbarItemSerializer
    

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['depth'] = 3  # You can adjust this value as needed
        return context
