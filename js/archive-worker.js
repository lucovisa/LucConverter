try {
    importScripts('https://cdn.jsdelivr.net/npm/libarchive.js@1.3.0/dist/libarchive.min.js');
    
    self.onmessage = async function(e) {
        const file = e.data;
        
        try {
            const archive = await Archive.open(file);
            const extracted = await archive.extractFiles();
            
            const files = extracted.map(f => ({
                name: f.name,
                data: f.blob
            }));
            
            self.postMessage({ success: true, files: files });
        } catch (error) {
            self.postMessage({ success: false, error: error.message });
        }
    };
} catch (e) {
    self.postMessage({ success: false, error: 'Library load failed' });
}