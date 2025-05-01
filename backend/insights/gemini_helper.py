import google.generativeai as genai
import os

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyBufhZmBHXTYL4zQymFUhyix0kFGDZ-YiI')
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

def generate_insights_from_data(df):
    model = get_model()
    if not model:
        return "Error: No available models"

    # Convert the dataframe to a sample (first 10 rows)
    sample = df.head(10).to_csv(index=False)

    # Prepare the prompt
    prompt = f"""
    I have a dataset with the following sample (in CSV format):

    {sample}

    Please provide:
    - A summary of what this dataset might represent
    - Any interesting trends or patterns
    - Anomalies or outliers you notice
    - Suggestions for visualization
    """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Generation Error: {str(e)}"

def generate_answer_from_data(df, question):
    model = get_model()
    if not model:
        return "Error: No available models"

    # Convert the dataframe to a sample (first 10 rows)
    sample = df.head(10).to_csv(index=False)

    # Prepare the custom prompt based on the question
    prompt = f"""
    I have a dataset with the following sample (in CSV format):

    {sample}

    Question: {question}

    Please provide an answer based on the data above.
    """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Generation Error: {str(e)}"
