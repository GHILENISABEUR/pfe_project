from django.urls import re_path, path
from GestionBI import views
from django.conf import settings
from django.conf.urls.static import static
from .views import get_graphs  # Import the get_graphs function
from .views import update_graph_position  # Import the view here
from .views import delete_document  # Import the view here
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SidebarViewSet, SidebarItemViewSet,get_sidebar_items,create_graph_with_item
from .views import SelectedSegmentListCreateView, SelectedSegmentDeleteView
from .views import update_selected_segment

router = DefaultRouter()
router.register(r'sidebars', SidebarViewSet)
router.register(r'sidebar-items', SidebarItemViewSet)

urlpatterns = [ 
path('selected-segments/<int:pk>/', update_selected_segment, name='update-selected-segment'),
path('selected-segments/', SelectedSegmentListCreateView.as_view(), name='selected-segments-list-create'),
path('selected-segment/<int:pk>/', SelectedSegmentDeleteView.as_view(), name='selected-segment-delete'),
re_path(r'^compile_code/([0-9]+)$',views.compile_code),
re_path(r'^save_code/$',views.save_data_code),
re_path(r'^crud_code/([0-9]+)$',views.crud_code_python),
re_path(r'^correct_code/([0-9]+)$',views.correct_code),
re_path(r'^add_new_data_set/([0-9]+)/([0-9]+)$',views.add_new_data_set),
re_path(r'^update_principle_graph/$',views.update_principle_graph),
re_path(r'^update_related_graph/$',views.update_related_graph),
re_path(r'^get_code_by_id/([0-9]+)$',views.get_code_by_id),
re_path(r'^get_reports/$',views.get_reports),
re_path(r'^get_decisions/$',views.get_decisions),
    path('get_actions/', views.get_actions, name='get_actions'),
re_path(r'^update_report/([0-9]+)$',views.update_report),
re_path(r'^add_new_Report/([0-9]+)$',views.add_new_Report),
re_path(r'^update_decision/([0-9]+)$',views.update_decision),
re_path(r'^delete_report/([0-9]+)$',views.delete_report),
re_path(r'^delete_decision/([0-9]+)$',views.delete_decision),
re_path(r'^add_new_Decision/([0-9]+)$',views.add_new_Decision),
re_path(r'^update_action/([0-9]+)$',views.update_action),
re_path(r'^delete_action/([0-9]+)$',views.delete_action),
re_path(r'^add_action/([0-9]+)$',views.add_action),
re_path(r'^get_causes_consequences/$',views.get_causes_consequences),
re_path(r'^add_cause_to_code/([0-9]+)/([0-9]+)$',views.add_cause_to_code),
re_path(r'^add_consequence_to_code/([0-9]+)/([0-9]+)$',views.add_consequence_to_code),
re_path(r'^delete_cause_from_code/([0-9]+)/([0-9]+)$',views.delete_cause_from_code),
re_path(r'^delete_consequence_from_code/([0-9]+)/([0-9]+)$',views.delete_consequence_from_code),
#re_path(r'^get_all_graphs/$',views.get_all_codes),
path('create_or_update_responsible_Realisation/<int:action_id>/', views.create_or_update_responsible_Realisation, name='create_or_update_responsible_Realisation'),
    path('create_or_update_responsible_validation/', views.create_or_update_responsible_validation, name='create_or_update_responsible_validation'),
    path('get_documents_submitted/<int:id>/', views.get_documents_submitted_by_action, name='get_documents_submitted'),
    path('get_documents_validated/<int:id>/', views.get_documents_validated_by_action, name='get_documents_validated'),
path('create_document_submitted/<int:id>/', views.create_document_submitted_in_action, name='create_document_submitted'),
    path('create_document_validated/<int:id>/', views.create_document_validated_in_action, name='create_document_validated'),
path('delete_document/<int:id>/', views.delete_document, name='delete_document'),
re_path(r'^graphs$', views.get_all_graphs),
path('graphs/<int:graph_id>/position/', update_graph_position, name='update_graph_position'),

path('api/graphs/', get_graphs, name='get_graphs'),
path('update_graph/<int:pk>/', views.update_graph, name='update_graph'),
path('save_causes/<int:code_id>/', views.save_causes, name='save_causes'),
path('save_consequences/<int:code_id>/', views.save_consequences, name='save_consequences'),
path('delete_graph/<int:pk>/', views.delete_graph, name='delete_graph'),
re_path(r'^create_graph/$', views.create_graph),  # This should match the URL called from Angular
path('get_action_by_id/<int:action_id>/', views.get_action_by_id, name='get_action_by_id'),

path('responsible_realisation/<int:id>/', views.get_responsible_realisation_by_id, name='get_responsible_realisation_by_id'),
    path('responsible_validation/<int:id>/', views.get_responsible_validation_by_id, name='get_responsible_validation_by_id'),
    path('update_graph_size/<int:graph_id>/', views.update_graph_size, name='update_graph_size'),
      path('', include(router.urls)),
    path('sidebars/<int:sidebar_id>/items/', SidebarItemViewSet.as_view({'get': 'list', 'post': 'create'}), name='sidebar-items'),
    path('sidebar-items/<int:sidebar_id>/', get_sidebar_items, name='get_sidebar_items'),
    path('sidebar-items/<int:sidebar_item_id>/', get_sidebar_items, name='get_sidebar_items'),
path('graphs/item/<int:sidebar_item_id>/', views.get_graphs_by_item, name='get_graphs_by_item'),
    path('create_graph_with_item/', create_graph_with_item, name='create_graph_with_item'),

]



if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)