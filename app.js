const appVersion = "1.0.1";

async function clean3MF(file, removeAuxiliaries) {
    const zip = await window.JSZip.loadAsync(file);
    
    // Remove all metadata except for 'Application' and 'BambuStudio:3mfVersion' from 3D/3dmodel.model and 3D/Objects/*.model files
    const metadataRegex = /<metadata name="(?!Application|BambuStudio:3mfVersion)[^"]+">.*?<\/metadata>/g;

    for (const fileName of Object.keys(zip.files)) {
        if (fileName.match(/^3D\/.*\.model$/i) || fileName.match(/^3D\/Objects\/.*\.model$/i)) {
            let modelXML = await zip.files[fileName].async("text");
            modelXML = modelXML.replace(metadataRegex, ''); // Remove unwanted metadata
            zip.file(fileName, modelXML); // Update the file in the ZIP
        }
    }
    
    // Remove 'Auxiliaries' folder if the option is selected
    if (removeAuxiliaries) {
        for (const fileName of Object.keys(zip.files)) {
            if (fileName.startsWith('Auxiliaries/')) {
                zip.remove(fileName);
            }
        }
    }
    
    // Repack the .3MF file with compression
    const cleanedFile = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    return cleanedFile;
}

// File input handler
document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Store the selected file in a global variable
    window.selectedFile = file;

    // Update UI to show the selected file name
    document.getElementById('fileNameDisplay').textContent = `Selected file: ${file.name}`;
});

// Add drag-and-drop functionality
const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = event.dataTransfer.files[0];
    if (!file) return;

    // Store the selected file in a global variable
    window.selectedFile = file;

    // Update UI to show the selected file name
    document.getElementById('fileNameDisplay').textContent = `Selected file: ${file.name}`;
});

// Button click handler
document.getElementById('processFile').addEventListener('click', async () => {
    const file = window.selectedFile;
    if (!file) {
        alert('Please select a file first.');
        return;
    }

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
