# utils.py

import requests

def verify_google_token(token):
    try:
        response = requests.get(f'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={token}')
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        return None
