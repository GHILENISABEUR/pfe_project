from django.db import models

class NavbarItem(models.Model):
    title = models.CharField(max_length=255)
    url = models.URLField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, related_name='children', null=True, blank=True)
    order = models.CharField(max_length=255)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title
