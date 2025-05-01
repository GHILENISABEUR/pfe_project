from django import forms
from .models import UploadedFile

class UploadFileForm(forms.ModelForm):
    file = forms.FileField(label='Choose a file', required=True)

    class Meta:
        model = UploadedFile
        fields = ['file']

