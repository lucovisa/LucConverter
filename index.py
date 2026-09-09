@app.route('/api/view/<file_id>', methods=['GET'])
def view_file(file_id):
    if file_id not in files_in_memory:
        return 'File not found', 404
    
    file_info = files_in_memory[file_id]
    
    if time.time() - file_info['created'] > file_info.get('duration', 3600):
        del files_in_memory[file_id]
        return 'Link expired', 410
    
    if file_info.get('downloaded', 0) >= file_info.get('max_downloads', 1):
        return 'Download limit reached', 403
    
    file_info['downloaded'] = file_info.get('downloaded', 0) + 1
    
    extension = file_info.get('extension', '').lower()
    content_type = 'application/octet-stream'
    
    if extension in ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'ico', 'svg']:
        content_type = f'image/{extension}'
    elif extension in ['mp4', 'webm']:
        content_type = f'video/{extension}'
    elif extension in ['mp3', 'wav', 'ogg']:
        content_type = f'audio/{extension}'
    elif extension == 'txt':
        content_type = 'text/plain'
    elif extension == 'html':
        content_type = 'text/html'
    elif extension == 'pdf':
        content_type = 'application/pdf'
    
    return send_file(
        BytesIO(file_info['content']),
        mimetype=content_type,
        download_name=file_info['filename']
    )
