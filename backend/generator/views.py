from django.shortcuts import render
from django.conf import settings
import google.generativeai as genai
import os

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
genai.configure(
    api_key=GEMINI_API_KEY,
    transport='rest',
    client_options={"api_endpoint": "generativelanguage.googleapis.com"}
)

PREFERRED_MODELS = [
    'models/gemini-1.5-pro-latest',
    'models/gemini-1.0-pro-vision-latest',
    'models/gemini-1.5-flash-latest',
    'models/gemini-pro-vision'
]

def get_model():
    try:
        models = list(genai.list_models())
        for model_name in PREFERRED_MODELS:
            if any(m.name == model_name for m in models):
                return genai.GenerativeModel(model_name)
        return None
    except Exception as e:
        print(f"Model Error: {str(e)}")
        return None

def generate_code(prompt, language="python"):
    model = get_model()
    if not model:
        return "Error: No available models"

    full_prompt = f"""Generate {language} code that:
1. Implements: {prompt}
2. Uses proper error handling
3. Includes necessary comments
4. Follows best practices
5. Has proper indentation

Return ONLY the code without any explanations or markdown formatting."""

    try:
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        return f"Generation Error: {str(e)}"

def index(request):
    if request.method == 'POST':
        description = request.POST.get('description', '')
        language = request.POST.get('language', 'python')

        if not description:
            return render(request, 'index.html', {'error': "Please enter a description"})

        code = generate_code(description, language)
        return render(request, 'index.html', {'code': code, 'description': description})

    return render(request, 'index.html')
