import json
import random
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.http.response import JsonResponse
from django.utils.decorators import method_decorator
import subprocess
from rest_framework.parsers import JSONParser
from GestionBI.models import *
from GestionBI.serializers import *
from django.core.files.storage import default_storage
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from .models import T_Documents  # Replace with your actual model
from .models import ResponsibleRealisation, ResponsibleValidation
from .serializers import S_ResponsibleRealisation, S_ResponsibleValidation
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework import status
from .serializers import S_graphs  # Import the correct serializer

import pdb


# Create your views here.
import logging

logger = logging.getLogger(__name__)



from rest_framework import viewsets, permissions
from .models import Sidebar, SidebarItem
from .serializers import SidebarSerializer, SidebarItemSerializer





from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import SelectedSegment
from .serializers import SelectedSegmentSerializer
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework import status
from .models import SelectedSegment
from .serializers import SelectedSegmentSerializer


@api_view(['PUT'])
def update_selected_segment(request, pk):
    try:
        segment = SelectedSegment.objects.get(pk=pk)
        data = JSONParser().parse(request)
        
        serializer = SelectedSegmentSerializer(segment, data=data, partial=True)  # Supporte la mise à jour partielle
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except SelectedSegment.DoesNotExist:
        return Response({'error': 'SelectedSegment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SelectedSegmentListCreateView(APIView):
    def get(self, request):
        sidebar_item_id = request.query_params.get('sidebar_item_id')  # Utilisez 'sidebar_item_id' ici
        if not sidebar_item_id:
            # Retournez une erreur si le paramètre est absent
            raise ParseError("Le paramètre 'sidebar_item_id' est requis.")
        
        # Filtrer les segments basés sur l'identifiant du sidebar item
        segments = SelectedSegment.objects.filter(selectedSidebarItem=sidebar_item_id)
        if not segments.exists():
            return Response({"error": f"Aucun segment trouvé pour 'sidebar_item_id': {sidebar_item_id}"}, status=404)
        
        # Sérialiser et retourner les segments
        serializer = SelectedSegmentSerializer(segments, many=True)
        return Response(serializer.data, status=200)


    def post(self, request):
        print("Requête reçue:", request.data)  # Log des données reçues
        serializer = SelectedSegmentSerializer(data=request.data)
        if serializer.is_valid():
            print("Données validées:", serializer.validated_data)  # Log des données validées
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print("Erreurs de validation:", serializer.errors)  # Log des erreurs
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





@method_decorator(csrf_exempt, name='dispatch')
class SelectedSegmentDeleteView(APIView):
    http_method_names = ['delete']  # Autorisez uniquement la méthode DELETE

    def delete(self, request, pk):
        print(f"Received DELETE request for segment ID: {pk}")
        try:
            segment = SelectedSegment.objects.get(pk=pk)
            segment.delete()
            print(f"Segment {pk} deleted successfully.")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except SelectedSegment.DoesNotExist:
            print(f"Segment {pk} not found.")
            return Response({'error': 'SelectedSegment not found'}, status=status.HTTP_404_NOT_FOUND)





#sidebar
class SidebarViewSet(viewsets.ModelViewSet):
    queryset = Sidebar.objects.all()
    serializer_class = SidebarSerializer
    permission_classes = [permissions.AllowAny]

class SidebarItemViewSet(viewsets.ModelViewSet):
    queryset = SidebarItem.objects.all()
    serializer_class = SidebarItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        website_id = self.request.query_params.get('website_id')
        if website_id:
            print(f"Filtering SidebarItems by website_id: {website_id}")
            return SidebarItem.objects.filter(website_id=website_id)
        return SidebarItem.objects.none()

    def create(self, request, *args, **kwargs):
        website_id = request.data.get('website')  # Ensure the website ID is included in the request data
        if not website_id:
            return Response({"error": "Website ID is required to create a sidebar item"}, status=400)

        request.data['website'] = website_id  # Assign the website ID to the incoming data
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        try:
            print('Attempting to update SidebarItem with data:', request.data)
            instance_id = kwargs.get('pk', None)
            print(f"SidebarItem ID from URL: {instance_id}")

            if instance_id:
                try:
                    instance = SidebarItem.objects.get(pk=instance_id)
                    print(f"Fetched SidebarItem from DB: {instance}")
                except SidebarItem.DoesNotExist:
                    print(f"SidebarItem with ID {instance_id} does not exist in DB.")
                    return Response({"detail": "No SidebarItem matches the given query."}, status=status.HTTP_404_NOT_FOUND)

            # Use serializer to validate data
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                print(f"SidebarItem {instance_id} updated successfully.")
                return Response(serializer.data)
            else:
                print(f"Validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error updating SidebarItem: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
def get_sidebar_items(request, sidebar_id):
    website_id = request.query_params.get('websiteId')
    if not website_id:
        return Response({"error": "websiteId is required"}, status=400)
    
    items = SidebarItem.objects.filter(sidebar_id=sidebar_id, website_id=website_id)
    serializer = SidebarItemSerializer(items, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_sidebars_by_website(request, website_id):
    try:
        sidebars = Sidebar.objects.filter(website_id=website_id)
        serializer = SidebarSerializer(sidebars, many=True)
        return Response(serializer.data)
    except Sidebar.DoesNotExist:
        return Response(status=404)

@api_view(['POST'])
def create_sidebar(request):
    serializer = SidebarSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)
#graphs
@api_view(['POST'])
def create_graph_with_item(request):
    item_id = request.data.get('itemId', None)
    
    if not item_id:
        return Response({'error': 'Item ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = S_graphs(data=request.data)  # Ensure you pass only required fields
    if serializer.is_valid():
        serializer.save(sidebar_item_id=item_id)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        
@api_view(['GET'])
def get_graphs_by_item(request, sidebar_item_id):
    try:
        graphs = T_graphs.objects.filter(sidebar_item_id=sidebar_item_id)
        serializer = S_graphs(graphs, many=True)
        return Response(serializer.data, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['PUT'])
def update_graph_size(request, graph_id):
    try:
        graph = T_graphs.objects.get(Code_Python_id=graph_id)
        graph.width = request.data.get('width', graph.width)
        graph.height = request.data.get('height', graph.height)
        graph.save()
        return Response({'status': 'success', 'message': 'Graph size updated successfully'})
    except T_graphs.DoesNotExist:
        return Response({'status': 'error', 'message': 'Graph not found'}, status=404)
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)

@api_view(['GET'])
def get_responsible_realisation_by_id(request, id):
    try:
        responsible = ResponsibleRealisation.objects.get(pk=id)
        serializer = S_ResponsibleRealisation(responsible)
        return JsonResponse(serializer.data, safe=False)
    except ResponsibleRealisation.DoesNotExist:
        return JsonResponse({'error': 'Responsible Realisation not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
def get_responsible_validation_by_id(request, id):
    try:
        responsible = ResponsibleValidation.objects.get(pk=id)
        serializer = S_ResponsibleValidation(responsible)
        return JsonResponse(serializer.data, safe=False)
    except ResponsibleValidation.DoesNotExist:
        return JsonResponse({'error': 'Responsible Validation not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
def create_or_update_responsible_Realisation(request, action_id):
    try:
        data = JSONParser().parse(request)
        name = data.get('name')

        if not name:
            return JsonResponse({"error": "Name is required"}, status=400)

        # Fetch or create the ResponsibleRealisation instance
        responsible_realisation, created = ResponsibleRealisation.objects.get_or_create(user_name=name)

        # Now, associate this ResponsibleRealisation with the Action
        action = T_Actions.objects.get(Action_Id=action_id)
        action.Responsible_Realisation = responsible_realisation
        action.save()  # Ensure the update is saved to the database

        # Return the updated action with the associated ResponsibleRealisation
        serializer = S_Actions(action)
        return JsonResponse(serializer.data, safe=False)

    except T_Actions.DoesNotExist:
        return JsonResponse({"error": "Action not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
def create_or_update_responsible_validation(request):
    try:
        data = JSONParser().parse(request)
        name = data.get('name')

        # Fetch or create the ResponsibleValidation instance
        responsible_validation, created = ResponsibleValidation.objects.get_or_create(user_name=name)

        serializer = S_ResponsibleValidation(responsible_validation)
        return JsonResponse(serializer.data, safe=False)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt  # Use csrf_exempt to avoid CSRF validation issues during testing
def update_graph_position(request, graph_id):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            x_position = data.get('x')
            y_position = data.get('y')

            # Log incoming data
            print(f"Received data: {data}")
            print(f"Extracted positions: x = {x_position}, y = {y_position}")

            if x_position is None or y_position is None:
                print("Error: x_position or y_position is None")
                return JsonResponse({'error': 'Invalid position data'}, status=400)

            graph = T_graphs.objects.get(pk=graph_id)
            graph.x_position = x_position
            graph.y_position = y_position
            graph.save()

            print(f"Graph {graph_id} updated successfully with new positions: x = {x_position}, y = {y_position}")

            return JsonResponse({'status': 'success'})
        except T_graphs.DoesNotExist:
            print(f"Graph with id {graph_id} does not exist.")
            return JsonResponse({'error': 'Graph not found'}, status=404)
        except Exception as e:
            print(f"Error occurred while updating graph {graph_id}: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

    print(f"Invalid request method: {request.method}")
    return JsonResponse({'error': 'Invalid request method'}, status=405)  # Return 405 for non-PUT requests





@api_view(['POST'])
def save_causes(request, code_id):
    try:
        graph = T_python_code.objects.get(Code_Id=code_id)
        cause_ids = request.data.get('causes', [])
        causes = T_python_code.objects.filter(Code_Id__in=cause_ids)

        # Log details about the causes being saved
        print(f'Saving causes for graph with Code_Id: {code_id}')
        print('Cause IDs:', cause_ids)
        print('Causes:', list(causes.values()))  # Log the details of the cause objects

        graph.Causes.set(causes)  # This sets the many-to-many relationship

        return JsonResponse({"success": True}, status=200)
    except Exception as e:
        print('Error saving causes:', str(e))
        return JsonResponse({"error": str(e)}, status=400)

@api_view(['POST'])
def save_consequences(request, code_id):
    try:
        code = T_python_code.objects.get(Code_Id=code_id)
        consequence_ids = request.data.get('consequences', [])
        consequences = T_python_code.objects.filter(Code_Id__in=consequence_ids)

        # Log details about the consequences being saved
        print(f'Saving consequences for graph with Code_Id: {code_id}')
        print('Consequence IDs:', consequence_ids)
        print('Consequences:', list(consequences.values()))  # Log the details of the consequence objects

        code.Consequences.set(consequences)  # This sets the many-to-many relationship

        return JsonResponse({"success": True}, status=200)
    except Exception as e:
        print('Error saving consequences:', str(e))
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@api_view(['PUT'])
def update_graph(request, pk):
    try:
        graph = T_graphs.objects.get(pk=pk)
        code = graph.Code_Python
        data = JSONParser().parse(request)
        
        # Update the File_Name and Img_Name
        if 'File_Name' in data:
            new_name = data['File_Name']
            code.File_Name = new_name
            graph.Img_Name = new_name  # Update the Img_Name to match the new File_Name
            
        # Update Causes
        if 'Causes' in data:
            code.Causes.set(data['Causes'])
        
        # Update Consequences
        if 'Consequences' in data:
            code.Consequences.set(data['Consequences'])
        
        # Save the updated code and graph
        code.save(update_fields=['File_Name'])
        graph.save(update_fields=['Img_Name'])
        
        return JsonResponse({"success": "Graph updated successfully"}, status=200)
    except T_graphs.DoesNotExist:
        return JsonResponse({"error": "Graph not found"}, status=404)


method_decorator(csrf_exempt)
@api_view(['GET'])
def get_graphs(request):
    graphs = T_graphs.objects.all()
    serializer = S_graphs(graphs, many=True)
    return Response(serializer.data)
@csrf_exempt
@api_view(['DELETE'])
def delete_graph(request, pk):
    try:
        graph = T_graphs.objects.get(pk=pk)
        code = graph.Code_Python  # Get the associated code
        graph.delete()  # Delete the graph
        code.delete()   # Delete the associated code
        return Response(status=204)
    except T_graphs.DoesNotExist:
        return Response(status=404)


from django.utils.crypto import get_random_string

@csrf_exempt
@api_view(['POST'])
def create_graph(request):
    graph_data = request.data
    
    # Ensure a unique Img_Name by using the primary key of T_python_code
    img_name = graph_data.get('Img_Name', 'default_image_name')
    while T_graphs.objects.filter(Img_Name=img_name).exists():
        img_name = graph_data.get('Img_Name', 'default_image_name') + '_' + get_random_string(6)
    
    # Prepare code data with the unique Img_Name
    code_data = {
        'Code': graph_data.get('Code', 'print("Hello, World!")'),  # Default code to avoid blank error
        'File_Name': img_name,  # Use the unique Img_Name as File_Name
        'Reponse_Id': graph_data.get('Reponse_Id', None),
        'Related_Code': graph_data.get('Related_Code', None),
        'newCodeIsPrincipal': graph_data.get('newCodeIsPrincipal', True),
        'Datasets': graph_data.get('Datasets', []),
        'Causes': graph_data.get('Causes', []),
        'Consequences': graph_data.get('Consequences', []),
        'Reports': graph_data.get('Reports', [])
    }

    # Deserialize and validate code data
    code_serializer = S_Code_Python(data=code_data)
    if code_serializer.is_valid():
        code_instance = code_serializer.save()

        # Use the ID of the newly created code instance to generate Img_Name
        img_name = f"graph_{code_instance.pk}"  # Ensure Img_Name matches the ID

        # Update the Img_Name in the created code instance
        code_instance.File_Name = img_name
        code_instance.save()

        # Get the Item_Id from request data
        item_id = graph_data.get('Item_Id', None)
        sidebar_item = None
        
        if item_id:
            try:
                # Ensure the sidebar item exists
                sidebar_item = SidebarItem.objects.get(pk=item_id)
            except SidebarItem.DoesNotExist:
                return Response({'error': 'Sidebar item does not exist'}, status=status.HTTP_404_NOT_FOUND)

        # Retrieve x_position and y_position from request data
        x_position = graph_data.get('x_position', 0)  # Default to 0 if not provided
        y_position = graph_data.get('y_position', 0)  # Default to 0 if not provided

        # Create the graph instance with the associated sidebar item and positions
        graph_instance = T_graphs.objects.create(
            Img_Name=img_name, 
            Code_Python=code_instance,
            sidebar_item=sidebar_item,  # Associate the graph with the sidebar item
            x_position=x_position,  # Corrected to use x_position
            y_position=y_position   # Corrected to use y_position
        )
        
        # Serialize and return the created graph
        graph_serializer = S_graphs(graph_instance)
        return Response(graph_serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(code_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_all_graphs(request):
    graphs = T_graphs.objects.all()
    serializer = S_graphs(graphs, many=True)
    print("Graphs fetched from DB:", serializer.data)  # Debugging line
    return JsonResponse(serializer.data, safe=False)


@csrf_exempt
def compile_code(request,id=0):
    if request.method == 'POST':
        reponse=T_Reponses.objects.get(Reponse_Id=id)
        code = JSONParser().parse(request)
        code=code['code']

        code="import sys \nx=sys.argv[1:]\nimport ast\nimport pandas as pd\nimport matplotlib.pyplot as plt\ndata=list(map(lambda x:ast.literal_eval(x),x))\ndataset=pd.DataFrame(data)\n"+code
        objects=get_data(id)

        objects=list(map(lambda x:str(x).replace('None',"''"),objects))
        result = subprocess.run(['python', '-c', code]+objects,stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        return JsonResponse({'output': result.stdout.decode(), 'error': result.stderr.decode()})



@csrf_exempt
def save_data_code(request):
    data = JSONParser().parse(request)
    print(data)
    code = data['Code']
    file_name = f"{data['File_Name']}_{random.randint(0, 9)}"
    img_generated = 'plt.show()' in code
    
    if img_generated:
        code = code.replace('plt.show()', f"plt.savefig('./media/{file_name}.png')")
    else:
        code = code.replace('plt.show()', "")
    
    code = (
        "import sys \nx=sys.argv[1:]\nimport ast\nimport pandas as pd\n"
        "import matplotlib.pyplot as plt\ndata=list(map(lambda x:ast.literal_eval(x),x))\n"
        "dataset=pd.DataFrame(data)\n" + code
    )
    
    # Assuming get_data is a function that fetches necessary data for code execution
    # Modify or remove this as per your new requirements
    objects = get_data()  
    objects = list(map(lambda x: str(x).replace('None', "''"), objects))
    
    result = subprocess.run(
        ['python', '-c', code] + objects,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    if result.stderr.decode() == '':
        data['File_Name'] = file_name
        serializer_code = S_Code_Python(data=data)
        if serializer_code.is_valid():
            serializer_code.save()
            print(serializer_code.data)
            if img_generated:
                img = {
                    'Img_Name': file_name,
                    'Code_Python': serializer_code.data['Code_Id']
                }
                serializer_img = S_graphs(data=img)
                if serializer_img.is_valid():
                    serializer_img.save()
                    return JsonResponse({
                        'output': result.stdout.decode(),
                        'error': result.stderr.decode(),
                        'imgURL': img['Img_Name']
                    }, safe=False)
            else:
                return JsonResponse({
                    'output': result.stdout.decode(),
                    'error': result.stderr.decode(),
                    'imgURL': ""
                }, safe=False)
            return JsonResponse('error in saving img', safe=False)
    return JsonResponse('error in saving code', safe=False)

@csrf_exempt
def crud_code_python(request,id=0):
    if request.method == 'GET':
        codes=T_python_code.objects.filter(Reponse_Id=id)

        serializer=S_Code_Python(codes,many=True)
        for code in serializer.data:
            try:
                img=T_graphs.objects.get(Code_Python=code['Code_Id'])
            except:
                img=None
            if img:
                code['img_url']=img.Img_Name
            else:
                code['img_url']=''    
            
            
        return JsonResponse(serializer.data,safe=False)
    elif request.method=='DELETE':
        code=T_python_code.objects.get(Code_Id=id)
        try:
            img=T_graphs.objects.get(Code_Python=code.Code_Id)
        except:
            img=None
        if img==None:
            code.delete()
            return JsonResponse("deleted",safe=False)
        else:
            try:
                default_storage.delete(img.Img_Name+'.png')
            except:
                print('introuvale')
            img.delete()
            code.delete()
            return JsonResponse("deleted",safe=False)



@csrf_exempt
def correct_code(request,id):
    data=JSONParser().parse(request)
    codePy=T_python_code.objects.get(Code_Id=id)
    codePy.Code=data['Code']
    codePy.save(update_fields=['Code'])
    try:
        img=T_graphs.objects.get(Code_Python=codePy.Code_Id)
    except:
        img=None
    
    code="import sys \nx=sys.argv[1:]\nimport ast\nimport pandas as pd\nimport matplotlib.pyplot as plt\ndata=list(map(lambda x:ast.literal_eval(x),x))\ndataset=pd.DataFrame(data)\n"+data['Code']
    
    objects=get_data(data['Reponse_Id'])
    img_generated=str(code).find('plt.show()')!=-1
    imgURL=''
    print(img_generated and img==None)
    print(img_generated and not img==None)
    if img_generated and not img==None:
        img=T_graphs.objects.get(Code_Python=codePy.Code_Id)
        try:
            default_storage.delete(img.Img_Name+'.png')
        except:
            print('introuvale')
        img.Img_Name=img.Img_Name+str(random.randint(0,9))
        img.save(update_fields=['Img_Name'])
        imgURL=img.Img_Name
        code=code.replace('plt.show()',"plt.savefig('./media/"+img.Img_Name+".png')")
    elif img_generated and img==None:
        name=codePy.File_Name+'_'+str(data['Reponse_Id'])+'_'+str(random.randint(0,9))
        img={'Img_Name':name,'Code_Python':codePy.Code_Id}
        serializer_img=S_graphs(data=img)
        code=code.replace('plt.show()',"plt.savefig('./media/"+name+".png')")
        imgURL=name
        if serializer_img.is_valid():
            serializer_img.save()
        else:
            return JsonResponse("error saving img",safe=False)
    elif not img_generated :
        try:
            img=T_graphs.objects.get(Code_Python=codePy.Code_Id)
            default_storage.delete(img.Img_Name+'.png')
            img.delete()
        except:
            print('introuvale')
        



    objects=list(map(lambda x:str(x).replace('None',"''"),objects))
    result = subprocess.run(['python', '-c', code]+objects,stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    return JsonResponse({'output': result.stdout.decode(), 'error': result.stderr.decode(),'img_url':imgURL},safe=False)



@csrf_exempt
def add_new_data_set(request,id_code,id_response):
    code=T_python_code.objects.get(Code_Id=id_code)
    reponce=T_Reponses.objects.get(Reponse_Id=id_response)
    code.Datasets.add(reponce)
    return JsonResponse("added",safe=False)

@csrf_exempt
def update_principle_graph(request):
    info=JSONParser().parse(request)
    graph_code=T_python_code.objects.get(Code_Id=info['Code_Id'])
    graph_code.newCodeIsPrincipal=info['newCodeIsPrincipal']
    graph_code.save(update_fields=['newCodeIsPrincipal'])
    return JsonResponse('updated',safe=False)


@api_view(['GET'])
def get_code_by_id(request, id):
    try:
        code = T_python_code.objects.get(Code_Id=id)
        serializer = S_Code_Python(code, many=False)
        newCode = serializer.data
        
        # Retrieve the associated reports
        reports = code.Reports.all()
        report_serializer = S_Report(reports, many=True)
        newCode['Reports'] = report_serializer.data
        
        img = T_graphs.objects.filter(Code_Python=newCode['Code_Id'])
        
        if img.exists():
            newCode['img_url'] = img[0].Img_Name
        else:
            newCode['img_url'] = ''
            
        return JsonResponse(newCode, safe=False)
    except T_python_code.DoesNotExist:
        return JsonResponse({'error': 'Code not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': 'Internal server error'}, status=500)



@csrf_exempt
def update_related_graph(request):
    data=JSONParser().parse(request)
    code=T_python_code.objects.get(Code_Id=data['Code_Id'])
    newCode=None
    try:
        code_refer=T_python_code.objects.get(Code_Id=data["Related_Code"])
        code.Related_Code=code_refer
        serializer=S_Code_Python(code_refer,many=False)
        newCode=serializer.data
        img=T_graphs.objects.filter(Code_Python=newCode['Code_Id'])
        
        if img.exists():
            newCode['img_url']=img[0].Img_Name
        else:
            newCode['img_url']='' 
    except:
        code.Related_Code=None
    code.save(update_fields=['Related_Code'])
    reference={
        "Related_Code":newCode
    }
    return JsonResponse(reference,safe=False)


from rest_framework.exceptions import ParseError

@csrf_exempt
@api_view(['POST'])
def get_reports(request):
    try:
        code_python_id = request.data.get('code_python_id')
        
        if not code_python_id:
            return JsonResponse({'error': 'code_python_id is required'}, status=400)

        # Fetch the Code_Python instance
        code_python = T_python_code.objects.get(Code_Id=code_python_id)
        
        # Retrieve the associated reports
        reports = code_python.Reports.all()
        
        report_data = []
        for report in reports:
            report_serializer = S_Report(report)
            report_dict = report_serializer.data
            
            # Fetch decisions for the report
            decisions = report.Decisions.all()  # Fetch all linked decisions
            decision_serializer = S_Decision(decisions, many=True)
            report_dict['Decisions'] = decision_serializer.data  # Include decisions in the report data
            
            report_data.append(report_dict)
        
        return JsonResponse(report_data, safe=False)
    
    except Exception as e:
        logger.error(f"Error in get_reports: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)




@csrf_exempt
def get_decisions(request):
    try:
        # Parse the incoming JSON request to get the decision data
        decisions_data = JSONParser().parse(request)
        
        # Handle cases where the data might be a mix of integers and dictionaries
        if isinstance(decisions_data, list):
            decisions_ids = []
            for decision in decisions_data:
                if isinstance(decision, dict):
                    decisions_ids.append(decision.get('Decision_Id'))
                elif isinstance(decision, int):
                    decisions_ids.append(decision)
        
        # Ensure all IDs are valid integers
        decisions_ids = [int(d_id) for d_id in decisions_ids if d_id is not None]

        # Fetch the decisions with the given IDs
        decisions = T_Decision.objects.filter(Decision_Id__in=decisions_ids)

        # Serialize the decisions to return them as JSON
        serializer = S_Decision(decisions, many=True)
        return JsonResponse(serializer.data, safe=False)

    except T_Decision.DoesNotExist:
        return JsonResponse({'error': 'One or more decisions not found'}, status=404)
    except Exception as e:
        logger.error(f"Error in get_decisions: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)

@api_view(['GET'])
def get_action_by_id(request, action_id):
    try:
        # Fetch the action by its ID
        action = T_Actions.objects.get(Action_Id=action_id)
        
        # Serialize the action to include all fields
        serializer = S_Actions(action)
        
        # Return the serialized data as a JSON response
        return JsonResponse(serializer.data, safe=False)
    
    except T_Actions.DoesNotExist:
        return JsonResponse({'error': 'Action not found'}, status=404)


@api_view(['POST'])
def get_actions(request):
    try:
        logger.info("Received request to get actions.")
        
        decisions_data = JSONParser().parse(request)
        logger.debug(f"Parsed decisions_data: {decisions_data}")

        # Initialize the decision_ids list
        decisions_ids = []

        # Handle cases where the data might be a mix of integers and dictionaries
        if isinstance(decisions_data, list):
            for decision in decisions_data:
                if isinstance(decision, dict):
                    decisions_ids.append(decision.get('Decision_Id'))
                elif isinstance(decision, int):
                    decisions_ids.append(decision)

        logger.debug(f"Extracted decision IDs: {decisions_ids}")

        # Ensure all IDs are valid integers
        decisions_ids = [int(d_id) for d_id in decisions_ids if d_id is not None]

        if not decisions_ids:
            logger.error("No valid decision IDs provided")
            return JsonResponse({'error': 'No valid decision IDs provided'}, status=400)

        # Fetch the decisions with the given decision IDs
        decisions = T_Decision.objects.filter(Decision_Id__in=decisions_ids).prefetch_related('Actions')

        # Gather all actions associated with the provided decisions
        actions = T_Actions.objects.filter(decisions__in=decisions).distinct()

        logger.debug(f"Fetched actions: {actions}")

        # Serialize the actions to return them as JSON
        serializer = S_Actions(actions, many=True)
        logger.debug(f"Serialized actions: {serializer.data}")
        
        return JsonResponse(serializer.data, safe=False)

    except T_Decision.DoesNotExist:
        logger.error("One or more decisions not found.")
        return JsonResponse({'error': 'One or more decisions not found'}, status=404)
    except Exception as e:
        logger.error(f"Error in get_actions: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)






@csrf_exempt
def update_report(request,id):
    report=T_Report.objects.get(report_Id=id)
    data=JSONParser().parse(request)
    update=[]
    if('report_Name' in data.keys()):
        report.report_Name=data['report_Name']
        update.append('report_Name')
    if('Content' in data.keys()):
        report.Content=data['Content']
        update.append('Content')
    report.save(update_fields=update)
    return JsonResponse('updated',safe=False)

@csrf_exempt
def update_decision(request,id):
    decision=T_Decision.objects.get(Decision_Id=id)
    data=JSONParser().parse(request)
    update=[]
    if('Decision_Name' in data.keys()):
        decision.Decision_Name=data['Decision_Name']
        update.append('Decision_Name')
    if('Description' in data.keys()):
        decision.Content=data['Description']
        update.append('Description')
    decision.save(update_fields=update)
    return JsonResponse('updated',safe=False)



@csrf_exempt
def add_new_Report(request, id):
    try:
        report_data = JSONParser().parse(request)
        serializer = S_Report(data=report_data)
        if serializer.is_valid():
            report_instance = serializer.save()

            # Associate the report with the graph
            code = T_python_code.objects.get(Code_Id=id)
            code.Reports.add(report_instance)

            # Save the changes to the graph
            code.save()

            return JsonResponse(serializer.data, safe=False)
        return JsonResponse(serializer.errors, safe=False)
    except Exception as e:
        logger.error(f"Error in add_new_Report: {str(e)}")
        return JsonResponse({"error": "Internal server error"}, status=500)






@csrf_exempt
def delete_report(request,id):
    report=T_Report.objects.get(report_Id=id)
    report.delete()
    return JsonResponse('deleted',safe=False)

@csrf_exempt
def delete_decision(request,id):
    decision=T_Decision.objects.get(Decision_Id=id)
    decision.delete()
    return JsonResponse('deleted',safe=False)

@csrf_exempt
def add_new_Decision(request, id):
    Decision_data = JSONParser().parse(request)
    serializer = S_Decision(data=Decision_data)
    if serializer.is_valid():
        serializer.save()
        report = T_Report.objects.get(report_Id=id)
        decision = T_Decision.objects.get(Decision_Id=serializer.data['Decision_Id'])
        report.Decisions.add(decision)  # Link decision to the report
        return JsonResponse(serializer.data, safe=False)
    return JsonResponse("Error", safe=False)

@csrf_exempt
def add_action(request, id):
    try:
        action_data = JSONParser().parse(request)
        responsible_realisation_name = action_data.get('Responsible_Realisation', None)
        responsible_validation_name = action_data.get('Responsible_Validation', None)
        
        # Create or fetch Responsible Realisation
        if responsible_realisation_name:
            responsible_realisation, created = ResponsibleRealisation.objects.get_or_create(user_name=responsible_realisation_name)
            print(f"Responsible Realisation Created: {created}, ID: {responsible_realisation.pk}, Name: {responsible_realisation.user_name}")
            action_data['Responsible_Realisation'] = responsible_realisation.pk

        # Create or fetch Responsible Validation
        if responsible_validation_name:
            responsible_validation, created = ResponsibleValidation.objects.get_or_create(user_name=responsible_validation_name)
            print(f"Responsible Validation Created: {created}, ID: {responsible_validation.pk}, Name: {responsible_validation.user_name}")
            action_data['Responsible_Validation'] = responsible_validation.pk

        # Save the action
        serializer = S_Actions(data=action_data)
        if serializer.is_valid():
            action = serializer.save()
            decision = T_Decision.objects.get(Decision_Id=id)
            decision.Actions.add(action)
            return JsonResponse(serializer.data, safe=False)
        else:
            print(f"Serializer Errors: {serializer.errors}")
            return JsonResponse({"error": serializer.errors}, status=400)
    except Exception as e:
        print(f"Exception occurred: {e}")
        return JsonResponse({"error": "Internal server error"}, status=500)



@csrf_exempt
def delete_action(request, id):
    action = T_Actions.objects.get(Action_Id=id)
    action.delete()
    return JsonResponse("deleted", safe=False)

@csrf_exempt
@api_view(['PUT'])
def update_action(request, id):
    try:
        action = T_Actions.objects.get(Action_Id=id)
        data = JSONParser().parse(request)
        
        # Handle Responsible_Realisation
        responsible_realisation_name = data.get('Responsible_Realisation', None)
        if responsible_realisation_name:
            responsible_realisation, created = ResponsibleRealisation.objects.get_or_create(user_name=responsible_realisation_name)
            action.Responsible_Realisation = responsible_realisation

        # Handle Responsible_Validation
        responsible_validation_name = data.get('Responsible_Validation', None)
        if responsible_validation_name:
            responsible_validation, created = ResponsibleValidation.objects.get_or_create(user_name=responsible_validation_name)
            action.Responsible_Validation = responsible_validation
        
        # Update other fields
        action.Action_Name = data.get('Action_Name', action.Action_Name)
        action.Description = data.get('Description', action.Description)
        action.Date_Submission_Real = data.get('Date_Submission_Real', action.Date_Submission_Real)
        action.Date_Submission_Estimated = data.get('Date_Submission_Estimated', action.Date_Submission_Estimated)
        action.Date_Validation_Real = data.get('Date_Validation_Real', action.Date_Validation_Real)
        action.Date_Validation_Estimated = data.get('Date_Validation_Estimated', action.Date_Validation_Estimated)
        
        action.save()

        # Return the updated action with responsible names included
        serializer = S_Actions(action)
        return JsonResponse(serializer.data, safe=False)
    except T_Actions.DoesNotExist:
        return JsonResponse({"error": "Action not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)




@api_view(['POST'])
def get_causes_consequences(request):
    try:
        code_id = request.data.get('code_id')
        graph = T_python_code.objects.get(Code_Id=code_id)
        
        causes = graph.Causes.all()
        consequences = graph.Consequences.all()

        # Log details about the causes and consequences being fetched
        print(f'Fetching causes and consequences for graph with Code_Id: {code_id}')
        print('Causes:', list(causes.values()))
        print('Consequences:', list(consequences.values()))

        causes_data = S_Code_Python(causes, many=True).data
        consequences_data = S_Code_Python(consequences, many=True).data

        return JsonResponse({
            "causes": causes_data,
            "consequences": consequences_data
        }, safe=False)
    except Exception as e:
        print('Error fetching causes or consequences:', str(e))
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def add_cause_to_code(request,idBase,idCause):
    code=T_python_code.objects.get(Code_Id=idBase)
    cause=T_python_code.objects.get(Code_Id=idCause)
    code.Causes.add(cause)
    return JsonResponse("added",safe=False)

@csrf_exempt
def add_consequence_to_code(request,idBase,idConsequence):
    code=T_python_code.objects.get(Code_Id=idBase)
    consequence=T_python_code.objects.get(Code_Id=idConsequence)
    code.Consequences.add(consequence)
    return JsonResponse("added",safe=False)

@csrf_exempt
def delete_cause_from_code(request,idBase,idCause):
    code=T_python_code.objects.get(Code_Id=idBase)
    cause=T_python_code.objects.get(Code_Id=idCause)
    code.Causes.remove(cause)
    return JsonResponse("deleted",safe=False)

@csrf_exempt
def delete_consequence_from_code(request,idBase,idConsequence):
    code=T_python_code.objects.get(Code_Id=idBase)
    consequence=T_python_code.objects.get(Code_Id=idConsequence)
    code.Consequences.remove(consequence)
    return JsonResponse("deleted",safe=False)



@csrf_exempt
def get_all_codes(request):
    codes=T_python_code.objects.all()
    serializer=S_Code_Python(codes,many=True)
    for code in serializer.data:
        try:
            img=T_graphs.objects.get(Code_Python=code['Code_Id'])
        except:
            img=''
        if img:
            code['img_url']=img.Img_Name
        else:
            code['img_url']='' 
    return JsonResponse(serializer.data,safe=False)




@csrf_exempt
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def create_document_submitted_in_action(request, id):
    try:
        data = request.data  # Get the data from the request
        serializer = S_Documents(data=data)  # Pass the data to the serializer

        if serializer.is_valid():
            document = serializer.save()
            document.Document = request.FILES['Document']  # Save the file
            document.save(update_fields=['Document'])

            action = T_Actions.objects.get(Action_Id=id)
            action.Documents_Submission.add(document)  # Associate with the action
            action.save()

            return JsonResponse(serializer.data, safe=False)
        else:
            return JsonResponse({"error": serializer.errors}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)




@csrf_exempt
def create_document_validated_in_action(request,id):
    serializer=S_Documents(data=request.POST)
    if serializer.is_valid():
        serializer.save()
        action=T_Actions.objects.get(Action_Id=id)
        document=T_Documents.objects.get(Document_Id=serializer.data['Document_Id'])
        document.Document=request.FILES['Document']
        document.save(update_fields=['Document'])
        action.Documents_Validation.add(document)
        return JsonResponse(serializer.data,safe=False)
    return JsonResponse("Error",safe=False)



@csrf_exempt
def get_documents_submitted_by_action(request, id):
    try:
        # Check if the action exists
        action = T_Actions.objects.get(Action_Id=id)
        
        # Retrieve all submitted documents for the action
        documents = action.Documents_Submission.all()
        
        # Serialize the documents
        serializer = S_Documents(documents, many=True)
        
        # Add the file URL for each document, if it exists
        for document in serializer.data:
            if document.get('Document'):
                document['file_url'] = request.build_absolute_uri(document['Document'])

        return JsonResponse(serializer.data, safe=False)
    
    except T_Actions.DoesNotExist:
        return JsonResponse({"error": "Action not found"}, status=404)
    except Exception as e:
        # Log the error for debugging purposes
        logger.error(f"Error fetching submitted documents for action {id}: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt    
def get_documents_validated_by_action(request,id):
    action=T_Actions.objects.get(Action_Id=id)
    documents=action.Documents_Validation.all()
    serializer=S_Documents(documents,many=True)
    return JsonResponse(serializer.data,safe=False)

@csrf_exempt
def delete_document(request, id):
    if request.method == 'DELETE':
        try:
            document = T_Documents.objects.get(pk=id)
            document.delete()
            return JsonResponse({'message': 'Document deleted successfully'}, status=200)
        except T_Documents.DoesNotExist:
            return JsonResponse({'error': 'Document not found'}, status=404)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)