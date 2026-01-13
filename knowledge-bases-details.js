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

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM loaded, initializing...');
  
  loadKnowledgeBaseDetails();
});

const defaultKnowledgeBases = [
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
    name: "CVs",
    description: "Sample CVs and resumes for HR reference.",
    category: "general",
    status: "active",
    createdDate: "2024-05-15",
    modifiedDate: "2024-09-20",
    path: "\\Knowledge Base A\\HR\\CVs",
    documents: [
      { 
        name: "Sample_CV_1.pdf", 
        size: 234000,
        pages: [
          { page: 1, content: "Jane A. Smith 456 Oak Avenue, Springfield, IL 62701 | (217) 555-1234 | jane.smith@email.com | linkedin.com/in/janesmith Professional Summary Results-oriented Human Resources professional with over 6 years of experience in talent acquisition, employee engagement, and HR policy development. Proficient in fostering inclusive workplace cultures and driving strategic HR initiatives. Skilled in leveraging HR analytics to improve retention and streamline processes. Passionate about aligning HR practices with organizational objectives to support business growth." },
        ]
      },
      { 
        name: "Sample_CV_2.pdf", 
        size: 189000,
        pages: [
          { page: 1, content: "Alex R. Johnson 789 Pine Road, Austin, TX 78701 | (512) 555-9876 | alex.johnson@email.com | linkedin.com/in/alexjohnson Professional Summary Dynamic Human Resources professional with 7 years of experience in talent management, employee relations, and organizational development. Expert in designing recruitment strategies and fostering positive workplace environments. Proficient in HR analytics to drive data-informed decisions and enhance employee satisfaction. Committed to supporting business objectives through strategic HR initiatives." },
        ]
      },
      { 
        name: "Sample_CV_4.pdf", 
        size: 267000,
        pages: [
          { page: 1, content: "Michael T. Lee 654 Cedar Lane, Denver, CO 80203 | (303) 555-3210 | michael.lee@email.com | linkedin.com/in/michaeltlee Professional Summary Accomplished Human Resources professional with 7 years of experience in recruitment, employee engagement, and HR policy development. Skilled in leveraging HR analytics to optimize workforce planning and enhance organizational performance. Proficient in fostering collaborative workplace cultures and ensuring compliance with labor regulations. Dedicated to driving strategic HR solutions that align with business objectives." },
          { page: 2, content: "Work Experience Human Resources Manager Summit Peak Consulting Group, Boulder, CO August 2017 May 2019 Oversaw performance management for 280+ employees, implementing a goal-setting framework that increased productivity by 12. Designed training modules on workplace ethics, achieving 98% completion rate. Managed recruitment for 65+ roles annually, achieving a 92% offer acceptance rate." },
          { page: 3, content: "HR Generalist Peak Consulting Group, Boulder, CO August 2017 May 2019 Managed recruitment for 65+ roles annually, achieving a 92% completion rate. Administered payroll and benefits, resolving 96% of inquiries within 24 hours. Conducted compliance audits for HRIS data, reducing errors by 15%." },
          { page: 4, content: "Administered payroll and benefits, resolving 96% of inquiries within 24 hours. Conducted compliance audits for HRIS data, reducing errors by 15%. Supported policy development to align with Colorado employment laws, minimizing legal risks. Education Bachelor of Science in Human Resource Management University of Colorado, Denver Graduated May 2015" }
        ]
      }
    ]
  },
];

// Load knowledge bases from localStorage or use default
function loadKnowledgeBasesData() {
  const stored = localStorage.getItem('knowledgeBases');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored knowledge bases:', e);
      return [...defaultKnowledgeBases];
    }
  }
  return [...defaultKnowledgeBases];
}

let knowledgeBases = loadKnowledgeBasesData();

let currentKnowledgeBase = null;
let allFiles = [];
let allDocumentPages = [];

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
    pdf: '',
    doc: '',
    docx: '',
    txt: '',
    xlsx: '',
    xls: '',
    ppt: '',
    pptx: ''
  };
  return icons[ext] || '';
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
  pathElement.innerHTML = `<a href="https://apps.ricohsolution.com.hk:1443/Laserfiche/Browse.aspx?repo=Ricoh-BPA#?id=1" target="_blank" style="color: #00a2ff; text-decoration: underline;">${pathText}</a>`;

  document.getElementById('detailCreatedDate').textContent = formatDate(currentKnowledgeBase.createdDate);
  document.getElementById('detailModifiedDate').textContent = formatDate(currentKnowledgeBase.modifiedDate);

  // Load files
  allFiles = currentKnowledgeBase.documents || [];
  
  // Build document pages index for search
  allDocumentPages = [];
  allFiles.forEach(file => {
    if (file.pages && file.pages.length > 0) {
      file.pages.forEach(page => {
        allDocumentPages.push({
          fileName: file.name,
          page: page.page,
          content: page.content
        });
      });
    }
  });
  
  renderFiles(allFiles);

  // Attach file search event listener
  document.getElementById('fileSearch').addEventListener('input', handleFileSearch);

  console.log('KB details loaded successfully');
}

// Chat with Knowledge Base function
function chatWithKnowledgeBase() {
  if (currentKnowledgeBase) {
    // Store the selected KB ID in localStorage
    localStorage.setItem('selectedKnowledgeBaseId', currentKnowledgeBase.id);
    localStorage.setItem('selectedKnowledgeBaseName', currentKnowledgeBase.name);
    
    // Redirect to AI Chat page
    window.location.href = 'AI Chat.html';
  }
}

function renderFiles(files) {
  const filesGrid = document.getElementById('searchResults');

  if (!files || files.length === 0) {
    filesGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-text">No documents found</div>
        <div class="empty-state-subtext">This knowledge base has no documents yet</div>
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
  const searchTerm = event.target.value.toLowerCase().trim();
  const searchResults = document.getElementById('searchResults');

  if (!searchTerm) {
    renderFiles(allFiles);
    return;
  }

  // Search in document pages
  const results = allDocumentPages.filter(pageData => 
    pageData.content.toLowerCase().includes(searchTerm)
  );

  if (results.length === 0) {
    searchResults.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-text">No results found</div>
        <div class="empty-state-subtext">Try different keywords or check your spelling</div>
      </div>
    `;
    return;
  }

  // Render search results
  searchResults.innerHTML = results.map(result => {
    const contentSnippet = getHighlightedSnippet(result.content, searchTerm);
    const documentTitle = `${result.fileName.replace('.pdf', '')} (page ${result.page})`;
    
    return `
      <div class="search-result-item" onclick="viewDocumentPage('${result.fileName}', ${result.page})">
        <div class="search-result-header">
          <h3 class="search-result-title">${documentTitle}</h3>
          <span class="search-result-arrow">→</span>
        </div>
        <p class="search-result-content">${contentSnippet}</p>
      </div>
    `;
  }).join('');
}

function getHighlightedSnippet(content, searchTerm) {
  const lowerContent = content.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const index = lowerContent.indexOf(lowerSearchTerm);
  
  if (index === -1) return content.substring(0, 500) + '...';
  
  // Get context around the search term - show more characters
  const start = Math.max(0, index - 500);
  const end = Math.min(content.length, index + searchTerm.length + 500);
  let snippet = content.substring(start, end);
  
  // Add ellipsis if needed
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  
  // Highlight the search term
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  snippet = snippet.replace(regex, '<span class="search-result-highlight">$1</span>');
  
  return snippet;
}

function viewDocumentPage(fileName, pageNumber) {
  // Get the path from current knowledge base
  const path = currentKnowledgeBase?.path || '\\Knowledge Base\\Default';
  
  // In production, this would open the actual document in Laserfiche or document viewer
  // For demo, we'll open the Laserfiche URL with the document reference
  const laserficheUrl = `https://apps.ricohsolution.com.hk:1443/Laserfiche/Browse.aspx?repo=Ricoh-BPA#?id=1&page=${pageNumber}`;
  
  // Open in new tab
  window.open(laserficheUrl, '_blank');
  
  // Alternative: If you have a local PDF viewer page
  // window.open(`document-viewer.html?file=${encodeURIComponent(fileName)}&page=${pageNumber}`, '_blank');
}
