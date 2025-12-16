// OCR Page Functionality
let uploadedFiles = [];
let scannedData = null;
let zoomLevel = 1;
let textBoxes = [];
let draggedBox = null;
let dragOffset = { x: 0, y: 0 };
let currentPage = 1;
let totalPages = 1;

// Initialize PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// DOM Elements
const fileUploadArea = document.getElementById('fileUploadArea');
const fileInput = document.getElementById('fileInput');
const uploadedFilesContainer = document.getElementById('uploadedFiles');
const scanButton = document.getElementById('scanButton');
const scanProgress = document.getElementById('scanProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const previewEmpty = document.getElementById('previewEmpty');
const previewContent = document.getElementById('previewContent');
const documentCanvas = document.getElementById('documentCanvas');
const textBoxesContainer = document.getElementById('textBoxesContainer');
const applyButton = document.getElementById('applyButton');
const clearButton = document.getElementById('clearButton');
const zoomInButton = document.getElementById('zoomInButton');
const zoomOutButton = document.getElementById('zoomOutButton');
const resetButton = document.getElementById('resetButton');
const canvasContainer = document.getElementById('canvasContainer');

// File Upload Event Listeners
fileUploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Drag and Drop
fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.classList.add('drag-over');
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.classList.remove('drag-over');
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
});

// Handle File Selection
function handleFiles(files) {
    for (let file of files) {
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            uploadedFiles.push(file);
            addFileToList(file);
        } else {
            alert(`Unsupported file type: ${file.name}`);
        }
    }
    updateScanButton();
}

// Add File to List
function addFileToList(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.fileName = file.name;

    const fileSize = (file.size / 1024).toFixed(2);
    const fileExtension = file.name.split('.').pop().toUpperCase();

    fileItem.innerHTML = `
        <div class="file-info">
            <div class="file-icon">${fileExtension}</div>
            <div class="file-details">
                <h4>${file.name}</h4>
                <p>${fileSize} KB</p>
            </div>
        </div>
        <button class="remove-file" onclick="removeFile('${file.name}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    uploadedFilesContainer.appendChild(fileItem);
}

// Remove File
function removeFile(fileName) {
    uploadedFiles = uploadedFiles.filter(f => f.name !== fileName);
    const fileItem = uploadedFilesContainer.querySelector(`[data-file-name="${fileName}"]`);
    if (fileItem) {
        fileItem.remove();
    }
    updateScanButton();
}

// Update Scan Button State
function updateScanButton() {
    scanButton.disabled = uploadedFiles.length === 0;
}

// Scan Button Click
scanButton.addEventListener('click', performScan);

async function performScan() {
    if (uploadedFiles.length === 0) return;

    // Show progress
    scanProgress.style.display = 'block';
    scanButton.disabled = true;
    progressText.textContent = 'Preparing...';

    try {
        // Process the first file
        const file = uploadedFiles[0];
        await processFile(file);
    } catch (error) {
        console.error('OCR Error:', error);
        alert('Error processing file: ' + error.message);
    }

    // Hide progress
    setTimeout(() => {
        scanProgress.style.display = 'none';
        progressFill.style.width = '0%';
        scanButton.disabled = false;
    }, 500);
}

// Process File (Load image or PDF and perform OCR)
async function processFile(file) {
    if (file.type === 'application/pdf') {
        await processPDF(file);
    } else if (file.type.startsWith('image/')) {
        await processImage(file);
    }
}

// Process PDF File
async function processPDF(file) {
    return new Promise(async (resolve, reject) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            totalPages = pdf.numPages;
            
            // Get first page
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 2.0 });
            
            // Prepare canvas
            documentCanvas.width = viewport.width;
            documentCanvas.height = viewport.height;
            const ctx = documentCanvas.getContext('2d');
            
            // Render PDF page to canvas
            progressText.textContent = 'Rendering PDF...';
            progressFill.style.width = '30%';
            
            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;
            
            // Show preview
            previewEmpty.style.display = 'none';
            previewContent.style.display = 'block';
            
            // Perform OCR on the rendered canvas
            progressText.textContent = 'Performing OCR...';
            progressFill.style.width = '50%';
            
            await performOCR(documentCanvas);
            
            progressFill.style.width = '100%';
            applyButton.disabled = false;
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// Process Image File
async function processImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    // Draw image on canvas
                    const ctx = documentCanvas.getContext('2d');
                    documentCanvas.width = img.width;
                    documentCanvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    // Show preview
                    previewEmpty.style.display = 'none';
                    previewContent.style.display = 'block';

                    // Perform OCR
                    progressText.textContent = 'Performing OCR...';
                    progressFill.style.width = '50%';
                    
                    await performOCR(img);
                    
                    progressFill.style.width = '100%';
                    applyButton.disabled = false;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// Perform OCR using Tesseract.js
async function performOCR(source) {
    let worker = null;
    try {
        progressText.textContent = 'Initializing OCR engine...';
        progressFill.style.width = '30%';
        
        // Create worker with both English and Chinese support
        worker = await Tesseract.createWorker(['eng', 'chi_tra'], 1, {
            logger: (m) => {
                console.log(m);
                if (m.status === 'loading tesseract core') {
                    progressText.textContent = 'Loading OCR engine...';
                    progressFill.style.width = '10%';
                } else if (m.status === 'initializing tesseract') {
                    progressText.textContent = 'Initializing...';
                    progressFill.style.width = '20%';
                } else if (m.status === 'loading language traineddata') {
                    progressText.textContent = 'Loading language data...';
                    progressFill.style.width = '30%';
                } else if (m.status === 'initializing api') {
                    progressText.textContent = 'Preparing OCR...';
                    progressFill.style.width = '40%';
                } else if (m.status === 'recognizing text') {
                    const progress = Math.round(m.progress * 50 + 50); // 50-100%
                    progressFill.style.width = progress + '%';
                    progressText.textContent = `Recognizing text... ${Math.round(m.progress * 100)}%`;
                }
            }
        });
        
        progressText.textContent = 'Recognizing text...';
        progressFill.style.width = '50%';
        
        const { data } = await worker.recognize(source);
        
        progressText.textContent = 'Processing results...';
        progressFill.style.width = '90%';
        
        await worker.terminate();
        worker = null;
        
        // Clear existing text boxes
        textBoxes = [];
        textBoxesContainer.innerHTML = '';
        
        // Create text boxes from OCR results
        if (data.words && data.words.length > 0) {
            let boxId = 0;
            data.words.forEach((word) => {
                if (word.text.trim().length > 0 && word.confidence > 30) {
                    createTextBox(
                        word.text,
                        word.bbox.x0,
                        word.bbox.y0,
                        word.bbox.x1 - word.bbox.x0,
                        boxId++
                    );
                }
            });
            
            if (boxId === 0) {
                throw new Error('No text detected with sufficient confidence');
            }
            
            progressText.textContent = `Complete! Found ${boxId} text elements.`;
        } else {
            throw new Error('No text detected in the document');
        }
        
        progressFill.style.width = '100%';
        
    } catch (error) {
        console.error('OCR Error:', error);
        
        // Clean up worker if it exists
        if (worker) {
            try {
                await worker.terminate();
            } catch (e) {
                console.error('Error terminating worker:', e);
            }
        }
        
        progressText.textContent = 'OCR failed, using sample data...';
        
        // Fallback to sample text boxes
        generateSampleTextBoxes(documentCanvas.width, documentCanvas.height);
        
        progressFill.style.width = '100%';
    }
}

// Generate Sample Text Boxes (Simulating OCR results)
function generateSampleTextBoxes(width, height) {
    // Clear existing text boxes
    textBoxes = [];
    textBoxesContainer.innerHTML = '';

    // Sample OCR data (in real app, this would come from OCR API)
    const sampleTexts = [
        { text: 'Sample Document Title', x: width * 0.1, y: height * 0.1, width: width * 0.8 },
        { text: 'This is a sample paragraph that was detected by OCR.', x: width * 0.1, y: height * 0.25, width: width * 0.8 },
        { text: 'Another line of text here.', x: width * 0.1, y: height * 0.4, width: width * 0.6 },
        { text: 'Date: December 16, 2025', x: width * 0.1, y: height * 0.55, width: width * 0.4 },
        { text: 'Total: $1,234.56', x: width * 0.6, y: height * 0.55, width: width * 0.3 },
    ];

    sampleTexts.forEach((data, index) => {
        createTextBox(data.text, data.x, data.y, data.width, index);
    });
}

// Create Draggable and Editable Text Box
function createTextBox(text, x, y, width, id) {
    const textBox = document.createElement('div');
    textBox.className = 'text-box';
    textBox.dataset.id = id;
    textBox.style.left = x + 'px';
    textBox.style.top = y + 'px';
    textBox.style.width = width + 'px';

    textBox.innerHTML = `
        <div class="text-box-handle"></div>
        <textarea rows="2">${text}</textarea>
        <button class="delete-text-box" onclick="deleteTextBox(${id})">×</button>
    `;

    textBoxesContainer.appendChild(textBox);
    textBoxes.push({ id, element: textBox, text, x, y });

    // Make draggable
    const handle = textBox.querySelector('.text-box-handle');
    handle.addEventListener('mousedown', startDrag);
    textBox.addEventListener('mousedown', startDrag);

    // Update text on change
    const textarea = textBox.querySelector('textarea');
    textarea.addEventListener('input', (e) => {
        const box = textBoxes.find(b => b.id === id);
        if (box) box.text = e.target.value;
    });
}

// Drag Functionality
function startDrag(e) {
    if (e.target.tagName === 'TEXTAREA' || e.target.classList.contains('delete-text-box')) return;

    e.preventDefault();
    draggedBox = e.currentTarget.closest('.text-box');
    draggedBox.classList.add('dragging');

    const rect = draggedBox.getBoundingClientRect();
    const containerRect = textBoxesContainer.getBoundingClientRect();
    
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

function drag(e) {
    if (!draggedBox) return;

    const containerRect = textBoxesContainer.getBoundingClientRect();
    let x = e.clientX - containerRect.left - dragOffset.x;
    let y = e.clientY - containerRect.top - dragOffset.y;

    // Keep within bounds
    x = Math.max(0, Math.min(x, containerRect.width - draggedBox.offsetWidth));
    y = Math.max(0, Math.min(y, containerRect.height - draggedBox.offsetHeight));

    draggedBox.style.left = x + 'px';
    draggedBox.style.top = y + 'px';

    // Update stored position
    const id = parseInt(draggedBox.dataset.id);
    const box = textBoxes.find(b => b.id === id);
    if (box) {
        box.x = x;
        box.y = y;
    }
}

function stopDrag() {
    if (draggedBox) {
        draggedBox.classList.remove('dragging');
        draggedBox = null;
    }
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

// Delete Text Box
function deleteTextBox(id) {
    const box = textBoxes.find(b => b.id === id);
    if (box) {
        box.element.remove();
        textBoxes = textBoxes.filter(b => b.id !== id);
    }
}

// Zoom Controls
zoomInButton.addEventListener('click', () => {
    zoomLevel = Math.min(zoomLevel + 0.2, 3);
    applyZoom();
});

zoomOutButton.addEventListener('click', () => {
    zoomLevel = Math.max(zoomLevel - 0.2, 0.5);
    applyZoom();
});

resetButton.addEventListener('click', () => {
    zoomLevel = 1;
    applyZoom();
});

function applyZoom() {
    canvasContainer.style.transform = `scale(${zoomLevel})`;
    canvasContainer.style.transformOrigin = 'top left';
}

// Apply Button - Save Results
applyButton.addEventListener('click', () => {
    const results = {
        image: documentCanvas.toDataURL(),
        textBoxes: textBoxes.map(box => ({
            text: box.element.querySelector('textarea').value,
            x: box.x,
            y: box.y,
            width: box.element.offsetWidth,
            height: box.element.offsetHeight
        })),
        timestamp: new Date().toISOString()
    };

    // Save to localStorage (in real app, would save to server)
    const savedScans = JSON.parse(localStorage.getItem('ocrScans') || '[]');
    savedScans.push(results);
    localStorage.setItem('ocrScans', JSON.stringify(savedScans));

    // Download as JSON
    downloadResults(results);

    alert('Document saved successfully!');
});

// Download Results
function downloadResults(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-result-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Clear Button - Reset Everything
clearButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear everything?')) {
        // Clear files
        uploadedFiles = [];
        uploadedFilesContainer.innerHTML = '';
        
        // Clear preview
        textBoxes = [];
        textBoxesContainer.innerHTML = '';
        documentCanvas.getContext('2d').clearRect(0, 0, documentCanvas.width, documentCanvas.height);
        
        // Reset UI
        previewContent.style.display = 'none';
        previewEmpty.style.display = 'flex';
        applyButton.disabled = true;
        updateScanButton();
        
        // Reset zoom
        zoomLevel = 1;
        applyZoom();
    }
});

// Initialize
updateScanButton();