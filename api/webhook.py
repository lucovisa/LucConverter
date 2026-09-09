import os
import json
import time
import uuid
import zipfile
import tempfile
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

TOKEN = os.environ.get('TELEGRAM_TOKEN')
BASE_URL = f'https://api.telegram.org/bot{TOKEN}'
VERCEL_URL = os.environ.get('VERCEL_URL', 'converter-ashy-kappa.vercel.app')
DOWNLOAD_DIR = '/tmp/downloads'

os.makedirs(DOWNLOAD_DIR, exist_ok=True)

@app.route('/api/webhook', methods=['POST'])
def webhook():
    update = request.json
    
    if 'message' in update and 'text' in update['message']:
        chat_id = update['message']['chat']['id']
        text = update['message']['text']
        
        if text.startswith('/start'):
            send_message(chat_id, "Send me a file")
        else:
            send_message(chat_id, "Send me a file to convert")
    
    return 'OK', 200

def send_message(chat_id, text):
    requests.post(f'{BASE_URL}/sendMessage', json={'chat_id': chat_id, 'text': text})

def handler(request, response):
    return app(request.environ, lambda status, headers: response(status, headers))