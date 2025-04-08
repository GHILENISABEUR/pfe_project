from rest_framework import serializers
from .models import NavbarItem

class NavbarItemSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = NavbarItem
        fields = ['id', 'title', 'url', 'parent', 'order', 'children']

    def get_children(self, obj):
        if 'depth' in self.context and self.context['depth'] <= 0:
            return []
        context = self.context.copy()
        context['depth'] = context.get('depth', 3) - 1  # Adjust depth as needed
        return NavbarItemSerializer(obj.children.all(), many=True, context=context).data
