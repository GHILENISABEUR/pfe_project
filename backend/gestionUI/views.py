import json
from django.http import JsonResponse
from django.shortcuts import get_list_or_404, get_object_or_404, render
from flask import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Frame, FrameElement, WebSite,Text,InputField,Image,Button
from django.views.decorators.csrf import csrf_exempt
from .serializers import FrameElementSerializer, FrameSerializer,  WebSiteSerializer
from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Table
from .serializers import TableSerializer
from rest_framework import status
from .serializers import TableSerializer,ButtonSerializer,TextSerializer,InputSerializer,ImageSerializer

@api_view(['GET'])
def get_by_id(request, table_id):
    table = get_object_or_404(Table, id=table_id)
    serializer = TableSerializer(table)
    return Response(serializer.data)

@api_view(['POST'])
def create_table(request):
    serializer = TableSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_all_tables(request):
    tables = Table.objects.all()
    serializer = TableSerializer(tables, many=True)
    return Response(serializer.data)
@api_view(['GET'])
def get_tables_by_website(request):
    website_id = request.GET.get('websiteId')
    print(website_id)
    if website_id:
        tables = Table.objects.filter(webSite_id=website_id)
    else:
        tables = Table.objects.all()
    serializer = TableSerializer(tables, many=True)
    print(tables)
    return Response(serializer.data)
@api_view(['PUT'])
def update_table(request, table_id):
    table = get_object_or_404(Table, id=table_id)
    serializer = TableSerializer(table, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_table(request, table_id):
    table = get_object_or_404(Table, id=table_id)
    table.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

           
class FrameView(): 
    @csrf_exempt
    def getByWebSite(request, key):
        frames = get_list_or_404(Frame, webSiteId=key)
    
        # Serialize the data
        data = [{
            'title': frame.title,
            'content': frame.content,
            'route': frame.route,
            'event': frame.event,
            'webSiteId': frame.webSiteId,
            'key': frame.key
        } for frame in frames]

        return JsonResponse(data, safe=False)  
              
    @csrf_exempt
    def getById(request, key):
        frame = get_object_or_404(Frame, pk=key)
       
        return JsonResponse({
            'title':frame.title,
            'content':frame.content,
            'route':frame.route,
            'event':frame.event,
            'webSiteId':frame.webSiteId,
            'key':frame.key
           
        })
    
    @csrf_exempt
    def create( request):
        if request.method == 'POST':
            data = json.loads(request.body)
            print(data)
            serializer = FrameSerializer(data=data)
           
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=200)
            else :
                print(serializer.errors)
            return JsonResponse(serializer.errors, status=400)  
    
    @csrf_exempt
    def getAll(request):
        frame = Frame.objects.all()
        
        serializer = FrameSerializer(frame, many=True)
        return JsonResponse(serializer.data, safe=False)
    @csrf_exempt
    def update( request, frame_id):
        if request.method == 'PUT':
            try:
                frame = Frame.objects.get(pk=frame_id)
                data = json.loads(request.body)
                serializer = FrameSerializer(frame, data=data, partial=True)  # partial=True allows for partial updates
                if serializer.is_valid():
                    serializer.save()
                    return JsonResponse({'message': True}, status=200)
                else:
                    return JsonResponse(serializer.errors, status=400)
            except Frame.DoesNotExist:
                return JsonResponse({'error': 'Frame not found'}, status=404)
            
    @csrf_exempt
    def delete(request, frame_id):
        if request.method == 'DELETE':
            frame = get_object_or_404(Frame, pk=frame_id)
            frame.delete()
            return JsonResponse({'message': True}, status=204)
class WebSiteView(): 
    @csrf_exempt
    def getById(request, key):
        website = get_object_or_404(WebSite, pk=key)
       
        return JsonResponse({
            'title':website.title,
     
        })
    @csrf_exempt
    def create( request):
        if request.method == 'POST':
            data = json.loads(request.body)
            print(data)
            serializer = WebSiteSerializer(data=data)
           
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=200)
            else :
                print(serializer.errors)
            return JsonResponse(serializer.errors, status=400)  
    @csrf_exempt
    def getAll(request):
        website = WebSite.objects.all()
        
        serializer = WebSiteSerializer(website, many=True)
        return JsonResponse(serializer.data, safe=False)
    @csrf_exempt
    def update( request, website_id):
        if request.method == 'PUT':
            try:
                website = WebSite.objects.get(pk= website_id)
                data = json.loads(request.body)
                serializer = WebSiteSerializer(website, data=data, partial=True)  # partial=True allows for partial updates
                if serializer.is_valid():
                    serializer.save()
                    return JsonResponse({'message': True}, status=200)
                else:
                    return JsonResponse(serializer.errors, status=400)
            except WebSite.DoesNotExist:
                return JsonResponse({'error': 'website not found'}, status=404)
    @csrf_exempt
    def delete(request, website_id):
        if request.method == 'DELETE':
            website = get_object_or_404(WebSite, pk=website_id)
            website.delete()
            return JsonResponse({'message': True}, status=204)
 
class FrameElementView(): 
    @csrf_exempt
    def getByFrame(request, key):
        elements = get_list_or_404(FrameElement, frameId=key)
    
        # Serialize the data
        data = [{
            'id':element.id,
            'type': element.type,
            'frameId': element.frameId,
            'key': element.key
        } for element in elements]

        return JsonResponse(data, safe=False)  
    @csrf_exempt
    def create( request):
        if request.method == 'POST':
            data = json.loads(request.body)
            print(data)
            serializer = FrameElementSerializer(data=data)
           
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=200)
            else :
                print(serializer.errors)
            return JsonResponse(serializer.errors, status=400)  
    @csrf_exempt
    def getAll(request):
        frameElement = FrameElement.objects.all()
        
        serializer = FrameElementSerializer(frameElement, many=True)
        return JsonResponse(serializer.data, safe=False)
    @csrf_exempt
    def update( request, frameElement_id):
        if request.method == 'PUT':
            try:
                frameElement = FrameElement.objects.get(pk= frameElement_id)
                data = json.loads(request.body)
                serializer = FrameElementSerializer(frameElement, data=data, partial=True)  # partial=True allows for partial updates
                if serializer.is_valid():
                    serializer.save()
                    return JsonResponse({'message': True}, status=200)
                else:
                    return JsonResponse(serializer.errors, status=400)
            except FrameElement.DoesNotExist:
                return JsonResponse({'error': 'frameelemnt not found'}, status=404)
    @csrf_exempt
    def delete(request,  frameElement_id):
        if request.method == 'DELETE':
            frameElement = get_object_or_404(FrameElement, pk= frameElement_id)
            frameElement.delete()
            return JsonResponse({'message': True}, status=204)
        
@api_view(['POST'])
def create_text(request):
    if request.method == 'POST':
        serializer = TextSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def get_text(request, pk):
    try:
        text = Text.objects.get(pk=pk)
    except Text.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TextSerializer(text)
        return Response(serializer.data)
@api_view(['GET'])
def get_text_webside(request, website):
    texts = Text.objects.filter(website=website)
    serializer = TextSerializer(texts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_text_webside_frame(request, website, frame_id):
    texts = Text.objects.filter(website=website, frame_id=frame_id)
    serializer = TextSerializer(texts, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
def update_text(request, pk):
    try:
        text = Text.objects.get(pk=pk)
    except Button.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = TextSerializer(text, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_text(request, pk):
    try:
        text = Text.objects.get(pk=pk)
    except Text.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        text.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['GET'])
def get_texts(request):
    if request.method == 'GET':
        texts = Text.objects.all()
        serializer = TextSerializer(texts, many=True)
        return Response(serializer.data)

    
@api_view(['POST'])
def create_input_field(request):
    if request.method == 'POST':
        serializer = InputSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
def get_input_fields(request):
    if request.method == 'GET':
        inputs= InputField.objects.all()
        serializer = InputSerializer(inputs, many=True)
        return Response(serializer.data)

@api_view(['GET'])
def get_input_fields_webside(request, website):
    inputs = InputField.objects.filter(website=website)
    serializer = InputSerializer(inputs, many=True)
    return Response(serializer.data)
@api_view(['GET'])
def get_input_fields_webside_frame(request, website, frame_id):
    inputs = InputField.objects.filter(website=website, frame_id=frame_id)
    serializer = TextSerializer(inputs, many=True)
    return Response(serializer.data)
@api_view(['PUT'])
def update_input_field(request, pk):
    try:
        input = InputField.objects.get(pk=pk)
    except Button.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = InputSerializer(input, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_input_field(request, pk):
    try:
        input = InputField.objects.get(pk=pk)
    except Text.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        input.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['POST'])
def create_image(request):
    if request.method == 'POST':
        serializer = ImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
def get_image(request, image_id):
    image = get_object_or_404(Image, id=image_id)
    return JsonResponse({'id': image.id, 'src': image.src, 'style': image.style, 'frame_id': image.frame.id,'webside':image.website.id})

@api_view(['GET'])
def get_images_webside(request, website):
    images = Image.objects.filter(website=website)
    serializer = ImageSerializer(images, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_images_webside_frame(request, website, frame_id):
    images = Image.objects.filter(website=website, frame_id=frame_id)
    serializer = ImageSerializer(images, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
def update_image(request, pk):
    try:
        image = Image.objects.get(pk=pk)
    except Image.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = ImageSerializer(image, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_image(request, pk):
    try:
        image = Image.objects.get(pk=pk)
    except Text.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def get_images(request):
    if request.method == 'GET':
        images= Image.objects.all()
        serializer = ImageSerializer(images, many=True)
        return Response(serializer.data)
@api_view(['POST'])
def create_button(request):
    if request.method == 'POST':
        serializer = ButtonSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_button(request, pk):
    try:
        button = Button.objects.get(pk=pk)
    except Button.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = ButtonSerializer(button, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_button(request, pk):
    try:
        button = Button.objects.get(pk=pk)
    except Button.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        button.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['GET'])
def get_button(request, pk):
    try:
        button = Button.objects.get(pk=pk)
    except Button.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ButtonSerializer(button)
        return Response(serializer.data)
@api_view(['GET'])
def get_button_webside(request, website):
    buttons = Button.objects.filter(website=website)
    serializer = ButtonSerializer(buttons, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_button_webside_frame(request, website, frame_id):
    buttons = Button.objects.filter(website=website, frame_id=frame_id)
    serializer = ButtonSerializer(buttons, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_buttons(request):
    if request.method == 'GET':
        buttons = Button.objects.all()
        serializer = ButtonSerializer(buttons, many=True)
        return Response(serializer.data)
