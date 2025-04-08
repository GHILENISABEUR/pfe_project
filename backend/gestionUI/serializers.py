

from rest_framework import serializers

from .models import Frame, FrameElement, WebSite,Button,Text,InputField,Image

from rest_framework import serializers
from .models import Table

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = '__all__'
class FrameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Frame
        fields = '__all__'
class WebSiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebSite
        fields = '__all__'
class FrameElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = FrameElement
        fields = '__all__'
class ButtonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Button
        fields = '__all__'
class TextSerializer(serializers.ModelSerializer):
    class Meta:
        model = Text
        fields = '__all__'
class InputSerializer(serializers.ModelSerializer):
    class Meta:
        model = InputField
        fields = '__all__'
class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = '__all__'
