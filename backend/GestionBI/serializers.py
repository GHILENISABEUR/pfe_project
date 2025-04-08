from rest_framework import serializers
from GestionBI.models import *


class SelectedSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SelectedSegment
        fields = '__all__'


class S_Code_Python(serializers.ModelSerializer):
    class Meta:
        model=T_python_code
        fields='__all__'
class S_Report(serializers.ModelSerializer):
    class Meta:
        model=T_Report
        fields='__all__'

class S_graphs(serializers.ModelSerializer):
    class Meta:
        model=T_graphs
        fields='__all__'

class S_ResponsibleRealisation(serializers.ModelSerializer):
    class Meta:
        model = ResponsibleRealisation
        fields = '__all__'

class S_ResponsibleValidation(serializers.ModelSerializer):
    class Meta:
        model = ResponsibleValidation
        fields = '__all__'

class S_Documents(serializers.ModelSerializer):
    class Meta:
        model=T_Documents
        fields='__all__'

class S_Actions(serializers.ModelSerializer):
    Responsible_Realisation = serializers.PrimaryKeyRelatedField(
        queryset=ResponsibleRealisation.objects.all(),
        required=False,  # This allows the field to be optional
        allow_null=True  # This allows the field to be null
    )
    Responsible_Validation = serializers.PrimaryKeyRelatedField(
        queryset=ResponsibleValidation.objects.all(),
        required=False,  # This allows the field to be optional
        allow_null=True  # This allows the field to be null
    )

    class Meta:
        model = T_Actions
        fields = '__all__'





class S_Decision(serializers.ModelSerializer):
    class Meta:
        model=T_Decision
        fields='__all__'


class SidebarSerializer(serializers.ModelSerializer):
    items = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Sidebar
        fields = ['id', 'name', 'style', 'position_x', 'position_y', 'width', 'height', 'toggles', 'items']

class SidebarItemSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = SidebarItem
        fields = ['id', 'title', 'url', 'parent', 'order', 'children', 'sidebar', 'linked_sidebar', 'website']

    def get_children(self, obj):
        if 'depth' in self.context and self.context['depth'] <= 0:
            return []
        context = self.context.copy()
        context['depth'] = context.get('depth', 3) - 1  # Adjust depth as needed
        return SidebarItemSerializer(obj.children.all(), many=True, context=context).data