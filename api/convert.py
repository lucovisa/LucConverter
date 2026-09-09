import os
import json
import time
import uuid
import zipfile
import tempfile
import requests
import re
import imageio_ffmpeg
from flask import Flask, request, jsonify
from io import BytesIO

app = Flask(__name__)

FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()

def upload_to_tmpfiles(file_content, file_name):
    try:
        response = requests.post(
            'https://tmpfiles.org/api/v1/upload',
            files={'file': (file_name, file_content)}
        )
        data = response.json()
        if 'data' in data and 'url' in data['data']:
            view_url = data['data']['url']
            download_url = view_url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/')
            return view_url, download_url
        return None, None
    except Exception as e:
        print(f"Upload error: {e}")
        return None, None

@app.route('/api/convert', methods=['POST', 'OPTIONS'])
def convert_endpoint():
    if request.method == 'OPTIONS':
        response = jsonify({'ok': True})
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response, 200
    
    if 'file' not in request.files:
        response = jsonify({'ok': False, 'error': 'No file'})
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response, 400
    
    file = request.files['file']
    target_format = request.form.get('format', 'zip').lower()
    file_name = file.filename
    file_content = file.read()
    
    if target_format == 'upload':
        view_link, download_link = upload_to_tmpfiles(file_content, file_name)
        if download_link:
            response = jsonify({'ok': True, 'download_url': download_link, 'view_url': view_link})
            response.headers['Access-Control-Allow-Origin'] = '*'
            return response
        response = jsonify({'ok': False, 'error': 'Upload failed'})
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response, 500
    
    result = convert_file(file_content, file_name, target_format)
    
    if not result:
        response = jsonify({'ok': False, 'error': 'Conversion failed'})
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response, 500
    
    view_link, download_link = upload_to_tmpfiles(result['content'], result['filename'])
    
    if not download_link:
        response = jsonify({'ok': False, 'error': 'Upload failed'})
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response, 500
    
    response = jsonify({'ok': True, 'download_url': download_link, 'view_url': view_link})
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

def convert_file(file_content, file_name, target_format=None):
    try:
        extension = os.path.splitext(file_name)[1].lower()
        
        if target_format and target_format.startswith('.'):
            target_format = target_format[1:]
        
        if extension == '.rar' and target_format in ['zip', None]:
            return convert_rar_to_zip(file_content, file_name)
        
        if extension == '.7z' and target_format in ['zip', None]:
            return convert_7z_to_zip(file_content, file_name)
        
        if target_format in ['zip', None]:
            return convert_to_zip(file_content, file_name)
        
        if target_format == '7z':
            return convert_to_7z(file_content, file_name)
        
        if target_format in ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'ico', 'gif', 'svg', 'tiff'] and extension in ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.ico', '.gif', '.svg', '.tiff']:
            return convert_image(file_content, file_name, target_format)
        
        if target_format == 'txt' and extension in ['.pdf', '.docx', '.doc', '.html', '.htm', '.rtf']:
            return convert_to_txt(file_content, file_name)
        
        if target_format in ['jpg', 'png'] and extension == '.pdf':
            return convert_pdf_to_image(file_content, file_name, target_format)
        
        if target_format == 'pdf' and extension in ['.txt', '.html', '.htm', '.docx', '.doc', '.rtf', '.md']:
            return convert_to_pdf(file_content, file_name)
        
        if target_format in ['csv', 'json', 'html'] and extension in ['.xlsx', '.xls', '.ods']:
            return convert_xlsx(file_content, file_name, target_format)
        
        if target_format in ['xlsx', 'xls'] and extension in ['.csv', '.json']:
            return convert_to_xlsx(file_content, file_name, target_format)
        
        if target_format in ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'opus'] and extension in ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.gif', '.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.opus', '.wma']:
            return convert_to_audio(file_content, file_name, target_format)
        
        if target_format in ['jpg', 'png'] and extension in ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.gif']:
            return convert_video_to_image(file_content, file_name, target_format)
        
        if target_format in ['mp4', 'webm', 'avi', 'mov', 'gif', 'mkv'] and extension in ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.gif']:
            return convert_video(file_content, file_name, target_format)
        
        if target_format in ['mp4', 'webm'] and extension in ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.opus', '.wma']:
            return convert_audio_to_video(file_content, file_name, target_format)
        
        if target_format in ['stl', 'obj', 'glb', 'gltf', 'fbx', 'ply'] and extension in ['.glb', '.gltf', '.obj', '.stl', '.fbx', '.ply', '.blend', '.dae']:
            return convert_3d(file_content, file_name, target_format)
        
        if target_format == 'html' and extension == '.md':
            return convert_markdown_to_html(file_content, file_name)
        
        if target_format == 'md' and extension in ['.html', '.htm']:
            return convert_html_to_markdown(file_content, file_name)
        
        return None
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_rar_to_zip(file_content, file_name):
    try:
        import rarfile
        
        tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix='.rar')
        tmp_path.write(file_content)
        tmp_path.close()
        
        extract_dir = tempfile.mkdtemp()
        
        with rarfile.RarFile(tmp_path.name) as rf:
            rf.extractall(extract_dir)
        
        zip_buffer = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(extract_dir):
                for f in files:
                    file_path = os.path.join(root, f)
                    arcname = os.path.relpath(file_path, extract_dir)
                    zipf.write(file_path, arcname)
        
        with open(zip_buffer.name, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path.name)
        os.remove(zip_buffer.name)
        
        import shutil
        shutil.rmtree(extract_dir)
        
        return {'content': content, 'filename': file_name.replace('.rar', '.zip'), 'extension': 'zip'}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_7z_to_zip(file_content, file_name):
    try:
        import py7zr
        
        tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix='.7z')
        tmp_path.write(file_content)
        tmp_path.close()
        
        extract_dir = tempfile.mkdtemp()
        
        with py7zr.SevenZipFile(tmp_path.name, 'r') as z:
            z.extractall(extract_dir)
        
        zip_buffer = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(extract_dir):
                for f in files:
                    file_path = os.path.join(root, f)
                    arcname = os.path.relpath(file_path, extract_dir)
                    zipf.write(file_path, arcname)
        
        with open(zip_buffer.name, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path.name)
        os.remove(zip_buffer.name)
        
        import shutil
        shutil.rmtree(extract_dir)
        
        return {'content': content, 'filename': file_name.replace('.7z', '.zip'), 'extension': 'zip'}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_to_zip(file_content, file_name):
    try:
        zip_buffer = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.writestr(file_name, file_content)
        
        with open(zip_buffer.name, 'rb') as f:
            content = f.read()
        
        os.remove(zip_buffer.name)
        
        return {'content': content, 'filename': file_name + '.zip', 'extension': 'zip'}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_to_7z(file_content, file_name):
    try:
        import py7zr
        
        tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix='.tmp')
        tmp_path.write(file_content)
        tmp_path.close()
        
        zip_buffer = tempfile.NamedTemporaryFile(delete=False, suffix='.7z')
        zip_buffer.close()
        
        with py7zr.SevenZipFile(zip_buffer.name, 'w') as z:
            z.write(tmp_path.name, file_name)
        
        with open(zip_buffer.name, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path.name)
        os.remove(zip_buffer.name)
        
        return {'content': content, 'filename': file_name + '.7z', 'extension': '7z'}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_image(file_content, file_name, target_format):
    try:
        from PIL import Image
        import io
        
        img = Image.open(io.BytesIO(file_content))
        
        output_buffer = io.BytesIO()
        
        if target_format in ['jpg', 'jpeg']:
            img.convert('RGB').save(output_buffer, format='JPEG', quality=95)
        elif target_format == 'png':
            img.save(output_buffer, format='PNG')
        elif target_format == 'webp':
            img.save(output_buffer, format='WEBP', quality=95)
        elif target_format == 'bmp':
            img.save(output_buffer, format='BMP')
        elif target_format == 'ico':
            img.save(output_buffer, format='ICO')
        elif target_format == 'gif':
            img.save(output_buffer, format='GIF')
        elif target_format == 'svg':
            img.save(output_buffer, format='SVG')
        elif target_format == 'tiff':
            img.save(output_buffer, format='TIFF')
        
        return {'content': output_buffer.getvalue(), 'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'), 'extension': target_format}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_to_txt(file_content, file_name):
    try:
        extension = os.path.splitext(file_name)[1].lower()
        
        if extension == '.pdf':
            from PyPDF2 import PdfReader
            import io
            pdf = PdfReader(io.BytesIO(file_content))
            text = ''
            for page in pdf.pages:
                text += page.extract_text() + '\n\n'
        elif extension in ['.docx', '.doc']:
            import mammoth
            import io
            result = mammoth.extract_raw_text(io.BytesIO(file_content))
            text = result.value
        elif extension in ['.html', '.htm']:
            text = file_content.decode('utf-8', errors='ignore')
            text = re.sub(r'<[^>]+>', ' ', text)
        elif extension == '.rtf':
            text = file_content.decode('utf-8', errors='ignore')
        else:
            text = file_content.decode('utf-8', errors='ignore')
        
        return {'content': text.encode('utf-8'), 'filename': file_name.replace(extension, '.txt'), 'extension': 'txt'}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_pdf_to_image(file_content, file_name, target_format):
    try:
        from pdf2image import convert_from_bytes
        import io
        
        images = convert_from_bytes(file_content)
        
        if images:
            output_buffer = io.BytesIO()
            images[0].save(output_buffer, format='JPEG' if target_format == 'jpg' else 'PNG')
            return {'content': output_buffer.getvalue(), 'filename': file_name.replace('.pdf', f'.{target_format}'), 'extension': target_format}
        
        return None
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_to_pdf(file_content, file_name):
    try:
        from reportlab.pdfgen import canvas
        import io
        
        output_buffer = io.BytesIO()
        c = canvas.Canvas(output_buffer)
        
        text = file_content.decode('utf-8', errors='ignore')
        
        y = 800
        for line in text.split('\n'):
            c.drawString(50, y, line[:100])
            y -= 15
            if y < 50:
                c.showPage()
                y = 800
        
        c.save()
        
        return {'content': output_buffer.getvalue(), 'filename': file_name.replace(os.path.splitext(file_name)[1], '.pdf'), 'extension': 'pdf'}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_xlsx(file_content, file_name, target_format):
    try:
        import pandas as pd
        import io
        
        df = pd.read_excel(io.BytesIO(file_content))
        
        if target_format == 'csv':
            content = df.to_csv(index=False).encode('utf-8')
        elif target_format == 'json':
            content = df.to_json(orient='records').encode('utf-8')
        elif target_format == 'html':
            content = df.to_html(index=False).encode('utf-8')
        
        return {'content': content, 'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'), 'extension': target_format}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_to_xlsx(file_content, file_name, target_format):
    try:
        import pandas as pd
        import io
        
        if file_name.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(file_content))
        elif file_name.endswith('.json'):
            df = pd.read_json(io.BytesIO(file_content))
        
        output_buffer = io.BytesIO()
        df.to_excel(output_buffer, index=False)
        
        return {'content': output_buffer.getvalue(), 'filename': file_name.replace(os.path.splitext(file_name)[1], '.xlsx'), 'extension': 'xlsx'}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_to_audio(file_content, file_name, target_format):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        output_path = tmp_path + f'.{target_format}'
        
        subprocess.run([FFMPEG_PATH, '-i', tmp_path, '-vn', output_path], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path)
        os.remove(output_path)
        
        return {'content': content, 'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'), 'extension': target_format}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_video_to_image(file_content, file_name, target_format):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        output_path = tmp_path + f'.{target_format}'
        
        subprocess.run([FFMPEG_PATH, '-i', tmp_path, '-vframes', '1', output_path], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path)
        os.remove(output_path)
        
        return {'content': content, 'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'), 'extension': target_format}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_video(file_content, file_name, target_format):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        output_path = tmp_path + f'.{target_format}'
        
        subprocess.run([FFMPEG_PATH, '-i', tmp_path, '-c:v', 'libx264', '-c:a', 'aac', output_path], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path)
        os.remove(output_path)
        
        return {'content': content, 'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'), 'extension': target_format}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_audio_to_video(file_content, file_name, target_format):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        output_path = tmp_path + f'.{target_format}'
        
        subprocess.run([FFMPEG_PATH, '-i', tmp_path, '-f', 'lavfi', '-i', 'color=c=black:s=640x360', '-shortest', '-c:v', 'libx264', '-c:a', 'aac', output_path], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path)
        os.remove(output_path)
        
        return {'content': content, 'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'), 'extension': target_format}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_3d(file_content, file_name, target_format):
    try:
        extension = os.path.splitext(file_name)[1].lower()
        
        if extension == '.fbx':
            import assimp
            
            tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix='.fbx')
            tmp_path.write(file_content)
            tmp_path.close()
            
            with assimp.ImportContext() as ctx:
                scene = ctx.import_file(tmp_path.name)
                output = tempfile.NamedTemporaryFile(delete=False, suffix='.obj')
                assimp.export_scene(scene, output.name, 'obj')
                
                with open(output.name, 'rb') as f:
                    content = f.read()
                
                os.remove(tmp_path.name)
                os.remove(output.name)
                
                return {'content': content, 'filename': file_name.replace('.fbx', f'.{target_format}'), 'extension': target_format}
        
        import trimesh
        import io
        
        mesh = trimesh.load(io.BytesIO(file_content), file_type=extension[1:])
        
        if target_format == 'stl':
            content = mesh.export(file_type='stl')
        elif target_format == 'obj':
            content = mesh.export(file_type='obj')
        elif target_format == 'glb':
            content = mesh.export(file_type='glb')
        elif target_format == 'gltf':
            content = mesh.export(file_type='gltf')
        elif target_format == 'ply':
            content = mesh.export(file_type='ply')
        else:
            content = mesh.export(file_type=target_format)
        
        return {'content': content, 'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'), 'extension': target_format}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_markdown_to_html(file_content, file_name):
    try:
        import markdown
        
        md_text = file_content.decode('utf-8', errors='ignore')
        html = markdown.markdown(md_text)
        
        return {'content': html.encode('utf-8'), 'filename': file_name.replace('.md', '.html'), 'extension': 'html'}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_html_to_markdown(file_content, file_name):
    try:
        import html2text
        
        html_text = file_content.decode('utf-8', errors='ignore')
        md = html2text.html2text(html_text)
        
        return {'content': md.encode('utf-8'), 'filename': file_name.replace('.html', '.md'), 'extension': 'md'}
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def handler(request, response):
    return app(request.environ, lambda status, headers: response(status, headers))