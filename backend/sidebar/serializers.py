from rest_framework import serializers
from .models import Sidebar, SidebarItem

class SidebarSerializer(serializers.ModelSerializer):
    items = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Sidebar
        fields = ['id', 'name', 'style', 'position_x', 'position_y', 'width', 'height', 'toggles', 'items']

class SidebarItemSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = SidebarItem
        fields = ['id', 'title', 'url', 'parent', 'order', 'children', 'sidebar', 'linked_sidebar']

    def get_children(self, obj):
        if 'depth' in self.context and self.context['depth'] <= 0:
            return []
        context = self.context.copy()
        context['depth'] = context.get('depth', 3) - 1  # Adjust depth as needed
        return SidebarItemSerializer(obj.children.all(), many=True, context=context).data

    children = serializers.SerializerMethodField()

    class Meta:
        model = SidebarItem
        fields = ['id', 'title', 'url', 'parent', 'order', 'children', 'sidebar', 'linked_sidebar']

    def get_children(self, obj):
        if 'depth' in self.context and self.context['depth'] <= 0:
            return []
        context = self.context.copy()
        context['depth'] = context.get('depth', 3) - 1  # Adjust depth as needed
        return SidebarItemSerializer(obj.children.all(), many=True, context=context).data
