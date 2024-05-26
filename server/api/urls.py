from django.urls import path, include
from . import views

urlpatterns = [
    path("", views.upload_file, name="Home"),
    path("view/<str:id>", views.file_preview_controller, name="Preview"),
    path("edit/<str:id>", views.preprocess_data, name="edit"),
    path("plots/<str:id>", views.data_visualization_controller, name="Dashboard"),
]
