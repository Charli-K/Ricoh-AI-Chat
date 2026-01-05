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

// Tooltip functionality
document.addEventListener('DOMContentLoaded', () => {
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  let activeTooltip = null;
  
  tooltipElements.forEach(element => {
    element.addEventListener('mouseenter', function(e) {
      // Remove any existing tooltip
      if (activeTooltip) {
        activeTooltip.tooltip.remove();
        activeTooltip.arrow.remove();
      }
      
      const tooltipText = this.getAttribute('data-tooltip');
      const rect = this.getBoundingClientRect();
      
      // Create tooltip container
      const tooltip = document.createElement('div');
      tooltip.className = 'custom-tooltip';
      tooltip.textContent = tooltipText;
      
      // Create arrow
      const arrow = document.createElement('div');
      arrow.className = 'custom-tooltip-arrow';
      
      document.body.appendChild(tooltip);
      document.body.appendChild(arrow);
      
      // Position tooltip
      const tooltipTop = rect.top + rect.height / 2;
      tooltip.style.top = `${tooltipTop}px`;
      tooltip.style.left = `${20 + 100 + 15}px`;
      
      arrow.style.top = `${tooltipTop}px`;
      arrow.style.left = `${20 + 100 + 3}px`;
      
      activeTooltip = { tooltip, arrow };
    });
    
    element.addEventListener('mouseleave', function() {
      if (activeTooltip) {
        activeTooltip.tooltip.remove();
        activeTooltip.arrow.remove();
        activeTooltip = null;
      }
    });
  });
});

loadDarkModePreference();
loadMenuState();

let knowledgeBases = [
  {
    id: 1,
    name: "Product Documentation",
    description: "Comprehensive product documentation including user manuals, technical specifications, and troubleshooting guides for all Ricoh products.",
    category: "product",
    status: "active",
    createdDate: "2024-01-15",
    modifiedDate: "2024-12-10",
    path: "\\Knowledge Base A\\Product Documentation",
    documents: [
      { name: "Product_Manual_2024.pdf", size: 2458000 },
      { name: "Technical_Specs.docx", size: 856000 }
    ]
  },
  {
    id: 2,
    name: "Customer Support FAQs",
    description: "Frequently asked questions and answers for common customer support inquiries.",
    category: "support",
    status: "active",
    createdDate: "2024-02-20",
    modifiedDate: "2024-12-08",
    path: "\\Knowledge Base A\\Customer Support",
    documents: [
      { name: "FAQ_Database.xlsx", size: 345000 }
    ]
  },
  {
    id: 3,
    name: "Technical Troubleshooting",
    description: "Technical troubleshooting procedures and solutions for complex issues.",
    category: "technical",
    status: "active",
    createdDate: "2024-03-10",
    modifiedDate: "2024-11-28",
    path: "\\Knowledge Base B\\Technical",
    documents: []
  },
  {
    id: 4,
    name: "Company Policies",
    description: "Internal policies, procedures, and guidelines for employees and contractors.",
    category: "policy",
    status: "draft",
    createdDate: "2024-11-01",
    modifiedDate: "2024-12-05",
    path: "\\Knowledge Base C\\Policies",
    documents: []
  },
  {
    id: 5,
    name: "Sales Training Materials",
    description: "Training materials and resources for sales team including pitch decks and product comparisons.",
    category: "general",
    status: "inactive",
    createdDate: "2024-05-15",
    modifiedDate: "2024-09-20",
    path: "\\Knowledge Base A\\Sales",
    documents: [
      { name: "Sales_Pitch_Deck.pptx", size: 5678000 },
      { name: "Product_Comparison.xlsx", size: 234000 },
      { name: "Training_Guide.pdf", size: 1890000 }
    ]
  },
];

let nextId = 6;
let currentEditId = null;
let currentDeleteId = null;
let uploadedFiles = [];

const kbGrid = document.getElementById('kbGrid');
const kbSearch = document.getElementById('kbSearch');
const kbSort = document.getElementById('kbSort');
const createKbBtn = document.getElementById('createKbBtn');
const kbModal = document.getElementById('kbModal');
const deleteModal = document.getElementById('deleteModal');
const detailModal = document.getElementById('detailModal');
const modalClose = document.getElementById('modalClose');
const deleteModalClose = document.getElementById('deleteModalClose');
const detailModalClose = document.getElementById('detailModalClose');
const kbForm = document.getElementById('kbForm');
const cancelBtn = document.getElementById('cancelBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const modalTitle = document.getElementById('modalTitle');
const fileUploadArea = document.getElementById('fileUploadArea');
const fileInput = document.getElementById('fileInput');
const uploadedFilesContainer = document.getElementById('uploadedFiles');

function init() {
  renderKnowledgeBases();
  attachEventListeners();
  setupFileUpload();
}

function renderKnowledgeBases(filter = '', sortBy = 'name') {
  let filtered = knowledgeBases.filter(kb => 
    kb.name.toLowerCase().includes(filter.toLowerCase()) ||
    kb.description.toLowerCase().includes(filter.toLowerCase())
  );
  
  filtered.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'created') {
      return new Date(b.createdDate) - new Date(a.createdDate);
    } else if (sortBy === 'modified') {
      return new Date(b.modifiedDate) - new Date(a.modifiedDate);
    }
    return 0;
  });
  
  if (filtered.length === 0) {
    kbGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <div class="empty-state-text">No knowledge bases found</div>
        <div class="empty-state-subtext">Create your first knowledge base to get started</div>
      </div>
    `;
    return;
  }
  
  kbGrid.innerHTML = filtered.map(kb => `
    <div class="kb-card" data-id="${kb.id}" onclick="window.location.href='Knowledge_Bases_Details.html?id=${kb.id}'" style="cursor: pointer;">
      <div class="kb-card-header">
        <div>
          <h3 class="kb-card-title">${kb.name}</h3>
          <div class="kb-card-category">${kb.category}</div>
        </div>
        <div class="kb-card-actions">
          <button class="kb-action-btn edit" onclick="event.stopPropagation(); editKnowledgeBase(${kb.id})" title="Edit"><img src="edit.png" alt="Edit" width="20" /></button>
          <button class="kb-action-btn delete" onclick="event.stopPropagation(); deleteKnowledgeBase(${kb.id})" title="Delete"><img src="delete.png" alt="Delete" width="20" /></button>
        </div>
      </div>
      <p class="kb-card-description">${kb.description || 'No description available'}</p>
      <div class="kb-card-meta">
        <div class="kb-meta-item">
          <span class="kb-meta-label">Status:</span>
          <span class="kb-card-status ${kb.status}">${kb.status}</span>
        </div>
        <div class="kb-meta-item">
          <span class="kb-meta-label">Created:</span>
          <span>${formatDate(kb.createdDate)}</span>
        </div>
        <div class="kb-meta-item">
          <span class="kb-meta-label">Modified:</span>
          <span>${formatDate(kb.modifiedDate)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function attachEventListeners() {
  createKbBtn.addEventListener('click', openCreateModal);
  modalClose.addEventListener('click', closeModal);
  deleteModalClose.addEventListener('click', closeDeleteModal);
  detailModalClose.addEventListener('click', closeDetailModal);
  cancelBtn.addEventListener('click', closeModal);
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  confirmDeleteBtn.addEventListener('click', confirmDelete);
  kbForm.addEventListener('submit', saveKnowledgeBase);
  
  kbSearch.addEventListener('input', (e) => {
    renderKnowledgeBases(e.target.value, kbSort.value);
  });
  
  kbSort.addEventListener('change', (e) => {
    renderKnowledgeBases(kbSearch.value, e.target.value);
  });
  
  kbModal.addEventListener('click', (e) => {
    if (e.target === kbModal) closeModal();
  });
  
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeDetailModal();
  });
}

function openCreateModal() {
  currentEditId = null;
  uploadedFiles = [];
  modalTitle.textContent = 'Create Knowledge Base';
  kbForm.reset();
  document.getElementById('kbId').value = '';
  document.getElementById('kbStatus').value = 'active';
  renderUploadedFiles();
  kbModal.classList.add('active');
}

function editKnowledgeBase(id) {
  currentEditId = id;
  const kb = knowledgeBases.find(k => k.id === id);
  
  if (kb) {
    modalTitle.textContent = 'Edit Knowledge Base';
    document.getElementById('kbId').value = kb.id;
    document.getElementById('kbName').value = kb.name;
    document.getElementById('kbDescription').value = kb.description;
    document.getElementById('kbCategory').value = kb.category;
    document.getElementById('kbStatus').value = kb.status;
    uploadedFiles = kb.documents ? [...kb.documents] : [];
    renderUploadedFiles();
    kbModal.classList.add('active');
  }
}

function saveKnowledgeBase(e) {
  e.preventDefault();
  
  const id = document.getElementById('kbId').value;
  const name = document.getElementById('kbName').value;
  const description = document.getElementById('kbDescription').value;
  const category = document.getElementById('kbCategory').value;
  const status = document.getElementById('kbStatus').value;
  
  if (id) {
    const kb = knowledgeBases.find(k => k.id === parseInt(id));
    if (kb) {
      kb.name = name;
      kb.description = description;
      kb.category = category;
      kb.status = status;
      kb.modifiedDate = new Date().toISOString().split('T')[0];
      kb.documents = [...uploadedFiles];
    }
  } else {
    knowledgeBases.push({
      id: nextId++,
      name,
      description,
      category,
      status,
      createdDate: new Date().toISOString().split('T')[0],
      modifiedDate: new Date().toISOString().split('T')[0],
      documents: [...uploadedFiles]
    });
  }
  
  closeModal();
  renderKnowledgeBases(kbSearch.value, kbSort.value);
}

function deleteKnowledgeBase(id) {
  currentDeleteId = id;
  const kb = knowledgeBases.find(k => k.id === id);
  
  if (kb) {
    document.getElementById('deleteKbName').textContent = kb.name;
    deleteModal.classList.add('active');
  }
}

function confirmDelete() {
  if (currentDeleteId) {
    knowledgeBases = knowledgeBases.filter(kb => kb.id !== currentDeleteId);
    currentDeleteId = null;
    closeDeleteModal();
    renderKnowledgeBases(kbSearch.value, kbSort.value);
  }
}

function closeModal() {
  kbModal.classList.remove('active');
  kbForm.reset();
  currentEditId = null;
  uploadedFiles = [];
  renderUploadedFiles();
}

function closeDeleteModal() {
  deleteModal.classList.remove('active');
  currentDeleteId = null;
}

function closeDetailModal() {
  detailModal.classList.remove('active');
}

function showKnowledgeBaseDetail(id) {
  const kb = knowledgeBases.find(k => k.id === id);
  
  if (kb) {
    document.getElementById('detailKbName').textContent = kb.name;
    document.getElementById('detailKbCategory').textContent = kb.category;
    document.getElementById('detailKbCategory').className = 'kb-card-category';
    
    const statusElement = document.getElementById('detailKbStatus');
    statusElement.textContent = kb.status;
    statusElement.className = `kb-card-status ${kb.status}`;
    
    document.getElementById('detailKbDescription').textContent = kb.description || 'No description available';
    
    const pathElement = document.getElementById('detailKbPath');
    pathElement.textContent = kb.path || '\\Knowledge Base\\Default';
    
    document.getElementById('detailKbCreated').textContent = formatDate(kb.createdDate);
    document.getElementById('detailKbModified').textContent = formatDate(kb.modifiedDate);
    
    const documentsContainer = document.getElementById('detailKbDocuments');
    if (kb.documents && kb.documents.length > 0) {
      documentsContainer.innerHTML = kb.documents.map(doc => `
        <div style="display: flex; align-items: center; padding: 10px; background: #f5f5f5; border-radius: 4px; margin-bottom: 8px;">
          <div style="margin-right: 10px; font-size: 20px;">${getFileIcon(doc.name)}</div>
          <div style="flex: 1;">
            <div style="font-weight: 500; margin-bottom: 2px;">${doc.name}</div>
            <div style="font-size: 12px; color: #666;">${formatFileSize(doc.size)}</div>
          </div>
        </div>
      `).join('');
    } else {
      documentsContainer.innerHTML = '<p style="color: #999; margin: 0;">No documents uploaded</p>';
    }
    
    detailModal.classList.add('active');
  }
}

function setupFileUpload() {
  fileUploadArea.addEventListener('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = ''; 
  });
  
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
}

function handleFiles(files) {
  Array.from(files).forEach(file => {
    if (!uploadedFiles.some(f => f.name === file.name)) {
      uploadedFiles.push({
        name: file.name,
        size: file.size
      });
    }
  });
  renderUploadedFiles();
}

function renderUploadedFiles() {
  if (uploadedFiles.length === 0) {
    uploadedFilesContainer.innerHTML = '';
    return;
  }
  
  uploadedFilesContainer.innerHTML = uploadedFiles.map((file, index) => `
    <div class="file-item">
      <div class="file-info">
        <div class="file-icon">${getFileIcon(file.name)}</div>
        <div class="file-details">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
      </div>
      <button type="button" class="file-remove" onclick="removeFile(${index})" title="Remove">×</button>
    </div>
  `).join('');
}

function removeFile(index) {
  uploadedFiles.splice(index, 1);
  renderUploadedFiles();
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    pdf: '📕',
    doc: '📘',
    docx: '📘',
    txt: '📄',
    xlsx: '📊',
    xls: '📊',
    ppt: '📙',
    pptx: '📙'
  };
  return icons[ext] || '📄';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (kbModal.classList.contains('active')) closeModal();
    if (deleteModal.classList.contains('active')) closeDeleteModal();
    if (detailModal.classList.contains('active')) closeDetailModal();
  }
});

init();
