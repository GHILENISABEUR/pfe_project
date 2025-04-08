from rest_framework import viewsets, permissions
from .models import Sidebar, SidebarItem
from .serializers import SidebarSerializer, SidebarItemSerializer

class SidebarViewSet(viewsets.ModelViewSet):
    queryset = Sidebar.objects.all()
    serializer_class = SidebarSerializer
    permission_classes = [permissions.AllowAny]

class SidebarItemViewSet(viewsets.ModelViewSet):
    queryset = SidebarItem.objects.all()
    serializer_class = SidebarItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        sidebar_id = self.kwargs.get('sidebar_id')
        if sidebar_id:
            return SidebarItem.objects.filter(sidebar_id=sidebar_id)
        return super().get_queryset()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['depth'] = 3
        return context

    def update(self, request, *args, **kwargs):
        print('Updating sidebar item:', request.data)
        return super().update(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        sidebar_id = self.kwargs.get('sidebar_id')
        if sidebar_id:
            request.data['sidebar'] = sidebar_id
        return super().create(request, *args, **kwargs)
