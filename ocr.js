let uploadedDocuments = [];
let selectedDocument = null;
let currentPage = 1;
const itemsPerPage = 8;
let zoomLevel = 1;
let ocrResults = [];

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const documentCardsGrid = document.getElementById('documentCardsGrid');
const paginationControls = document.getElementById('paginationControls');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const scanButton = document.getElementById('scanButton');
const scanProgress = document.getElementById('scanProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const previewEmpty = document.getElementById('previewEmpty');
const previewContent = document.getElementById('previewContent');
const documentCanvas = document.getElementById('documentCanvas');
const textBoxesContainer = document.getElementById('textBoxesContainer');
const applyButton = document.getElementById('applyButton');
const downloadOptions = document.getElementById('downloadOptions');
const downloadPDFBtn = document.getElementById('downloadPDF');
const downloadPNGBtn = document.getElementById('downloadPNG');
const clearButton = document.getElementById('clearButton');
const zoomInButton = document.getElementById('zoomInButton');
const zoomOutButton = document.getElementById('zoomOutButton');
const resetButton = document.getElementById('resetButton');
const canvasContainer = document.getElementById('canvasContainer');


function initializeEventListeners() {

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));

    scanButton.addEventListener('click', performOCR);

    zoomInButton.addEventListener('click', () => adjustZoom(0.1));
    zoomOutButton.addEventListener('click', () => adjustZoom(-0.1));
    resetButton.addEventListener('click', resetView);
    
    applyButton.addEventListener('click', showDownloadOptions);
    downloadPDFBtn.addEventListener('click', () => downloadDocument('pdf'));
    downloadPNGBtn.addEventListener('click', () => downloadDocument('png'));
    clearButton.addEventListener('click', clearAll);
}


function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    processFiles(files);
    fileInput.value = '';
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
}

function processFiles(files) {
    files.forEach(file => {
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const document = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: formatFileSize(file.size),
                    type: file.type,
                    data: e.target.result,
                    file: file
                };
                uploadedDocuments.push(document);
                updateDocumentGrid();
            };
            reader.readAsDataURL(file);
        }
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function updateDocumentGrid() {
    const totalPages = Math.ceil(uploadedDocuments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDocuments = uploadedDocuments.slice(startIndex, endIndex);
    
    documentCardsGrid.innerHTML = '';
    
    currentDocuments.forEach(doc => {
        const card = createDocumentCard(doc);
        documentCardsGrid.appendChild(card);
    });
    
    updatePagination(totalPages);
    updateScanButton();
}

function createDocumentCard(doc) {
    const card = document.createElement('div');
    card.className = 'document-card';
    if (selectedDocument && selectedDocument.id === doc.id) {
        card.classList.add('selected');
    }
    
    card.innerHTML = `
        <img src="${doc.data}" alt="${doc.name}" class="document-card-image">
        <div class="document-card-info">
            <p class="document-card-name" title="${doc.name}">${doc.name}</p>
            <p class="document-card-size">${doc.size}</p>
        </div>
        <button class="document-card-delete" onclick="deleteDocument(${doc.id})">×</button>
    `;
    
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('document-card-delete')) {
            selectDocument(doc);
        }
    });
    
    return card;
}

function selectDocument(doc) {
    selectedDocument = doc;
    updateDocumentGrid();
    updateScanButton();
}

function deleteDocument(id) {
    uploadedDocuments = uploadedDocuments.filter(doc => doc.id !== id);
    if (selectedDocument && selectedDocument.id === id) {
        selectedDocument = null;
        clearPreview();
    }

    const totalPages = Math.ceil(uploadedDocuments.length / itemsPerPage);
    if (currentPage > totalPages && currentPage > 1) {
        currentPage = totalPages;
    }
    
    updateDocumentGrid();
}


function updatePagination(totalPages) {
    if (uploadedDocuments.length > itemsPerPage) {
        paginationControls.style.display = 'flex';
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    } else {
        paginationControls.style.display = 'none';
    }
}

function changePage(direction) {
    const totalPages = Math.ceil(uploadedDocuments.length / itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        updateDocumentGrid();
    }
}


async function performOCR() {
    if (!selectedDocument) return;
    

    scanButton.disabled = true;
    scanProgress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Initializing...';
    
    try {
        const img = new Image();
        img.src = selectedDocument.data;
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
        
        documentCanvas.width = img.width;
        documentCanvas.height = img.height;
        const ctx = documentCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        progressText.textContent = 'Recognizing text...';
        progressFill.style.width = '30%';
        
        const result = await Tesseract.recognize(
            selectedDocument.data,
            'chi_tra+eng',
            {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 70) + 30;
                        progressFill.style.width = progress + '%';
                    }
                }
            }
        );
        
        progressFill.style.width = '100%';
        progressText.textContent = 'Complete!';
        
        ocrResults = result.data.words;
        displayOCRResults(result.data.words);
        
        previewEmpty.style.display = 'none';
        previewContent.style.display = 'block';
        applyButton.disabled = false;
        
        setTimeout(() => {
            scanProgress.style.display = 'none';
            scanButton.disabled = false;
        }, 1000);
        
    } catch (error) {
        console.error('OCR Error:', error);
        progressText.textContent = 'Error: Unable to recognize text';
        setTimeout(() => {
            scanProgress.style.display = 'none';
            scanButton.disabled = false;
        }, 2000);
    }
}

function displayOCRResults(words) {
    textBoxesContainer.innerHTML = '';
    
    words.forEach((word, index) => {
        if (word.text.trim()) {
            createTextBox(word, index);
        }
    });
}

function createTextBox(word, index) {
    const textBox = document.createElement('div');
    textBox.className = 'text-box';
    textBox.id = `textbox-${index}`;
    textBox.style.left = word.bbox.x0 + 'px';
    textBox.style.top = word.bbox.y0 + 'px';
    textBox.style.width = (word.bbox.x1 - word.bbox.x0) + 'px';
    textBox.style.height = (word.bbox.y1 - word.bbox.y0) + 'px';
    
    const textarea = document.createElement('textarea');
    textarea.value = word.text;
    textarea.rows = 1;
    textarea.style.width = '100%';
    textarea.style.height = '100%';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-text-box';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = () => textBox.remove();
    
    textBox.appendChild(textarea);
    textBox.appendChild(deleteBtn);
    
    makeDraggable(textBox);
    
    textBoxesContainer.appendChild(textBox);
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        if (e.target.tagName === 'TEXTAREA' || e.target.classList.contains('delete-text-box')) {
            return;
        }
        
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        
        element.classList.add('dragging');
    }
    
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        element.style.top = (element.offsetTop - pos2) + 'px';
        element.style.left = (element.offsetLeft - pos1) + 'px';
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        element.classList.remove('dragging');
    }
}

function adjustZoom(delta) {
    zoomLevel = Math.max(0.5, Math.min(3, zoomLevel + delta));
    applyZoom();
}

function applyZoom() {
    canvasContainer.style.transform = `scale(${zoomLevel})`;
    canvasContainer.style.transformOrigin = 'top left';
}

function resetView() {
    zoomLevel = 1;
    applyZoom();
}

function showDownloadOptions() {
    downloadOptions.style.display = 'flex';
}

async function downloadDocument(format) {
    if (format === 'pdf') {
        await downloadAsPDF();
    } else if (format === 'png') {
        await downloadAsPNG();
    }
    downloadOptions.style.display = 'none';
}

async function downloadAsPDF() {
    const { jsPDF } = window.jspdf;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = documentCanvas.width;
    tempCanvas.height = documentCanvas.height;
    const ctx = tempCanvas.getContext('2d');
    
    ctx.drawImage(documentCanvas, 0, 0);
    
    const textBoxes = textBoxesContainer.querySelectorAll('.text-box');
    textBoxes.forEach(box => {
        const textarea = box.querySelector('textarea');
        const left = parseInt(box.style.left);
        const top = parseInt(box.style.top);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(left, top, parseInt(box.style.width), parseInt(box.style.height));
        
        ctx.fillStyle = '#333';
        ctx.fillText(textarea.value, left + 8, top + 20);
    });
    
    const imgData = tempCanvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: tempCanvas.width > tempCanvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [tempCanvas.width, tempCanvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, tempCanvas.width, tempCanvas.height);
    pdf.save(`${selectedDocument.name.split('.')[0]}_ocr.pdf`);
}

async function downloadAsPNG() {
    const canvas = await html2canvas(canvasContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
    });
    
    const link = document.createElement('a');
    link.download = `${selectedDocument.name.split('.')[0]}_ocr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function clearAll() {
    clearPreview();
    selectedDocument = null;
    updateDocumentGrid();
}

function clearPreview() {
    previewEmpty.style.display = 'flex';
    previewContent.style.display = 'none';
    textBoxesContainer.innerHTML = '';
    ocrResults = [];
    applyButton.disabled = true;
    downloadOptions.style.display = 'none';
    zoomLevel = 1;
    applyZoom();
}

function updateScanButton() {
    scanButton.disabled = !selectedDocument;
}

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateScanButton();
});

window.deleteDocument = deleteDocument;
