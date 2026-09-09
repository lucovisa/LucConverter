@app.route('/api/webhook', methods=['POST'])
def webhook():
    update = request.json
    
    if 'message' in update and 'document' in update['message']:
        message = update['message']
        chat_id = message['chat']['id']
        document = message['document']
        file_name = document.get('file_name', 'file')
        file_id = document.get('file_id')
        
        if not file_id:
            send_message(chat_id, "No file ID")
            return 'OK', 200
        
        send_message(chat_id, f"Receiving {file_name}...")
        
        file_path = get_file_path(file_id)
        
        if not file_path:
            send_message(chat_id, "Failed to get file path")
            return 'OK', 200
        
        file_content = download_file(file_path)
        
        send_message(chat_id, "Converting...")
        
        result = convert_file(file_content, file_name, None)
        
        if result:
            download_id = str(uuid.uuid4())
            download_path = os.path.join(DOWNLOAD_DIR, f'{download_id}.{result["extension"]}')
            meta_path = os.path.join(DOWNLOAD_DIR, f'{download_id}.json')
            
            with open(download_path, 'wb') as f:
                f.write(result['content'])
            
            meta = {
                'filename': result['filename'],
                'created': time.time(),
                'downloaded': False,
                'download_url': f'https://{VERCEL_URL}/api/download/{download_id}'
            }
            
            with open(meta_path, 'w') as f:
                json.dump(meta, f)
            
            send_message(chat_id, f"Done! Download: {meta['download_url']}")
        else:
            send_message(chat_id, "Failed to convert")
    
    return 'OK', 200

def get_file_path(file_id):
    try:
        response = requests.get(f'{BASE_URL}/getFile', params={'file_id': file_id})
        data = response.json()
        
        if 'result' not in data:
            print(f"Telegram API error: {data}")
            return None
        
        return data['result']['file_path']
    except Exception as e:
        print(f"Error: {e}")
        return None