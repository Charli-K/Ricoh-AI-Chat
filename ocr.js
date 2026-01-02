let uploadedImages = [];
let currentImage = null;
let textBoxes = [];
let zoomLevel = 1;
let rotation = 0;
let isDragging = false;
let startX, startY;
let canvasOffsetX = 0;
let canvasOffsetY = 0;

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

function toggleMenu() {
    const header = document.getElementById('mainHeader');
    const toggleBtn = document.getElementById('menuToggleBtn');
    
    if (header && toggleBtn) {
        header.classList.toggle('menu-collapsed');
        toggleBtn.classList.toggle('menu-collapsed');
        document.body.classList.toggle('menu-collapsed');
        
        // Save state to localStorage
        const isCollapsed = header.classList.contains('menu-collapsed');
        localStorage.setItem('menuCollapsed', isCollapsed ? 'true' : 'false');
    }
}

function loadMenuState() {
    const menuCollapsed = localStorage.getItem('menuCollapsed');
    const header = document.getElementById('mainHeader');
    const toggleBtn = document.getElementById('menuToggleBtn');
    
    if (menuCollapsed === 'true' && header && toggleBtn) {
        header.classList.add('menu-collapsed');
        toggleBtn.classList.add('menu-collapsed');
        document.body.classList.add('menu-collapsed');
    }
}

function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
}

if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

document.addEventListener('DOMContentLoaded', function() {
    loadDarkModePreference();
    loadMenuState();
    setupEventListeners();
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.text-box')) {
            document.querySelectorAll('.text-box').forEach(box => {
                box.classList.remove('active');
            });
        }
    });
});

function setupEventListeners() {
    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
    
    document.getElementById('zoomIn').addEventListener('click', () => zoom(1.2));
    document.getElementById('zoomOut').addEventListener('click', () => zoom(0.8));
    document.getElementById('rotateLeft').addEventListener('click', () => rotate(-90));
    document.getElementById('rotateRight').addEventListener('click', () => rotate(90));
    document.getElementById('moveMode').addEventListener('click', toggleMoveMode);
    document.getElementById('addTextBox').addEventListener('click', addNewTextBox);
    document.getElementById('applyBtn').addEventListener('click', showDownloadOptions);
    
    const canvas = document.getElementById('ocrCanvas');
    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('mouseleave', endDrag);
}

async function handleImageUpload(event) {
    const files = event.target.files;
    
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = {
                    id: Date.now() + Math.random(),
                    src: e.target.result,
                    name: file.name,
                    type: 'image'
                };
                uploadedImages.push(imageData);
                addImageCard(imageData);
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
            await processPDFFile(file);
        }
    }
    event.target.value = '';
}

async function processPDFFile(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            const imageDataUrl = canvas.toDataURL('image/png');
            
            const imageData = {
                id: Date.now() + Math.random() + pageNum,
                src: imageDataUrl,
                name: `${file.name} - Page ${pageNum}`,
                type: 'pdf',
                pageNum: pageNum,
                totalPages: numPages
            };
            
            uploadedImages.push(imageData);
            addImageCard(imageData);
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`Successfully processed ${numPages} pages from ${file.name}`);
    } catch (error) {
        console.error('Error processing PDF:', error);
        alert(`Failed to process PDF: ${error.message}`);
    }
}

function addImageCard(imageData) {
    const imageCards = document.getElementById('imageCards');
    
    const card = document.createElement('div');
    card.className = 'image-card';
    card.dataset.imageId = imageData.id;
    
    const pageInfo = imageData.type === 'pdf' ? 
        `<div class="page-info">📄 Page ${imageData.pageNum}/${imageData.totalPages}</div>` : '';
    
    card.innerHTML = `
        <img src="${imageData.src}" alt="${imageData.name}">
        ${pageInfo}
        <div class="image-card-actions">
            <button class="scan-btn" onclick="scanImage('${imageData.id}')">
            Scan
            </button>
            <button class="delete-btn" onclick="deleteImage('${imageData.id}')">
            Delete
            </button>
        </div>
    `;
    
    imageCards.appendChild(card);
}

function scanImage(imageId) {
    const imageData = uploadedImages.find(img => img.id == imageId);
    if (!imageData) return;
    
    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) {
        placeholder.classList.add('hidden');
    }
    
    zoomLevel = 1;
    rotation = 0;
    
    document.querySelectorAll('.image-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-image-id="${imageId}"]`).classList.add('active');
    
    currentImage = imageData;
    
    displayImageOnCanvas(imageData, () => {
        performOCR(imageData);
    });
}

function displayImageOnCanvas(imageData, callback) {
    const canvas = document.getElementById('ocrCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('canvasContainer');
    const img = new Image();
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        ctx.drawImage(img, 0, 0);
        ctx.restore();
        
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const padding = 40;
        
        const scaleX = (containerWidth - padding) / img.width;
        const scaleY = (containerHeight - padding) / img.height;
        
        zoomLevel = Math.min(scaleX, scaleY, 1);
        
        canvas.style.transform = `scale(${zoomLevel})`;
        
        setTimeout(() => {
            centerCanvas();
            if (callback) {
                setTimeout(callback, 50);
            }
        }, 10);
    };
    
    img.src = imageData.src;
}

function performOCR(imageData) {
    const scanBtn = document.querySelector(`[data-image-id="${imageData.id}"] .scan-btn`);
    scanBtn.disabled = true;
    scanBtn.innerHTML = '<span class="loading-spinner"></span> Scanning...';
    
    Tesseract.recognize(
        imageData.src,
        'chi_tra+eng',
        {
            logger: info => console.log(info)
        }
    ).then(({ data: { text, words } }) => {
        console.log('OCR Result:', text);
        console.log('Words:', words);
        
        clearTextBoxes();
        
        const canvas = document.getElementById('ocrCanvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        words.forEach((word, index) => {
            if (word.text.trim()) {
                createTextBox(
                    word.bbox.x0,
                    word.bbox.y0,
                    word.bbox.x1 - word.bbox.x0,
                    word.bbox.y1 - word.bbox.y0,
                    word.text
                );
            }
        });
        
        setTimeout(() => {
            updateTextBoxPositions();
        }, 100);
        
        scanBtn.disabled = false;
        scanBtn.innerHTML = '<span>🔍</span> Scan';
    }).catch(err => {
        console.error('OCR Error:', err);
        scanBtn.disabled = false;
        scanBtn.innerHTML = '<span>🔍</span> Scan';
        alert('OCR scan failed, please try again');
    });
}

function createTextBox(x, y, width, height, text) {
    const container = document.getElementById('textBoxContainer');
    const canvas = document.getElementById('ocrCanvas');
    const textBox = document.createElement('div');
    textBox.className = 'text-box';
    
    const minWidth = 150;
    const minHeight = 80;
    const finalWidth = Math.max(width * zoomLevel, minWidth);
    const finalHeight = Math.max(height * zoomLevel, minHeight);
    
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const relativeX = canvasRect.left - containerRect.left + (x * zoomLevel);
    const relativeY = canvasRect.top - containerRect.top + (y * zoomLevel);
    
    textBox.style.left = `${relativeX}px`;
    textBox.style.top = `${relativeY}px`;
    textBox.style.width = `${finalWidth}px`;
    textBox.style.height = `${finalHeight}px`;
    
    textBox.innerHTML = `
        <button class="text-box-delete" onclick="deleteTextBox(this)">×</button>
        <div class="text-box-content">
            <textarea>${text}</textarea>
        </div>
        <div class="text-box-resize-handle"></div>
    `;
    
    makeTextBoxDraggable(textBox);
    
    textBox.addEventListener('click', function(e) {
        document.querySelectorAll('.text-box').forEach(box => {
            box.classList.remove('active');
        });
        textBox.classList.add('active');
    });
    
    const textarea = textBox.querySelector('textarea');
    function adjustHeight() {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
        textBox.style.height = (textarea.scrollHeight + 38) + 'px';
    }
    
    textarea.addEventListener('input', adjustHeight);
    textarea.addEventListener('change', adjustHeight);
    
    setTimeout(adjustHeight, 0);
    
    container.appendChild(textBox);
    textBoxes.push({
        element: textBox,
        x: x,
        y: y,
        originalX: x,
        originalY: y,
        width: Math.max(width, minWidth / zoomLevel),
        height: Math.max(height, minHeight / zoomLevel),
        text: text
    });
}

function addNewTextBox() {
    if (!currentImage) {
        alert('Please upload and scan an image first');
        return;
    }
    
    const canvas = document.getElementById('ocrCanvas');
    const container = document.getElementById('canvasContainer');
    
    const centerX = (container.offsetWidth / 2 - 100) / zoomLevel;
    const centerY = (container.offsetHeight / 2 - 50) / zoomLevel;
    
    createTextBox(centerX, centerY, 200 / zoomLevel, 100 / zoomLevel, 'Enter text here...');
}

function getCanvasBoundaries() {
    const canvas = document.getElementById('ocrCanvas');
    const container = document.getElementById('textBoxContainer');
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    return {
        left: canvasRect.left - containerRect.left,
        top: canvasRect.top - containerRect.top,
        right: canvasRect.right - containerRect.left,
        bottom: canvasRect.bottom - containerRect.top,
        width: canvasRect.width,
        height: canvasRect.height
    };
}

function makeTextBoxDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isResizing = false;
    
    element.onmousedown = dragMouseDown;
    
    const resizeHandle = element.querySelector('.text-box-resize-handle');
    if (resizeHandle) {
        resizeHandle.onmousedown = startResize;
    }
    
    function dragMouseDown(e) {
        if (e.target.tagName === 'TEXTAREA' || 
            e.target.classList.contains('text-box-delete') ||
            e.target.classList.contains('text-box-resize-handle')) {
            return;
        }
        
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        if (isResizing) return;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        let newTop = element.offsetTop - pos2;
        let newLeft = element.offsetLeft - pos1;
        
        const boundaries = getCanvasBoundaries();
        
        const boxWidth = element.offsetWidth;
        const boxHeight = element.offsetHeight;
        
        newLeft = Math.max(boundaries.left, Math.min(newLeft, boundaries.right - boxWidth));
        newTop = Math.max(boundaries.top, Math.min(newTop, boundaries.bottom - boxHeight));
        
        element.style.top = newTop + "px";
        element.style.left = newLeft + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
    
    function startResize(e) {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = element.offsetWidth;
        const startHeight = element.offsetHeight;
        
        function resize(e) {
            const newWidth = startWidth + (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);
            
            const boundaries = getCanvasBoundaries();
            const boxLeft = element.offsetLeft;
            const boxTop = element.offsetTop;
            
            const maxWidth = boundaries.right - boxLeft;
            const maxHeight = boundaries.bottom - boxTop;
            
            const constrainedWidth = Math.max(150, Math.min(newWidth, maxWidth));
            const constrainedHeight = Math.max(80, Math.min(newHeight, maxHeight));
            
            element.style.width = constrainedWidth + 'px';
            element.style.height = constrainedHeight + 'px';
        }
        
        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        }
        
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }
}

function deleteTextBox(button) {
    const textBox = button.parentElement;
    const index = textBoxes.findIndex(tb => tb.element === textBox);
    if (index > -1) {
        textBoxes.splice(index, 1);
    }
    textBox.remove();
}

function clearTextBoxes() {
    const container = document.getElementById('textBoxContainer');
    container.innerHTML = '';
    textBoxes = [];
}

function deleteImage(imageId) {
    const index = uploadedImages.findIndex(img => img.id == imageId);
    if (index > -1) {
        uploadedImages.splice(index, 1);
    }
    
    const card = document.querySelector(`[data-image-id="${imageId}"]`);
    if (card) {
        card.remove();
    }
    
    if (currentImage && currentImage.id == imageId) {
        const canvas = document.getElementById('ocrCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;
        clearTextBoxes();
        currentImage = null;
        
        const placeholder = document.getElementById('canvasPlaceholder');
        if (placeholder) {
            placeholder.classList.remove('hidden');
        }
    }
}

function zoom(factor) {
    zoomLevel *= factor;
    zoomLevel = Math.max(0.1, Math.min(5, zoomLevel));
    
    if (currentImage) {
        const canvas = document.getElementById('ocrCanvas');
        canvas.style.transform = `scale(${zoomLevel})`;
        
        centerCanvas();
        
        updateTextBoxPositions();
    }
}

function updateTextBoxPositions() {
    const canvas = document.getElementById('ocrCanvas');
    const container = document.getElementById('textBoxContainer');
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    textBoxes.forEach(tb => {
        const relativeX = canvasRect.left - containerRect.left + (tb.originalX * zoomLevel);
        const relativeY = canvasRect.top - containerRect.top + (tb.originalY * zoomLevel);
        
        tb.element.style.left = `${relativeX}px`;
        tb.element.style.top = `${relativeY}px`;
        tb.element.style.width = `${tb.width * zoomLevel}px`;
        tb.element.style.height = `${tb.height * zoomLevel}px`;
    });
}

function rotate(degrees) {
    rotation = (rotation + degrees) % 360;
    if (currentImage) {
        displayImageOnCanvas(currentImage);
    }
}

let moveMode = false;
function toggleMoveMode() {
    moveMode = !moveMode;
    const button = document.getElementById('moveMode');
    button.classList.toggle('active', moveMode);
    
    const canvas = document.getElementById('ocrCanvas');
    if (moveMode) {
        canvas.style.cursor = 'grab';
    } else {
        canvas.style.cursor = 'default';
    }
}

function startDrag(e) {
    if (moveMode) {
        isDragging = true;
        startX = e.clientX - canvasOffsetX;
        startY = e.clientY - canvasOffsetY;
        e.target.style.cursor = 'grabbing';
    }
}

function drag(e) {
    if (isDragging && moveMode) {
        canvasOffsetX = e.clientX - startX;
        canvasOffsetY = e.clientY - startY;
        
        const canvas = document.getElementById('ocrCanvas');
        canvas.style.left = `${canvasOffsetX}px`;
        canvas.style.top = `${canvasOffsetY}px`;
        
        updateTextBoxPositions();
    }
}

function endDrag(e) {
    if (isDragging) {
        isDragging = false;
        if (moveMode) {
            e.target.style.cursor = 'grab';
        }
    }
}

function centerCanvas() {
    const canvas = document.getElementById('ocrCanvas');
    const container = document.getElementById('canvasContainer');
    
    if (!canvas.width || !canvas.height) return;
    
    const scaledWidth = canvas.width * zoomLevel;
    const scaledHeight = canvas.height * zoomLevel;
    
    canvasOffsetX = (container.offsetWidth - scaledWidth) / 2;
    canvasOffsetY = (container.offsetHeight - scaledHeight) / 2;
    
    canvas.style.left = `${canvasOffsetX}px`;
    canvas.style.top = `${canvasOffsetY}px`;
    canvas.style.transformOrigin = 'top left';
}

function showDownloadOptions() {
    if (!currentImage) {
        alert('Please scan an image first');
        return;
    }
    document.getElementById('downloadOptions').style.display = 'block';
}

function hideDownloadOptions() {
    document.getElementById('downloadOptions').style.display = 'none';
}

async function downloadAs(format) {
    hideDownloadOptions();
    
    const canvas = document.getElementById('ocrCanvas');
    const container = document.getElementById('canvasContainer');
    
    const deleteButtons = document.querySelectorAll('.text-box-delete');
    const resizeHandles = document.querySelectorAll('.text-box-resize-handle');
    const textBoxElements = document.querySelectorAll('.text-box');
    
    const originalStyles = [];
    textBoxElements.forEach(box => {
        originalStyles.push({
            border: box.style.border,
            boxShadow: box.style.boxShadow,
            cursor: box.style.cursor
        });
        box.style.border = 'none';
        box.style.boxShadow = 'none';
        box.style.cursor = 'default';
    });
    
    deleteButtons.forEach(btn => btn.style.display = 'none');
    resizeHandles.forEach(handle => handle.style.display = 'none');
    
    const maxWidth = 2480;
    const maxHeight = 3508;
    
    let exportWidth = canvas.width;
    let exportHeight = canvas.height;
    let scale = 1;
    
    if (exportWidth > maxWidth || exportHeight > maxHeight) {
        const widthScale = maxWidth / exportWidth;
        const heightScale = maxHeight / exportHeight;
        scale = Math.min(widthScale, heightScale);
        exportWidth = Math.floor(exportWidth * scale);
        exportHeight = Math.floor(exportHeight * scale);
    }
    
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    const exportCtx = exportCanvas.getContext('2d');
    
    exportCtx.fillStyle = '#FFFFFF';
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    
    const baseFontSize = Math.max(24, Math.floor(exportWidth / 40));
    
    for (const tb of textBoxes) {
        const textarea = tb.element.querySelector('textarea');
        const text = textarea.value;
        
        if (!text.trim()) continue;
        
        const canvasElem = document.getElementById('ocrCanvas');
        const containerElem = document.getElementById('textBoxContainer');
        const canvasRect = canvasElem.getBoundingClientRect();
        const containerRect = containerElem.getBoundingClientRect();
        
        const currentLeft = parseInt(tb.element.style.left) || 0;
        const currentTop = parseInt(tb.element.style.top) || 0;
        
        const canvasOffsetLeft = canvasRect.left - containerRect.left;
        const canvasOffsetTop = canvasRect.top - containerRect.top;
        
        const x = ((currentLeft - canvasOffsetLeft) / zoomLevel) * scale;
        const y = ((currentTop - canvasOffsetTop) / zoomLevel) * scale;
        
        const currentWidth = parseInt(tb.element.style.width) || tb.width * zoomLevel;
        const currentHeight = parseInt(tb.element.style.height) || tb.height * zoomLevel;
        
        const width = (currentWidth / zoomLevel) * scale;
        const height = (currentHeight / zoomLevel) * scale;
        
        const paddingTop = 30 * scale;
        const paddingOther = 8 * scale;
        const contentY = y + paddingTop;
        
        const lines = text.split('\n');
        const lineHeight = baseFontSize * 1.4;
        const requiredTextHeight = lines.length * lineHeight;
        const requiredTotalHeight = requiredTextHeight + paddingTop + paddingOther;
        
        const finalHeight = Math.max(height, requiredTotalHeight);
        
        exportCtx.fillStyle = '#000000';
        exportCtx.font = `bold ${baseFontSize}px Arial`;
        exportCtx.textBaseline = 'top';
        
        lines.forEach((line, index) => {
            const textY = contentY + (index * lineHeight);
            exportCtx.fillText(line, x + paddingOther + 5, textY);
        });
    }
    
    textBoxElements.forEach((box, index) => {
        box.style.border = originalStyles[index].border;
        box.style.boxShadow = originalStyles[index].boxShadow;
        box.style.cursor = originalStyles[index].cursor;
    });
    
    deleteButtons.forEach(btn => btn.style.display = 'flex');
    resizeHandles.forEach(handle => handle.style.display = 'block');
    
    if (format === 'pdf') {
        downloadPDF(exportCanvas);
    } else if (format === 'jpg') {
        downloadImage(exportCanvas, 'jpeg');
    } else if (format === 'png') {
        downloadImage(exportCanvas, 'png');
    }
}

function downloadImage(canvas, format) {
    const link = document.createElement('a');
    link.download = `ocr-result-${Date.now()}.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
}

function downloadPDF(canvas) {
    const { jsPDF } = window.jspdf;
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`ocr-result-${Date.now()}.pdf`);
}