from django.shortcuts import render
import logging
import json
import pandas as pd
import numpy as np
from datetime import datetime
from django.shortcuts import get_object_or_404
from datetime import datetime
from django.http import JsonResponse, HttpResponseBadRequest,HttpResponse,Http404,HttpResponseServerError
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from .models import CsvData, Graph
import pandas as pd
from PIL import Image
import mimetypes
import traceback
from .models import T_graphs,SidebarItem  # Si T_graphs est dans le même fichier de modèles
from django.core.files.base import ContentFile
from io import BytesIO
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import uuid
import io
import base64
import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.base import ContentFile
from django.core.files.base import ContentFile
from django.conf import settings
from types import SimpleNamespace

logger = logging.getLogger(__name__)

def home(request):
    return render(request, 'home.html')


@api_view(['GET'])
def get_latest_graph_by_tgraph_id(request, t_graph_id):
    try:
        # Retrieve the latest graph based on t_graph_id
        latest_graph = Graph.objects.filter(t_graph_id=t_graph_id).order_by('-created_at').first()
        
        if latest_graph:
            response_data = {
                'code': latest_graph.code,  # Assuming the 'code' field contains the Python code
                'graph_url': latest_graph.image_base64,  # Assuming 'image_base64' holds the graph image in base64 format
                't_graph_id': latest_graph.t_graph_id,
                'csv_data_id':latest_graph.csv_data_id,
            }
            return Response(response_data)
        else:
            return Response({'error': 'No graph found for the given t_graph_id'}, status=404)
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@csrf_exempt
def upload_file(request):
    if request.method == 'POST':
        files = request.FILES.getlist('files')
        sidebar_item_id = request.POST.get('sidebarItemId')  # Récupérer le sidebarItemId

        if not files:
            return HttpResponseBadRequest("No files uploaded")
        if not sidebar_item_id:
            return HttpResponseBadRequest("sidebarItemId is missing")
        try:
            sidebar_item = SidebarItem.objects.get(id=sidebar_item_id)
        except SidebarItem.DoesNotExist:
            return HttpResponseBadRequest("Invalid sidebarItemId")
        file_urls = []
        file_ids = []
        file_sizes=[]

        for uploaded_file in files:
            if not uploaded_file.name.lower().endswith(('.csv', '.xls', '.xlsx')):
                return HttpResponseBadRequest("Unsupported file format")

            try:
                file_name = default_storage.save(uploaded_file.name, uploaded_file)
                file_url = default_storage.url(file_name)
                file_size = uploaded_file.size  # Taille du fichier en octets

                csv_data = CsvData(file=uploaded_file, file_size=file_size,sidebar_item=sidebar_item)  
                csv_data.save()

                file_urls.append(file_url)
                file_ids.append(csv_data.id)
                file_sizes.append(file_size)

            except Exception as e:
                logger.error('Unexpected error: %s', e)
                return JsonResponse({'error': 'An unexpected error occurred.'}, status=500)

        return JsonResponse({'file_urls': file_urls, 'file_ids': file_ids,'file_sizes':file_sizes})

    else:
        return HttpResponseBadRequest("Only POST method is allowed")


   
def get_csv_by_sidebar_item(request, sidebar_item_id):
    sidebar_item = get_object_or_404(SidebarItem, id=sidebar_item_id)
    csv_data = CsvData.objects.filter(sidebar_item=sidebar_item)
    data = [
        {   "id":csv.id,
            "file": csv.file.url,
            "uploaded_at": csv.uploaded_at,
            "file_size": csv.file_size  # Ajout de la taille du fichier en octets

            
        }
        for csv in csv_data
    ]
    return JsonResponse(data, safe=False)
@csrf_exempt 
def available_files(request):
    try:
        files = CsvData.objects.all()
   

        file_list = [{'id': file.id, 'name': file.file.name,'file_size': file.file_size} for file in files]

        return JsonResponse({'files': file_list})

    except Exception as e:
        print(f"Error: {e}")
        return JsonResponse({'error': 'Internal Server Error'}, status=500)
    
    
def get_all_graphs(request):
    if request.method == 'GET':
        graphs = Graph.objects.all()

        graphs_data = []
        for graph in graphs:
            graphs_data.append({
                'id': graph.id,
                'csv_data_id': graph.csv_data.id,
                'image_url': graph.image_url,
                'image_base64': graph.image_base64,
                'code': graph.code,
                'created_at': graph.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            })

        return JsonResponse({'graphs': graphs_data})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    
@csrf_exempt
def get_file_by_id(request, file_id):
    logger.info(f"Received request to fetch file with ID: {file_id}")
    try:
        file_instance = CsvData.objects.get(id=file_id)
        logger.info(f"File instance retrieved: {file_instance}")

        file_path = file_instance.file.path
        logger.info(f"Attempting to open file at path: {file_path}")

        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{file_instance.file.name}"'
            return response
    except CsvData.DoesNotExist:
        logger.error(f"No file found with ID: {file_id}")
        raise Http404("File does not exist")
    except Exception as e:
        logger.error(f"Unexpected error occurred: {e}")
        return HttpResponse(status=500)
   
import csv

@csrf_exempt
def execute_code(request):
    if request.method == 'POST':
        try:
            print("Received POST request for execute_code")
            file_id = request.POST.get('file_id')
            code = request.POST.get('code')
            t_graph_id = request.POST.get('t_graph_id')  # Récupérer l'ID de T_graphs depuis la requête

            print(f"file_id: {file_id}, t_graph_id: {t_graph_id}")

            if not file_id or not code:
                print("Missing file ID or code")
                return HttpResponseBadRequest("Missing file ID or code")

            # Récupérer l'objet CsvData correspondant
            csv_data = get_object_or_404(CsvData, id=file_id)
            print(f"csv_data.file.name: {csv_data.file.name}")

            file_name = csv_data.file.name
            file_path = default_storage.path(file_name)
            print(f"file_path: {file_path}")

            # Charger le fichier en fonction de son extension
            if not os.path.exists(file_path):
                print(f"File not found locally, copying from storage: {file_path}")
                with default_storage.open(file_name, 'rb') as src_file:
                    with open(file_path, 'wb') as dst_file:
                        dst_file.write(src_file.read())
                print(f"File copied to {file_path}")

            # Lecture du fichier en fonction de son extension
            if file_name.lower().endswith('.csv'):
                print(f"Reading CSV file: {file_path}")
                df = pd.read_csv(file_path)  # Lecture du fichier CSV
            elif file_name.lower().endswith('.xlsx'):
                print(f"Reading Excel (.xlsx) file: {file_path}")
                df = pd.read_excel(file_path, engine='openpyxl')  # Lecture du fichier Excel .xlsx
            elif file_name.lower().endswith('.xls'):
                print(f"Reading Excel (.xls) file: {file_path}")
                df = pd.read_excel(file_path, engine='xlrd')  # Lecture du fichier Excel .xls
            else:
                print("Unsupported file format")
                return HttpResponseBadRequest("Unsupported file format")

            # Vérifier les colonnes du DataFrame
            df.columns = df.columns.str.strip()
            print(f"DataFrame columns: {df.columns}")

            # Exécution du code Python fourni avec les données du fichier
            exec_globals = {'pd': pd, 'plt': plt, 'io': io, 'base64': base64, 'df': df}
            exec_locals = {}
            try:
                print("Executing the provided code...")
                exec(code, exec_globals, exec_locals)  # Exécuter le code Python
                image_base64 = exec_locals.get('image_base64', '')
                print(f"Generated image_base64: {image_base64[:100]}...")

                if not image_base64:
                    print("No image_base64 returned from code execution")
                    return JsonResponse({'error': 'No image_base64 returned from code execution'}, status=400)

                # Associer le T_graph si un ID est fourni
                t_graph = None
                if t_graph_id:
                    try:
                        t_graph = T_graphs.objects.get(pk=t_graph_id)
                        print(f"T_graph found: {t_graph_id}")
                    except T_graphs.DoesNotExist:
                        print(f"T_graph with id {t_graph_id} does not exist")
                        return JsonResponse({'error': 'T_graph not found'}, status=404)

                # Créer et sauvegarder le graph
                graph = Graph.objects.create(
                    csv_data=csv_data,
                    code=code,
                    image_base64=image_base64,
                    t_graph=t_graph  # Associer le T_graph
                )
                print(f"Graph created with ID: {graph.id}")

                return JsonResponse({'graph_id': graph.id, 'graph': image_base64, 'data': df.to_dict(orient='records')})

            except Exception as e:
                print(f"Error executing code: {e}")
                traceback.print_exc()  # Afficher la trace complète de l'erreur
                logger.error('Error executing code: %s', e)
                return JsonResponse({'error': str(e)}, status=500)

        except Exception as e:
            print(f"Unexpected error: {e}")
            traceback.print_exc()  # Afficher la trace complète de l'erreur
            logger.error('Unexpected error: %s', e)
            return JsonResponse({'error': 'An unexpected error occurred.'}, status=500)

    else:
        print("Invalid request method, only POST allowed")
        return HttpResponseBadRequest("Only POST method is allowed")


@csrf_exempt

def filter_graph(request): 
    if request.method == 'POST':
        print("Received POST request")
        
        if request.content_type.startswith('multipart/form-data'):
            print("Content-Type is multipart/form-data")

            file_ids = request.POST.get('file_ids')
            column = request.POST.get('column')
            filters = request.POST.get('filters')
            t_graph_id = request.POST.get('t_graph_id')
            sideBarItemid = request.POST.get('sideBarItemid')

            print(f"file_ids: {file_ids}, column: {column}, filters: {filters}, t_graph_id: {t_graph_id}")

            if file_ids and column and filters and t_graph_id:
                logger.info(f"Received column: {column}, filters: {filters}, file_ids: {file_ids}, t_graph_id: {t_graph_id}")

            try:
                file_ids = json.loads(file_ids)
                filters = json.loads(filters)
                print(f"Parsed file_ids: {file_ids}, filters: {filters}")
            except (ValueError, json.JSONDecodeError) as e:
                print(f"Error parsing JSON: {e}")
                return HttpResponseBadRequest("Invalid file IDs or filters format")

            if column not in filters:
                return HttpResponseBadRequest(f"Column {column} not found in filters")

            unique_values = filters[column]

            if len(file_ids) != 1:
                return HttpResponseBadRequest("Expected exactly one file_id")
            
            file_id = file_ids[0]
            csv_data = get_object_or_404(CsvData, id=file_id)
            file_name = csv_data.file.name
            file_path = default_storage.path(file_name)

            if not os.path.exists(file_path):
                with default_storage.open(file_name, 'rb') as src_file:
                    with open(file_path, 'wb') as dst_file:
                        dst_file.write(src_file.read())

            print(f"Processing file: {file_name} with extension: {os.path.splitext(file_name)[1]}")

            # Handling .csv, .xls, and .xlsx file formats properly
            try:
                if file_name.lower().endswith('.csv'):
                    df = pd.read_csv(file_path)
                elif file_name.lower().endswith('.xlsx'):
                    df = pd.read_excel(file_path, engine='openpyxl')
                elif file_name.lower().endswith('.xls'):
                    df = pd.read_excel(file_path, engine='xlrd')
                else:
                    return HttpResponseBadRequest("Unsupported file format")
            except Exception as e:
                logger.error(f"Error loading file: {e}")
                return HttpResponseServerError(f"Error loading file: {e}")

            df.columns = df.columns.str.strip()

            if column in df.columns:
                filtered_df = df[df[column].isin(unique_values)]
            else:
                return HttpResponseBadRequest(f"Column {column} not found in dataset")

            # Create a directory for filtered uploads
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'filtered_uploads')
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)

            # Generate a filename that includes the column, filter details, and a unique ID
            def sanitize_filename(value):
                """Helper function to clean up filenames."""
                return "".join(c if c.isalnum() or c in ('-', '_') else "_" for c in value)

            filters_str = "_".join(f"{key}={','.join(map(str, values))}" for key, values in filters.items())
            filters_str = sanitize_filename(filters_str)  # Sanitize the filter string for safe filenames

            # Generate a unique ID (UUID4) for the file
            unique_id = str(uuid.uuid4())[:8]

            # Create the final filtered file name with unique ID
            filtered_file_name = f"filtered_{os.path.basename(file_name).split('.')[0]}_{filters_str}_{unique_id}.{file_name.split('.')[-1]}"
            filtered_file_path = os.path.join(upload_dir, filtered_file_name)

            print(f"Generated filtered file name with unique ID: {filtered_file_name}")

            # Save the filtered file
            try:
                if file_name.lower().endswith('.xlsx'):
                    print(f"Saving filtered file as Excel (.xlsx) to: {filtered_file_path}")
                    with pd.ExcelWriter(filtered_file_path, engine='openpyxl') as writer:
                        filtered_df.to_excel(writer, index=False)
                else:
                    print(f"Saving filtered file as CSV to: {filtered_file_path}")
                    filtered_df.to_csv(filtered_file_path, index=False)

                # Check for sidebarItemId
                if not sideBarItemid:
                    return HttpResponseBadRequest("sidebarItemId is missing")

                # Retrieve SidebarItem instance from the ID
                try:
                    sidebar_item = SidebarItem.objects.get(id=sideBarItemid)
                except SidebarItem.DoesNotExist:
                    return HttpResponseBadRequest("Invalid sidebarItemId")

                # Save the filtered file metadata to CsvData
                filtered_csv_data = CsvData(file=os.path.join('filtered_uploads', filtered_file_name), file_size=os.path.getsize(filtered_file_path), sidebar_item=sidebar_item)
                filtered_csv_data.save()
            except FileNotFoundError as e:
                return HttpResponseServerError("Error saving filtered file")

            # Get the latest graph by t_graph_id
            try:
                latest_graph = Graph.objects.filter(t_graph_id=t_graph_id).order_by('-created_at').first()
                if not latest_graph:
                    return JsonResponse({'error': 'No graph found for the given t_graph_id'}, status=404)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)

            execute_code_request = {
                'file_id': filtered_csv_data.id,
                'code': latest_graph.code,
                't_graph_id': t_graph_id
            }

            response = execute_code(SimpleNamespace(method='POST', POST=execute_code_request))
            return response

        else:
            return HttpResponseBadRequest("Unsupported Content-Type")
    else:
        return HttpResponseBadRequest("Only POST method is allowed")

    
@csrf_exempt

def get_available_segment_columns(request):
    if request.method == 'GET':
        file_id = request.GET.get('file_id')

        logger.debug(f"Full query string: {request.META.get('QUERY_STRING', '')}")
        logger.debug(f"Received file_id: {file_id}")

        if file_id:
            try:
                csv_data = CsvData.objects.get(id=file_id)
                file = csv_data.file
                file_path = default_storage.path(file.name)

                if not os.path.exists(file_path):
                    with default_storage.open(file.name, 'rb') as src_file:
                        with open(file_path, 'wb') as dst_file:
                            dst_file.write(src_file.read())

                if file.name.lower().endswith('.csv'):
                    df = pd.read_csv(file_path)
                elif file.name.lower().endswith(('.xls', '.xlsx')):
                    df = pd.read_excel(file_path, engine='openpyxl' if file.name.lower().endswith('.xlsx') else 'xlrd')
                else:
                    return HttpResponseBadRequest("Unsupported file format")

                columns = list(df.columns)
                logger.debug(f"Columns found: {columns}")
                return JsonResponse({'columns': columns})

            except Exception as e:
                logger.error(f"Error processing file {file.name}: {e}")
                return JsonResponse({'error': f'Error processing file {file.name}'}, status=500)

        else:
            logger.error("File ID is missing from the request.")
            return HttpResponseBadRequest("File ID is required")

    else:
        logger.error("Request method is not GET.")
        return HttpResponseBadRequest("Only GET method is allowed")
@csrf_exempt
def delete_files(request):
    if request.method == 'POST':
        try:
            file_id = request.POST.get('file_id')  # Récupérer un seul file_id

            if not file_id:
                return HttpResponseBadRequest("Missing file ID")

            try:
                csv_data = CsvData.objects.get(id=file_id)
                file_path = csv_data.file.path
                csv_data.delete()  # Supprimer l'enregistrement du fichier dans la base de données

                if os.path.exists(file_path):
                    os.remove(file_path)  # Supprimer le fichier physique si existant
            except CsvData.DoesNotExist:
                logger.warning(f"File with ID {file_id} not found")
                return JsonResponse({'error': 'File not found'}, status=404)

            return JsonResponse({'status': 'success', 'message': 'File deleted successfully'})

        except Exception as e:
            logger.error('Unexpected error: %s', e)
            return JsonResponse({'error': 'An unexpected error occurred.'}, status=500)

    else:
        return HttpResponseBadRequest("Only POST method is allowed")

@csrf_exempt
def delete_filess(request):
    if request.method == 'POST':
        try:
            file_ids = request.POST.getlist('file_ids')  

            if not file_ids:
                return HttpResponseBadRequest("Missing file IDs")

            for file_id in file_ids:
                try:
                    csv_data = CsvData.objects.get(id=file_id)
                    file_path = csv_data.file.path
                    csv_data.delete()  

                    if os.path.exists(file_path):
                        os.remove(file_path)
                except CsvData.DoesNotExist:
                    logger.warning(f"File with ID {file_id} not found")
                    continue

            return JsonResponse({'status': 'success', 'message': 'Files deleted successfully'})

        except Exception as e:
            logger.error('Unexpected error: %s', e)
            return JsonResponse({'error': 'An unexpected error occurred.'}, status=500)

    else:
        return HttpResponseBadRequest("Only POST method is allowed")
@csrf_exempt
def get_unique_values(request):
    if request.method == 'POST':
        try:
            file_ids = request.POST.getlist('file_ids[]')
            column = request.POST.get('column', '').strip()

            if not file_ids or not column:
                return HttpResponseBadRequest("Missing file IDs or column")

            unique_values = set()
            valid_file_ids = []  

            for file_id in file_ids:
                try:
                    csv_data = CsvData.objects.get(id=file_id)
                    file = csv_data.file
                    valid_file_ids.append(int(file_id))  
                except CsvData.DoesNotExist:
                    continue  

                file_path = default_storage.path(file.name)
                if not os.path.exists(file_path):
                    with default_storage.open(file.name, 'rb') as src_file:
                        with open(file_path, 'wb') as dst_file:
                            dst_file.write(src_file.read())

                if file.name.lower().endswith('.csv'):
                    df = pd.read_csv(file_path)
                elif file.name.lower().endswith(('.xls', '.xlsx')):
                    df = pd.read_excel(file_path, engine='openpyxl' if file.name.lower().endswith('.xlsx') else 'xlrd')
                else:
                    continue  

                df.columns = df.columns.str.strip()

                if column in df.columns:
                    col_values = df[column].dropna().unique()
                    for value in col_values:
                        if isinstance(value, (np.int64, np.int32)):
                            unique_values.add(int(value))
                        elif isinstance(value, (np.float64, np.float32)):
                            unique_values.add(float(value))
                        elif isinstance(value, np.datetime64):
                            formatted_date = pd.to_datetime(value).strftime('%Y-%m-%d')
                            unique_values.add(formatted_date)
                        else:
                            unique_values.add(str(value))
                else:
                    continue  

            sorted_unique_values = sorted(unique_values)

            return JsonResponse({
                'unique_values': sorted_unique_values,
                'file_ids': valid_file_ids,  
                'column': column  
            })

        except Exception as e:
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

    return HttpResponseBadRequest("Only POST method is allowed")
@csrf_exempt


def get_available_years(request):
    if request.method == 'GET':
        try:
            years = set()

            csv_files = CsvData.objects.all()

            for csv_data in csv_files:
                file = csv_data.file
                file_path = default_storage.path(file.name)

                if not os.path.exists(file_path):
                    with default_storage.open(file.name, 'rb') as src_file:
                        with open(file_path, 'wb') as dst_file:
                            dst_file.write(src_file.read())

                if file.name.lower().endswith('.csv'):
                    df = pd.read_csv(file_path,encoding='utf-8')
                elif file.name.lower().endswith(('.xls', '.xlsx')):
                    df = pd.read_excel(file_path, engine='openpyxl' if file.name.lower().endswith('.xlsx') else 'xlrd')
                else:
                    return HttpResponseBadRequest("Unsupported file format")

                for column in df.columns:
                    try:
                        df[column] = pd.to_datetime(df[column], format='%d/%m/%Y', errors='coerce')  # Specify the format
                        if df[column].dropna().dt.year.notnull().any():
                            years.update(df[column].dropna().dt.year.unique().astype(int))
                    except Exception as e:
                        logger.warning(f"Column '{column}' could not be converted to datetime: {e}")

            sorted_years = sorted(map(int, years)) 

            return JsonResponse({'years': sorted_years})

        except Exception as e:
            logger.error('Unexpected error: %s', e)
            return JsonResponse({'error': 'An unexpected error occurred.'}, status=500)

    else:
        return HttpResponseBadRequest("Only GET method is allowed")

@csrf_exempt
def filter_graph_by_chronology(request):
    if request.method == 'POST':
        try:
            logger.debug("Received POST request for filtering graphs by chronology.")

            years = request.POST.getlist('years')  
            months = request.POST.getlist('months')  
            start_month = request.POST.get('start_month')
            end_month = request.POST.get('end_month')

            logger.debug(f"Filter parameters received: years={years}, months={months}, start_month={start_month}, end_month={end_month}")

            if not (years or months or (start_month and end_month)):
                logger.error("Missing years, months, or date range.")
                return HttpResponseBadRequest("Missing years, months, or date range")

            years = [int(year) for year in years if year.isdigit()]
            months = [int(month) for month in months if month.isdigit()]
            start_month = int(start_month) if start_month and start_month.isdigit() else None
            end_month = int(end_month) if end_month and end_month.isdigit() else None

            logger.debug(f"Converted filter parameters: years={years}, months={months}, start_month={start_month}, end_month={end_month}")

            graphs = Graph.objects.all()
            logger.debug(f"Total graphs retrieved: {graphs.count()}")

            file_ids = set(graph.csv_data.id for graph in graphs)
            logger.debug(f"Unique file IDs retrieved: {file_ids}")

            graph_results = []
            for file_id in file_ids:
                try:
                    csv_data = CsvData.objects.get(id=file_id)
                    file = csv_data.file
                    logger.debug(f"Processing file: {file.name} (ID: {file_id})")
                except CsvData.DoesNotExist:
                    logger.error(f"CsvData with ID {file_id} does not exist.")
                    continue

                file_path = default_storage.path(file.name)
                if not os.path.exists(file_path):
                    with default_storage.open(file.name, 'rb') as src_file:
                        with open(file_path, 'wb') as dst_file:
                            dst_file.write(src_file.read())
                    logger.debug(f"File copied to local storage: {file_path}")

                if file.name.lower().endswith('.csv'):
                    df = pd.read_csv(file_path)
                elif file.name.lower().endswith(('.xls', '.xlsx')):
                    df = pd.read_excel(file_path, engine='openpyxl' if file.name.lower().endswith('.xlsx') else 'xlrd')
                else:
                    logger.warning(f"Unsupported file format for file: {file.name}")
                    continue

                df.columns = [col.strip() for col in df.columns]
                logger.debug(f"Data columns after stripping: {df.columns.tolist()}")

                filtered_df = pd.DataFrame()  

                for column in df.columns:
                    logger.debug(f"Processing column: {column}")
                    if pd.api.types.is_datetime64_any_dtype(df[column]):
                        df[column] = pd.to_datetime(df[column], errors='coerce')

                        if years:
                            df = df[df[column].dt.year.isin(years)]
                            logger.debug(f"Data filtered by years: {years}")

                        if months:
                            df = df[df[column].dt.month.isin(months)]
                            logger.debug(f"Data filtered by months: {months}")

                        if start_month is not None and end_month is not None:
                            df = df[(df[column].dt.month >= start_month) & (df[column].dt.month <= end_month)]
                            logger.debug(f"Data filtered by month range: {start_month} - {end_month}")

                        filtered_df = df  
                        logger.debug(f"Filtered DataFrame shape: {filtered_df.shape}")

                        if not filtered_df.empty:
                            break 

                if filtered_df.empty:
                    logger.warning(f"No data left after filtering for file ID {file_id}.")
                    continue

                graphs = Graph.objects.filter(csv_data=csv_data).order_by('id')
                if not graphs:
                    logger.warning(f"No graphs found for file ID {file_id}")
                    continue

                for graph in graphs:
                    graph_code = graph.code
                    logger.debug(f"Processing graph ID: {graph.id} with code.")

                    try:
                        plt.figure(figsize=(10, 6))
                        exec_globals = {'pd': pd, 'plt': plt, 'io': io, 'base64': base64, 'df': filtered_df}
                        exec_locals = {}

                        exec(graph_code, exec_globals, exec_locals)
                        image_base64 = exec_locals.get('image_base64', '')

                        if not image_base64:
                            logger.warning(f"No image_base64 generated for graph ID: {graph.id}")
                            continue

                        plt.close()

                        graph_results.append({
                            'image_base64': image_base64
                        })

                    except Exception as e:
                        logger.error(f"Error generating graph ID {graph.id}: {traceback.format_exc()}")

            if graph_results:
                logger.debug(f"Returning results: {graph_results}")
                return JsonResponse({'graphs': graph_results})

            logger.error("No results to return after filtering.")
            return HttpResponseServerError("No results to return after filtering")

        except Exception as e:
            logger.error(f"Unexpected error: {traceback.format_exc()}")
            return JsonResponse({'error': 'An unexpected error occurred.'}, status=500)

    else:
        logger.error("Only POST method is allowed.")
        return HttpResponseBadRequest("Only POST method is allowed")


@csrf_exempt
def get_date_columns(request):
    if request.method == 'GET':
        try:
            date_columns = set()
            
            csv_data_records = CsvData.objects.all()
            
            for csv_data in csv_data_records:
                file = csv_data.file
                file_path = default_storage.path(file.name)
                
                if not os.path.exists(file_path):
                    with default_storage.open(file.name, 'rb') as src_file:
                        with open(file_path, 'wb') as dst_file:
                            dst_file.write(src_file.read())
                
                if file.name.lower().endswith('.csv'):
                    df = pd.read_csv(file_path)
                elif file.name.lower().endswith(('.xls', '.xlsx')):
                    df = pd.read_excel(file_path, engine='openpyxl' if file.name.lower().endswith('.xlsx') else 'xlrd')
                else:
                    return HttpResponseBadRequest("Unsupported file format")
                
                df.columns = [col.strip() for col in df.columns]

                for column in df.columns:
                    try:
                        converted_dates = pd.to_datetime(df[column], infer_datetime_format=True, errors='coerce')
                        if converted_dates.notna().any() and not pd.api.types.is_numeric_dtype(df[column]):
                            date_columns.add(column)
                    except (ValueError, TypeError):
                        continue

            return JsonResponse({'date_columns': list(date_columns)})

        except Exception as e:
            logger.error('Unexpected error: %s', e)
            return JsonResponse({'error': 'An unexpected error occurred.'}, status=500)

    else:
        return HttpResponseBadRequest("Only GET method is allowed")

@csrf_exempt
def show_session_key(request):
    if request.method == 'GET':
        session_key = request.session.session_key
        return JsonResponse({'session_key': session_key})
    else:
        return HttpResponseBadRequest("Only GET method is allowed")
@csrf_exempt
def initialize_session(request):
    request.session['user'] = 'example_user'
    return JsonResponse({'status': 'Session initialized'})    
@csrf_exempt

def set_session_data(request):
    if request.method == 'POST':
        data = request.POST.get('data')
        request.session['my_data'] = data
        return JsonResponse({'status': 'Data saved to session'})
    return JsonResponse({'error': 'Invalid request'}, status=400)
@csrf_exempt

def get_session_data(request):
    data = request.session.get('my_data', 'No data found')
    return JsonResponse({'my_data': data})


from django.db.models import Max

@api_view(['POST'])
def get_last_graphs_by_t_graph_and_csv_data(request):
    try:
        t_graph_ids = request.data.get('t_graph_ids', [])
        csv_data_id = request.data.get('csv_data_id', None)

        # Vérifiez les filtres fournis
        if not t_graph_ids or not csv_data_id:
            return Response({'error': 't_graph_ids and csv_data_id are required'}, status=400)

        # Requête pour obtenir le dernier graph par t_graph et csv_data
        latest_graphs = (
            Graph.objects.filter(t_graph__Img_Id__in=t_graph_ids, csv_data_id=csv_data_id)
            .values('t_graph', 'csv_data')
            .annotate(latest_created_at=Max('created_at'))  # Obtenir la date max
        )

        # Charger les objets correspondants
        result = [
            Graph.objects.get(t_graph_id=graph['t_graph'], csv_data_id=graph['csv_data'], created_at=graph['latest_created_at'])
            for graph in latest_graphs
        ]

        # Préparer les données pour la réponse
        response_data = [
            {
                'id': graph.id,
                't_graph': graph.t_graph.Img_Id if graph.t_graph else None,
                'csv_data': graph.csv_data.id,
                'image_url': graph.image_base64,
                'code': graph.code,
                'created_at': graph.created_at,
            }
            for graph in result
        ]

        if not response_data:
            return Response({'error': 'No graphs found for the given criteria'}, status=404)

        return Response(response_data)
    except Exception as e:
        print(f"Unexpected error: {e}")
        return Response({'error': str(e)}, status=500)
