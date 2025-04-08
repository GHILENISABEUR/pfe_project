from django.db import models
from django.utils.translation import gettext_lazy as _
class WebSite(models.Model):
    title = models.TextField()

    def __str__(self):
        return self.title

class Frame(models.Model):
    key = models.TextField()
    title = models.TextField()
    content = models.TextField(blank=True)
    route = models.TextField(blank=True)
    event = models.TextField(blank=True)
    webSite = models.ForeignKey(WebSite, on_delete=models.CASCADE, related_name='frames', default= 1)

    def __str__(self):
        return f'Frame {self.id} - Website: {self.webSite.title}'

class FrameElement(models.Model):
    key = models.TextField()
    type = models.TextField()
    frame = models.ForeignKey(Frame, on_delete=models.CASCADE, related_name='elements',default= 1)

    def __str__(self):
        return f'FrameElement {self.id} - Frame: {self.frame.id}'

class Table(models.Model):
    cols = models.JSONField()
    rows = models.JSONField()
    tableStyle = models.JSONField(null=True, blank=True)
    backgroundColor = models.CharField(max_length=7, null=True, blank=True)
    cellStyles = models.JSONField(null=True, blank=True)
    position = models.JSONField(null=True, blank=True)
    paginationEnabled = models.BooleanField(default=False)
    filteringEnabled = models.BooleanField(default=False)
    borderVisible = models.BooleanField(default=True)
    webSite = models.ForeignKey(WebSite, on_delete=models.CASCADE, related_name='tables',default= 1)
    toggle = models.JSONField(default=dict(
        showAddRowButton=False,
        showAddColumnButton=False,
        showPaginationToggle=False,
        showFilteringToggle=False,
        showImportExcel=False,
        showSelect=False,
        isRowDragEnabled=False,
        isColumnDragEnabled=False,
        isDragEnabled=True,
        EditerEnable=False,
        showExportExcel=False,
        showCategories=False,
    ))
class Text(models.Model):
    text=models.TextField()
    style =  models.JSONField(blank=True, null=True)
    frame = models.ForeignKey(Frame, on_delete=models.CASCADE)
    website = models.ForeignKey(WebSite, on_delete=models.CASCADE)
class InputField(models.Model):
    frame = models.ForeignKey(Frame, on_delete=models.CASCADE)
    label = models.CharField(max_length=255, blank=True, null=True)
    style = models.JSONField(blank=True, null=True)
    website = models.ForeignKey(WebSite, on_delete=models.CASCADE)
class Image(models.Model):
    src = models.TextField()
    style = models.JSONField(blank=True, null=True)
    frame = models.ForeignKey(Frame, on_delete=models.CASCADE)
    website = models.ForeignKey(WebSite, on_delete=models.CASCADE)
class ButtonAction(models.TextChoices):
    ADD = 'add', _('Add')
    DELETE = 'delete', _('Delete')
    UPDATE = 'update', _('Update')
    VIEW = 'view', _('View')
class Button(models.Model):
    value = models.CharField(max_length=10,
        choices=ButtonAction.choices,
        default=ButtonAction.VIEW,)
    style = models.JSONField(blank=True, null=True)
    frame = models.ForeignKey('Frame', on_delete=models.CASCADE)
    website = models.ForeignKey(WebSite, on_delete=models.CASCADE)

    def __str__(self):
        return f'Table {self.id}'
