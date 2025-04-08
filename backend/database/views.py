from django.db import connection
from django.shortcuts import get_object_or_404
from rest_framework import generics,status
from django.apps import apps
from django.http import JsonResponse
from django.db import connection
from .models import  Category,  Table, Field, Data, Visuals
from .serializers import  CategorySerializer,TableSerializer, FieldSerializer,DataSerializer, VisualsSerializer
from rest_framework.response import Response
import logging
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.db import connection
logger = logging.getLogger(__name__)

class CategoryListCreate(generics.ListCreateAPIView):
   queryset = Category.objects.all()
   serializer_class = CategorySerializer
   
    

class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.prefetch_related('tables')
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        new_category_id = request.query_params.get('new_category_id')

        if new_category_id:
            # Passez l'ID de la nouvelle catégorie lors de la suppression
            instance.delete(new_category_id=new_category_id)
        else:
            return Response({'error': 'New category ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
class CategoryByWebsite(generics.ListAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):
        website_id = self.kwargs['website_id']
        return Category.objects.filter(website_id=website_id)

class TableListCreateView(generics.ListCreateAPIView):
    serializer_class = TableSerializer

    def get_queryset(self):
        queryset = Table.objects.all()
        category_id = self.request.query_params.get('categoryId')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset
    

class TableDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    

# views.py



class VisualsByWebsite(generics.ListAPIView):
    serializer_class = VisualsSerializer

    def get_queryset(self):
        website_id = self.kwargs['website_id']
        return Visuals.objects.filter(website_id=website_id)


from django.http import JsonResponse
from django.db import connection

def get_foreign_key_relationships(selected_tables):
    """
    Function to discover foreign key relationships between selected tables.
    """
    relationships = []
    with connection.cursor() as cursor:
        for table_name in selected_tables:
            cursor.execute(f"""
                SELECT
                    tc.table_name AS source_table,
                    kcu.column_name AS source_column,
                    ccu.table_name AS target_table,
                    ccu.column_name AS target_column
                FROM
                    information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu 
                    ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu 
                    ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND (tc.table_name = '{table_name}' OR ccu.table_name = '{table_name}')
            """)
            rows = cursor.fetchall()
            for row in rows:
                relationships.append({
                    'source_table': row[0],
                    'source_column': row[1],
                    'target_table': row[2],
                    'target_column': row[3]
                })
    return relationships

def build_where_conditions(relationships):
    """
    Function to build WHERE conditions based on foreign key relationships.
    """
    conditions = []
    for rel in relationships:
        conditions.append(
            f"{rel['source_table']}.{rel['source_column']} = {rel['target_table']}.{rel['target_column']}"
        )
        print(f"Building WHERE condition for relationship: {rel}")

    print(f"Built WHERE conditions: {conditions}")
    return conditions

def dynamic_joined_data_view(request):
    table_names = [table_name.lower() for table_name in request.GET.getlist('tables', [])]
    fields_to_show = request.GET.getlist('fields', [])

    # Validate input
    if len(table_names) < 1 or len(fields_to_show) < 1:
        return JsonResponse({
            'error': 'At least one table name and at least one field to show are required.',
            'received_tables': table_names,
            'received_fields': fields_to_show
        }, status=400)

    # Retrieve all foreign key relationships between selected tables
    relationships = get_foreign_key_relationships(table_names)
    print(f"Found Relationships: {relationships}")

    # Filter relationships to only include those involving selected tables
    filtered_relationships = []
    print(f"Table names: {table_names}")
    for rel in relationships:
        if rel['source_table'] in table_names and rel['target_table'] in table_names:
            filtered_relationships.append(rel)
        print(f"relationship: {rel}")
        print(rel['source_table'])
        print(rel['target_table'])
        print(rel['source_table'] in table_names and rel['target_table'] in table_names)
    # Build WHERE conditions based on filtered relationships
    where_conditions = build_where_conditions(filtered_relationships)
    where_clause = " AND ".join(where_conditions)

    # Constructing the SELECT clause dynamically based on fields_to_show
    select_clause = ', '.join(fields_to_show)

    # Construct the final query with comma-separated tables and WHERE conditions
    tables_clause = ", ".join(table_names)
    query = f"""
        SELECT {select_clause}
        FROM {tables_clause}
        WHERE {where_clause}
    """

    # Print or log the constructed query for debugging
    print(f"Constructed SQL Query: {query}")

    try:
        with connection.cursor() as cursor:
            cursor.execute(query)
            columns = [col[0] for col in cursor.description]
            joined_data = [
                dict(zip(columns, row))
                for row in cursor.fetchall()
            ]
    except Exception as e:
        return JsonResponse({
            'error': f'Error executing SQL query: {str(e)}'
        }, status=500)

    return JsonResponse(joined_data, safe=False)

def get_table_data(request, table_name):
    try:
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT * FROM {table_name};")
            columns = [col[0] for col in cursor.description]
            table_data = [
                dict(zip(columns, row))
                for row in cursor.fetchall()
            ]
        return JsonResponse(table_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
class VisualsListCreate(generics.ListCreateAPIView):
    queryset = Visuals.objects.all()
    serializer_class = VisualsSerializer

class VisualsDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Visuals.objects.all()
    serializer_class = VisualsSerializer
    
class FieldListCreateView(generics.ListCreateAPIView):  
    serializer_class = FieldSerializer

    def get_queryset(self):

        queryset = Field.objects.all()
        table_id = self.request.query_params.get('tableId', None)
        if table_id is not None:
            queryset = queryset.filter(table__id=table_id)
        return queryset
    
class FieldDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Field.objects.all()
    serializer_class = FieldSerializer
     
class DataListCreateAPIView(generics.ListCreateAPIView):
    queryset = Data.objects.all()
    serializer_class = DataSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        table_id = self.request.query_params.get('tableId')
        
        if table_id:
            queryset = queryset.filter(table_id=table_id)
        return queryset
    
    def post(self, request, *args, **kwargs):
        print(request.data)
        logger.debug(f"Request data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)



class DataRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Data.objects.all()
    serializer_class = DataSerializer
    
    def put(self, request, *args, **kwargs):
        partial = True  # Always allow partial updates in PUT
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            logger.error("Serializer errors: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        table=Table.objects.get(id=instance.table_id)
        print(table)
        tableName=table.name
        print("the table name is ",tableName)
        self.perform_update(serializer)
        return Response(serializer.data)
class UpdateTableCategory(APIView):
    def put(self, request, pk, category_id):
        try:
            table = Table.objects.get(id=pk)
            table.category_id = category_id  # Update the category_id field
            table.save()
            return Response(status=status.HTTP_200_OK)
        except Table.DoesNotExist:
            return Response({'error': 'Table not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CreateForeignKeyAPIView(APIView):
    def post(self, request, *args, **kwargs):
        from_table_name = request.data.get('from_table')
        to_table_name = request.data.get('to_table')
        from_column = request.data.get('from_column')
        to_column = request.data.get('to_column')

        if not all([from_table_name, to_table_name, from_column, to_column]):
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with connection.cursor() as cursor:
                sql_command = f"""
                ALTER TABLE {from_table_name}
                ADD CONSTRAINT fk_{from_table_name}_{to_table_name}
                FOREIGN KEY ({from_column})
                REFERENCES {to_table_name} ({to_column})
                ON DELETE CASCADE;
                """
                cursor.execute(sql_command)
            return Response({'status': 'Foreign key created successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating foreign key: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import psycopg2

@csrf_exempt
def get_tables(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        tables = fetch_tables(data)
        return JsonResponse(tables, safe=False)

@csrf_exempt
def get_fields(request, table_name):
    if request.method == 'POST':
        data = json.loads(request.body)
        fields = fetch_fields(data, table_name)
        return JsonResponse(fields, safe=False)

@csrf_exempt
def get_values(request, table_name, field_name):
    if request.method == 'POST':
        data = json.loads(request.body)
        values = fetch_values(data, table_name, field_name)
        return JsonResponse(values, safe=False)

def fetch_tables(data):
    connection = psycopg2.connect(
        dbname=data['databaseName'],
        user=data['username'],
        password=data['password'],
        host=data['host'],
        port=data['port']
    )
    cursor = connection.cursor()
    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    tables = [row[0] for row in cursor.fetchall()]
    cursor.close()
    connection.close()
    return tables

def fetch_fields(data, table_name):
    connection = psycopg2.connect(
        dbname=data['databaseName'],
        user=data['username'],
        password=data['password'],
        host=data['host'],
        port=data['port']
    )
    cursor = connection.cursor()
    cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name='{table_name}'")
    fields = [row[0] for row in cursor.fetchall()]
    cursor.close()
    connection.close()
    return fields

def fetch_values(data, table_name, field_name):
    connection = psycopg2.connect(
        dbname=data['databaseName'],
        user=data['username'],
        password=data['password'],
        host=data['host'],
        port=data['port']
    )
    cursor = connection.cursor()
    cursor.execute(f"SELECT {field_name} FROM {table_name}")
    values = [row[0] for row in cursor.fetchall()]
    cursor.close()
    connection.close()
    return values


from django.views.decorators.csrf import csrf_exempt

# fetch a whole table from another db 
@csrf_exempt
def fetch_table(request, table_name):
    if request.method == 'POST':
        data = json.loads(request.body)
        table_info = get_table_info(data, table_name)
        return JsonResponse(table_info, safe=False)

def get_table_info(data, table_name):
    connection = psycopg2.connect(
        dbname=data['databaseName'],
        user=data['username'],
        password=data['password'],
        host=data['host'],
        port=data['port']
    )
    cursor = connection.cursor()
    
    # Fetch field names and types
    cursor.execute(f"""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '{table_name}'
        ORDER BY ordinal_position
    """)
    fields = [{'name': row[0], 'field_type': row[1]} for row in cursor.fetchall()]

    # Fetch all data
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    data = [dict(zip([field['name'] for field in fields], row)) for row in rows]
    
    cursor.close()
    connection.close()
    
    return {'fields': fields, 'data': data}