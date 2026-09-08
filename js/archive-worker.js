importScripts('https://cdn.jsdelivr.net/npm/libarchive.js@1.3.0/dist/libarchive.min.js');

self.onmessage = async function(e) {
    const { file, type } = e.data;
    
    try {
        const archive = await Archive.open(file);
        const extracted = await archive.extractFiles();
        
        const files = extracted.map(f => ({
            name: f.name,
            data: f.blob
        }));
        
        postMessage({ success: true, files: files });
    } catch (error) {
        postMessage({ success: false, error: error.message });
    }
};