from django.urls import path
from . import views
from .views import FrameElementView, FrameView, WebSiteView

urlpatterns = [
    path('table/<int:table_id>/', views.get_by_id, name='table-get-by-id'),
    path('table/create', views.create_table, name='table-create'),
    path('table/', views.get_tables_by_website, name='get_tables_by_website'),
    path('table/update/<int:table_id>', views.update_table, name='table-update'),
    path('table/delete/<int:table_id>/', views.delete_table, name='table-delete'),

    path('frame/byid/<str:key>/', FrameView.getById, name='frame'),
    path('frame/create/', FrameView.create, name='frame'),
    path('frame/', FrameView.getAll, name='frame'),
    path('frame/update/<str:frame_id>/', FrameView.update, name='frame'),
    path('frame/bywebsite/<str:key>/', FrameView.getByWebSite, name='frame'),
    path('frame/delete/<str:frame_id>/', FrameView.delete, name='frame'),

    path('website/byid/<str:key>/', WebSiteView.getById, name='website'),
    path('website/create/', WebSiteView.create, name='website'),
    path('website/', WebSiteView.getAll, name='website'),
    path('website/update/<str:website_id>/', WebSiteView.update, name='website'),
    path('website/delete/<str:website_id>/', WebSiteView.delete, name='website'),

    path('element/create/', FrameElementView.create, name='element'),
    path('element/', FrameElementView.getAll, name='element'),
    path('element/update/<str:frame_id>/', FrameElementView.update, name='element'),
    path('element/byframe/<str:key>/', FrameElementView.getByFrame, name='element'),
    path('element/delete/<str:frameElement_id>/', FrameElementView.delete, name='element'),

    path('texts/create/', views.create_text, name='create_text'),
    path('texts/<int:pk>/', views.get_text, name='get_text'),
    path('texts/<int:pk>/update/', views.update_text, name='update_text'),
    path('texts/<int:pk>/delete/', views.delete_text, name='delete_text'),
    path('texts/', views.get_texts, name='get_texts'),
    path('texts/webside/<int:website>/', views.get_text_webside, name='get_text_webside'),
    path('texts/webside/<int:website>/frame/<int:frame_id>/', views.get_text_webside_frame, name='get_text_webside_frame'),

    path('input_fields/', views.get_input_fields, name='get_input_fields'),
    path('input_fields/create/', views.create_input_field, name='create_input_field'),
    path('input_fields/<int:input_field_id>/update/', views.update_input_field, name='update_input_field'),
    path('input_fields/<int:input_field_id>/delete/', views.delete_input_field, name='delete_input_field'),
    path('input_fields/webside/<int:website>/', views.get_input_fields_webside, name='get_input_fields_webside'),
    path('input_fields/webside/<int:website>/frame/<int:frame_id>/', views.get_input_fields_webside_frame, name='get_input_fields_webside_frame'),

    path('images/', views.get_images, name='get_images'),
    path('images/create/', views.create_image, name='create_image'),
    path('images/<int:image_id>/', views.get_image, name='get_image'),
    path('images/<int:image_id>/update/', views.update_image, name='update_image'),
    path('images/<int:image_id>/delete/', views.delete_image, name='delete_image'),
    path('images/webside/<int:website>/', views.get_images_webside, name="get_images_webside"),
    path('images/webside/<int:website>/frame/<int:frame_id>/', views.get_images_webside_frame, name='get_images_webside_frame'),

    path('buttons/create/', views.create_button, name='create_button'),
    path('buttons/<int:pk>/update/', views.update_button, name='update_button'),
    path('buttons/<int:pk>/delete/', views.delete_button, name='delete_button'),
    path('buttons/<int:pk>/', views.get_button, name='get_button'),
    path('buttons/', views.get_buttons, name='get_buttons'),
    path('buttons/webside/<int:website>/', views.get_button_webside, name='get_button_webside'),
    path('buttons/webside/<int:website>/frame/<int:frame_id>/', views.get_button_webside_frame, name='get_button_webside_frame'),
]
