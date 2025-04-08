from rest_framework import serializers
from .models import Category, Table, Field, Data, Visuals

class CategorySerializer(serializers.ModelSerializer):
    tables = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    children = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Category
        fields = '__all__'
    
        
class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = '__all__'   
    
class VisualsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visuals
        fields = '__all__'

class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = '__all__'

class DataSerializer(serializers.ModelSerializer):
    table = serializers.PrimaryKeyRelatedField(queryset=Table.objects.all(), required=False)

    class Meta:
        model = Data
        fields = '__all__'

