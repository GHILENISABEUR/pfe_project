from django.urls import path, include
from . import views
from .views import (
    CategoryDetail,VisualsByWebsite, CategoryListCreate , CategoryByWebsite,DataListCreateAPIView, DataRetrieveUpdateDestroyAPIView, TableListCreateView,TableDetailView,FieldListCreateView,FieldDetailView,CreateForeignKeyAPIView
)
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('graph/', include('graph.urls')),  # Includes graph app URLs
    path('categories/', CategoryListCreate.as_view()),
    path('categories/website/<int:website_id>/', CategoryByWebsite.as_view(), name='category-by-website'),
    path('categories/<int:pk>/', CategoryDetail.as_view()),
    path('categories/<str:name>/', CategoryListCreate.as_view(), name='category-detail-by-name'),
    path('tables/', TableListCreateView.as_view()),
    path('tables/<int:pk>', TableDetailView.as_view()),
    path('tables/<int:pk>/category/<int:category_id>/', views.UpdateTableCategory.as_view(), name='update_table_category'),
    path('create-foreign-key/', CreateForeignKeyAPIView.as_view(), name='create-foreign-key'),
    path('dynamic-joined-data/', views.dynamic_joined_data_view, name='dynamic_joined_data'),
    path('get-table-data/<str:table_name>/', views.get_table_data, name='get_table_data'),
    path('fields/', FieldListCreateView.as_view()),
    path('fields/<int:pk>/', FieldDetailView.as_view()),
    path('data/', DataListCreateAPIView.as_view()),
    path('data/<int:pk>/', DataRetrieveUpdateDestroyAPIView.as_view()),
    path('visuals/', views.VisualsListCreate.as_view(), name='visuals-list-create'),
    path('visuals/website/<int:website_id>/', VisualsByWebsite.as_view(), name='visuals-by-website'),

    path('visuals/<int:pk>/', views.VisualsDetail.as_view(), name='visuals-detail'),
    path('external/tables/', views.get_tables),
    path('external/fields/<str:table_name>/', views.get_fields),
    path('external/values/<str:table_name>/<str:field_name>/', views.get_values),
   path('external/fetch_table/<str:table_name>/', views.fetch_table, name='fetch_table'),
 
]