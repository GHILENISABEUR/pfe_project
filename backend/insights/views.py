import pandas as pd
import plotly.express as px
import plotly.io as pio
from django.shortcuts import render

from .forms import UploadFileForm
from .gemini_helper import generate_insights_from_data, generate_answer_from_data

def generate_charts(df):
    charts = []
    try:
        numeric_columns = df.select_dtypes(include=['number']).columns.tolist()

        # Bar chart: x = first numeric column, y = other numeric columns
        if numeric_columns:
            y_columns = [col for col in numeric_columns if col != numeric_columns[0]]
            if y_columns:
                fig = px.bar(df, x=numeric_columns[0], y=y_columns)
                charts.append(pio.to_html(fig, full_html=False))

        # Scatter plot: needs at least 2 numeric columns
        if len(numeric_columns) > 1:
            fig = px.scatter(df, x=numeric_columns[0], y=numeric_columns[1])
            charts.append(pio.to_html(fig, full_html=False))

        # Histogram
        if numeric_columns:
            fig = px.histogram(df, x=numeric_columns[0])
            charts.append(pio.to_html(fig, full_html=False))

        return charts

    except Exception as e:
        return [f"Error generating chart: {str(e)}"]


def index(request):
    form = UploadFileForm()
    data_preview = None
    columns = []
    insights = None
    ai_response = None
    charts = []
    df = None
    file_path = None

    if request.method == 'POST':
        # ——— Handle file upload (or reuse existing) ———
        form = UploadFileForm(request.POST, request.FILES)
        if 'file' in request.FILES and form.is_valid():
            uploaded_file = form.save()
            file_path = uploaded_file.file.path
        else:
            # If no new upload, try to get the path of the previously uploaded file
            file_path = request.POST.get('file_path')

        # Load the DataFrame if we have a file path
        if file_path:
            try:
                if file_path.endswith('.csv'):
                    df = pd.read_csv(file_path)
                elif file_path.endswith(('.xls', '.xlsx')):
                    df = pd.read_excel(file_path)
                else:
                    df = pd.DataFrame({'Error': ['Unsupported file type']})
            except Exception as e:
                df = pd.DataFrame({'Error': [str(e)]})

            if isinstance(df, pd.DataFrame) and not df.empty:
                data_preview = df.head().to_html(classes='table table-bordered', index=False)
                columns = df.columns.tolist()
                insights = generate_insights_from_data(df)
                charts = generate_charts(df)

        # ——— Handle AI question ———
        ai_question = request.POST.get('ai_question', '').strip()
        if ai_question and df is not None:
            ai_response = generate_answer_from_data(df, ai_question)

    return render(request, 'chart.html', {
        'form': form,
        'data_preview': data_preview,
        'columns': columns,
        'insights': insights,
        'ai_response': ai_response,
        'charts': charts,
        'file_path': file_path,
    })
