from django.db import models

class Sidebar(models.Model):
    name = models.CharField(max_length=255)
    style = models.CharField(max_length=255)
    position_x = models.IntegerField(default=0)  # X-coordinate of the sidebar
    position_y = models.IntegerField(default=0)  # Y-coordinate of the sidebar
    width = models.IntegerField(default=250)     # Width of the sidebar
    height = models.IntegerField(default=600)    # Height of the sidebar
    toggles = models.JSONField(default=dict)     # Store the toggle states as a JSON object

    def __str__(self):
        return self.name

class SidebarItem(models.Model):
    title = models.CharField(max_length=255)
    url = models.URLField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, related_name='children', null=True, blank=True)
    sidebar = models.ForeignKey(Sidebar, on_delete=models.CASCADE, related_name='items', default=1)
    linked_sidebar = models.ForeignKey(Sidebar, on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_items')
    order = models.CharField(max_length=255)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title
