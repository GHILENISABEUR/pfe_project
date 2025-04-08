from django.db import models
from GestionBI.models import T_graphs
from GestionBI.models import SidebarItem

class CsvData(models.Model):
    file = models.FileField(upload_to='uploads/', default='default_file.csv')  
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_size = models.PositiveIntegerField(null=True, blank=True)  # Nouveau champ pour la taille du fichier en octets
    sidebar_item = models.ForeignKey(SidebarItem, on_delete=models.CASCADE, related_name='item_graphs', null=True, blank=True)  # New field


    def __str__(self):
        return f"CSV Data {self.id}"

class Graph(models.Model):
    csv_data = models.ForeignKey(CsvData, on_delete=models.CASCADE, related_name='graphs')  
    image_url = models.URLField(blank=True, null=True)  # URL  graph image
    image_base64 = models.TextField(blank=True, null=True)  # Base64 encoded graph image
    code = models.TextField()  # Code 
    created_at = models.DateTimeField(auto_now_add=True)  
    t_graph = models.ForeignKey(T_graphs, on_delete=models.CASCADE, related_name='generated_graphs', null=True, blank=True)


    def __str__(self):
        return f"Graph {self.id} for CSV Data {self.csv_data.id}"
