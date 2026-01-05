// Dark mode and menu toggle functions (from knowledge-bases.js)
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

loadDarkModePreference();
loadMenuState();

// Initialize everything after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM loaded, initializing...');

  // Setup tooltips
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  let activeTooltip = null;

  tooltipElements.forEach(element => {
    element.addEventListener('mouseenter', function (e) {
      if (activeTooltip) {
        activeTooltip.tooltip.remove();
        activeTooltip.arrow.remove();
      }

      const tooltipText = this.getAttribute('data-tooltip');
      const rect = this.getBoundingClientRect();

      const tooltip = document.createElement('div');
      tooltip.className = 'custom-tooltip';
      tooltip.textContent = tooltipText;

      const arrow = document.createElement('div');
      arrow.className = 'custom-tooltip-arrow';

      document.body.appendChild(tooltip);
      document.body.appendChild(arrow);

      const tooltipTop = rect.top + rect.height / 2;
      tooltip.style.top = `${tooltipTop}px`;
      tooltip.style.left = `${20 + 100 + 15}px`;

      arrow.style.top = `${tooltipTop}px`;
      arrow.style.left = `${20 + 100 + 3}px`;

      activeTooltip = { tooltip, arrow };
    });

    element.addEventListener('mouseleave', function () {
      if (activeTooltip) {
        activeTooltip.tooltip.remove();
        activeTooltip.arrow.remove();
        activeTooltip = null;
      }
    });
  });

  // Load knowledge base details
  loadKnowledgeBaseDetails();
});

// Knowledge Bases Details Page Script
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

let currentKnowledgeBase = null;
let allFiles = [];

function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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

function loadKnowledgeBaseDetails() {
  console.log('Loading KB details...');
  const kbId = parseInt(getUrlParameter('id'));
  console.log('KB ID from URL:', kbId);

  if (!kbId || isNaN(kbId)) {
    // If no ID provided, show first knowledge base for demo or redirect
    console.log('No valid ID, using first KB');
    currentKnowledgeBase = knowledgeBases[0];
    // Uncomment below to redirect instead:
    // window.location.href = 'Knowledge_Bases.html';
    // return;
  } else {
    currentKnowledgeBase = knowledgeBases.find(kb => kb.id === kbId);
    console.log('Found KB:', currentKnowledgeBase);
  }

  if (!currentKnowledgeBase) {
    alert('Knowledge Base not found! Redirecting...');
    window.location.href = 'Knowledge_Bases.html';
    return;
  }

  console.log('Updating UI with KB data:', currentKnowledgeBase.name);

  // Update page title
  document.getElementById('kbDetailName').textContent = currentKnowledgeBase.name;

  // Update details
  document.getElementById('detailName').textContent = currentKnowledgeBase.name;
  document.getElementById('detailDescription').textContent = currentKnowledgeBase.description || 'No description available';

  const tagElement = document.getElementById('detailTag').querySelector('.kb-card-category');
  tagElement.textContent = currentKnowledgeBase.category;

  const statusElement = document.getElementById('detailStatus').querySelector('.kb-card-status');
  statusElement.textContent = currentKnowledgeBase.status;
  statusElement.className = `kb-card-status ${currentKnowledgeBase.status}`;

  // Update path with link
  const pathElement = document.getElementById('detailPath');
  const pathText = currentKnowledgeBase.path || '\\Knowledge Base\\Default';
  pathElement.innerHTML = `<a href="https://apps.ricohsolution.com.hk:1443/Laserfiche/Browse.aspx?repo=Ricoh-BPA#?id=1" target="_blank" style="color: #0066cc; text-decoration: none;">${pathText}</a>`;

  document.getElementById('detailCreatedDate').textContent = formatDate(currentKnowledgeBase.createdDate);
  document.getElementById('detailModifiedDate').textContent = formatDate(currentKnowledgeBase.modifiedDate);

  // Load files
  allFiles = currentKnowledgeBase.documents || [];
  renderFiles(allFiles);

  // Attach file search event listener
  document.getElementById('fileSearch').addEventListener('input', handleFileSearch);

  console.log('KB details loaded successfully');
}

function renderFiles(files) {
  const filesGrid = document.getElementById('filesGrid');

  if (!files || files.length === 0) {
    filesGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📄</div>
        <div class="empty-state-text">No files found</div>
        <div class="empty-state-subtext">Upload files to this knowledge base to get started</div>
      </div>
    `;
    return;
  }

  filesGrid.innerHTML = files.map(file => `
    <div class="file-card">
      <div class="file-card-icon">${getFileIcon(file.name)}</div>
      <div class="file-card-info">
        <div class="file-card-name">${file.name}</div>
        <div class="file-card-size">${formatFileSize(file.size)}</div>
      </div>
    </div>
  `).join('');
}

function handleFileSearch(event) {
  const searchTerm = event.target.value.toLowerCase();

  if (!searchTerm) {
    renderFiles(allFiles);
    return;
  }

  const filteredFiles = allFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm)
  );

  renderFiles(filteredFiles);
}
