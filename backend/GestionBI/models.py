from django.db import models
from Accounts.models import *
from django.core.validators import FileExtensionValidator
from gestionUI.models import WebSite  # Correctly import the WebSite model from the gestionUI app

# Create your models here.



class SelectedSegment(models.Model):
    selectedSidebarItem = models.CharField(max_length=255)
    column = models.CharField(max_length=255)
    uniqueValues = models.JSONField()
    selectedFileId = models.CharField(max_length=255, null=True, blank=True)
    type = models.CharField(max_length=50, choices=[('date', 'Date'), ('number', 'Number'), ('string', 'String')], default='string')
    unique_values_selected = models.JSONField(null=True, blank=True)
    def __str__(self):
        return f"Segment {self.column} for Sidebar {self.selectedFileId}"


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
    website = models.ForeignKey(WebSite, on_delete=models.CASCADE, related_name='sidebars')


    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title




class T_python_code(models.Model):
    Code_Id=models.AutoField(primary_key=True)
    Code=models.TextField(null=False)
    File_Name=models.CharField(max_length=255,default='No Name',unique=True)
    Related_Code=models.ForeignKey('T_python_code',related_name='related graph+',null=True,default=None,on_delete=models.CASCADE)
    newCodeIsPrincipal=models.BooleanField(default=True)
    Causes=models.ManyToManyField('T_python_code',related_name='causes of the graphs+',blank=True)
    Consequences=models.ManyToManyField('T_python_code',related_name='Consequences of the graphs+',blank=True)
    Reports=models.ManyToManyField('T_report',related_name='reports of the graph+',blank=True)


class T_graphs(models.Model):   
    Img_Id=models.AutoField(primary_key=True)
    Img_Name=models.CharField(max_length=255,unique=True)
    Code_Python=models.OneToOneField(T_python_code,on_delete=models.CASCADE)
    x_position = models.FloatField(null=True, blank=True, default=None)
    y_position = models.FloatField(null=True, blank=True, default=None)
    width = models.FloatField(null=True, blank=True)  # Add width field
    height = models.FloatField(null=True, blank=True)  # Add height field
    sidebar_item = models.ForeignKey(SidebarItem, on_delete=models.CASCADE, related_name='graphs', null=True, blank=True)  # New field

class T_Documents(models.Model):
    Document_Id = models.AutoField(primary_key=True)
    User_Submitter = models.CharField(max_length=255)  # Store the user identifier as a string or integer
    Document_Name = models.CharField(max_length=255)
    Document = models.FileField(
        null=True,
        upload_to='documents/',  # Directory where files will be saved
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'txt', 'jpg', 'png', 'jpeg'])]
    )

class ResponsibleRealisation(models.Model):
    user_name = models.CharField(max_length=255, unique=True)
    documents = models.ManyToManyField('T_Documents', related_name='realisation_documents', blank=True)

class ResponsibleValidation(models.Model):
    user_name = models.CharField(max_length=255, unique=True)
    documents = models.ManyToManyField('T_Documents', related_name='validation_documents', blank=True)

class T_Actions(models.Model):
    Action_Id = models.AutoField(primary_key=True)
    Action_Name = models.CharField(max_length=255)
    Description = models.TextField(null=True, blank=True)
    Responsible_Realisation = models.ForeignKey(ResponsibleRealisation, on_delete=models.CASCADE, null=True, blank=True)
    Responsible_Validation = models.ForeignKey(ResponsibleValidation, on_delete=models.CASCADE, null=True, blank=True)
    Date_Submission_Real = models.DateField(null=True, blank=True, default=None)
    Date_Submission_Estimated = models.DateField(null=True, blank=True, default=None)
    Date_Validation_Real = models.DateField(null=True, blank=True, default=None)
    Date_Validation_Estimated = models.DateField(null=True, blank=True, default=None)
    Documents_Submission = models.ManyToManyField('T_Documents', related_name='action_submission', blank=True)
    Documents_Validation = models.ManyToManyField('T_Documents', related_name='action_validation', blank=True)

    def __str__(self):
        return self.Action_Name

class T_Decision(models.Model):
    Decision_Id = models.AutoField(primary_key=True)
    Decision_Name = models.CharField(max_length=255)
    Description = models.TextField(null=True, blank=True)  # Allow null and blank values
    Actions = models.ManyToManyField(T_Actions, related_name="actions to be taken+", blank=True)

class T_Report(models.Model):
    report_Id=models.AutoField(primary_key=True)
    report_Name=models.CharField(max_length=255)
    Content = models.TextField(null=True, blank=True)  # Allow null and blank values
    Decisions=models.ManyToManyField(T_Decision,blank=True,related_name="decisions taken+")




