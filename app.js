const zip = new JSZip();

async function clean3MF(file, removeAuxiliaries) {
    const zip = await window.JSZip.loadAsync(file);
    
    // Remove all metadata except for 'Application' and 'BambuStudio:3mfVersion' from 3D/3dmodel.model files
    Object.keys(zip.files).forEach(async (fileName) => {
        if (fileName.startsWith('3D/') && fileName.endsWith('3dmodel.model')) {
            let modelXML = await zip.files[fileName].async("text");
            modelXML = modelXML.replace(/<metadata name="(?!Application|BambuStudio:3mfVersion")[^>]+">.*?<\/metadata>/g, '');
            zip.file(fileName, modelXML);
        }
    });
    
    // Remove 'Auxiliaries' folder if the option is selected
    if (removeAuxiliaries) {
        Object.keys(zip.files).forEach(fileName => {
            if (fileName.startsWith('Auxiliaries/')) {
                zip.remove(fileName);
            }
        });
    }
    
    // Repack the .3MF file
    const cleanedFile = await zip.generateAsync({ type: "blob" });
    return cleanedFile;
}

// File input handler
document.getElementById('fileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const removeAuxiliaries = document.getElementById('removeAuxiliaries').checked;
    const cleanedFile = await clean3MF(file, removeAuxiliaries);
    
    // Create a download link
    const a = document.createElement('a');
    a.href = URL.createObjectURL(cleanedFile);
    a.download = file.name.replace('.3mf', '_cleaned.3mf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});
