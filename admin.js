// Admin Page - Column Configuration Management

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
}

loadDarkModePreference();

// Column definitions for each process
let columnConfig = {
    common: [
        { index: 0, name: 'Process', editable: false },
        { index: 1, name: 'Instance', editable: false },
        { index: 2, name: 'Created Date', editable: false },
        { index: 3, name: 'Department', editable: false },
        { index: 4, name: 'Status', editable: false },
        { index: 5, name: 'Assigned To', editable: false }
    ],
    'Card / Loan Application': [
        { index: 6, name: 'Applicant Name', editable: true },
        { index: 7, name: 'ID / Account Number', editable: true },
        { index: 8, name: 'Loan Amount / Credit Limit', editable: true },
        { index: 9, name: 'Interest Rate', editable: true },
        { index: 10, name: 'Approval Date', editable: true },
        { index: 11, name: 'Supporting Documents', editable: true }
    ],
    'Budget Review': [
        { index: 12, name: 'Budget Period', editable: true },
        { index: 13, name: 'Requested Amount', editable: true },
        { index: 14, name: 'Approved Amount', editable: true },
        { index: 15, name: 'Cost Center', editable: true },
        { index: 16, name: 'Reviewer', editable: true },
        { index: 17, name: 'Justification', editable: true }
    ],
    'Sales Report': [
        { index: 18, name: 'Report Period', editable: true },
        { index: 19, name: 'Region / Market', editable: true },
        { index: 20, name: 'Sales Amount', editable: true },
        { index: 21, name: 'Product Category', editable: true }
    ],
    'Client Survey': [
        { index: 22, name: 'Client Name', editable: true },
        { index: 23, name: 'Survey Date', editable: true },
        { index: 24, name: 'Survey Type', editable: true },
        { index: 25, name: 'Score / Rating', editable: true }
    ]
};

let currentProcess = '';

// Load column config from localStorage if exists
function loadColumnConfig() {
    const saved = localStorage.getItem('columnConfig');
    if (saved) {
        try {
            const loadedConfig = JSON.parse(saved);
            
            // Clean up invalid process names (remove anything with numbers at the end)
            const cleanedConfig = { common: loadedConfig.common || columnConfig.common };
            
            for (const [key, value] of Object.entries(loadedConfig)) {
                if (key === 'common') continue;
                
                // Check if this is a valid process name
                const validProcesses = [
                    'Card / Loan Application',
                    'Budget Review',
                    'Sales Report',
                    'Client Survey'
                ];
                
                if (validProcesses.includes(key)) {
                    cleanedConfig[key] = value;
                } else {
                    console.warn(`Invalid process name found and removed: ${key}`);
                }
            }
            
            columnConfig = cleanedConfig;
            saveColumnConfig(); // Save cleaned config
        } catch (e) {
            console.error('Failed to load column config:', e);
        }
    }
}

// Save column config to localStorage
function saveColumnConfig() {
    localStorage.setItem('columnConfig', JSON.stringify(columnConfig));
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadColumnConfig();
    setupMainTabs();
    setupTabs();
    renderColumns(currentProcess);
    
    // Show columns section by default
    showSection('columns');
});

// Switch main tab
function switchMainTab(section) {
    // Update active state
    const tabs = document.querySelectorAll('.admin-main-tab');
    tabs.forEach(tab => {
        if (tab.dataset.section === section) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Show corresponding section
    showSection(section);
}

// Show specific section
function showSection(section) {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(sec => {
        sec.classList.remove('active');
    });
    
    const targetSection = document.getElementById(section + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Setup main tab click handlers
function setupMainTabs() {
    const tabs = document.querySelectorAll('.admin-main-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const section = tab.dataset.section;
            switchMainTab(section);
        });
    });
}

// Setup tab click handlers
function setupTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Get selected process
            currentProcess = tab.dataset.process;

            // Render columns for selected process
            renderColumns(currentProcess);
        });
    });
}

// Render columns for selected process
function renderColumns(process) {
    const container = document.getElementById('columnsContainer');
    const title = document.getElementById('processTitle');

    if (process === '') {
        title.textContent = 'All Processes Columns';
        renderAllProcessesColumns(container);
    } else {
        title.textContent = `${process} Columns`;
        renderProcessColumns(container, process);
    }
}

// Render all processes view
function renderAllProcessesColumns(container) {
    let html = '';


    // Process-specific columns
    for (const [processName, columns] of Object.entries(columnConfig)) {
        if (processName === 'common') continue;

        html += '<div class="column-category">';
        html += `<div class="column-category-title">${processName}</div>`;
        html += '<div class="columns-list">';
        columns.forEach(col => {
            html += renderColumnItem(col, processName, true);
        });
        html += '</div></div>';
    }

    container.innerHTML = html;
}

// Render specific process columns
function renderProcessColumns(container, process) {
    let html = '';

    // Process-specific columns
    html += '<div class="column-category">';
    html += '<div class="column-category-title">Process-Specific Columns</div>';
    html += '<div class="columns-list">';

    const processColumns = columnConfig[process] || [];
    if (processColumns.length === 0) {
        html += `
      <div class="empty-state">
        <div class="empty-state-text">No columns configured</div>
        <div class="empty-state-subtext">Click "Add Column" to create a new column</div>
      </div>
    `;
    } else {
        processColumns.forEach(col => {
            html += renderColumnItem(col, process, true);
        });
    }

    html += '</div></div>';

    container.innerHTML = html;
}

// Render single column item
function renderColumnItem(col, process, allowEdit) {
    const editBtn = allowEdit && col.editable ?
        `<button class="btn-icon-small" onclick="editColumn(${col.index}, '${process}')" title="Edit">
      <img src="assets/edit-svgrepo-com.svg" alt="Edit" />
    </button>` : '';

    const deleteBtn = allowEdit && col.editable ?
        `<button class="btn-icon-small delete" onclick="deleteColumn(${col.index}, '${process}')" title="Delete">
      <img src="assets/delete-cross-fill-svgrepo-com.svg" alt="Delete" />
    </button>` : '';

    return `
    <div class="column-item" data-index="${col.index}">
      <div class="column-drag-handle">☰</div>
      <div class="column-info">
        <div class="column-name">${col.name}</div>
      </div>
      <div class="column-actions">
        ${editBtn}
        ${deleteBtn}
      </div>
    </div>
  `;
}

// Open add column modal
function openAddColumnModal() {
    if (currentProcess === '') {
        alert('Please select a specific process first');
        return;
    }

    document.getElementById('modalTitle').textContent = 'Add Column';
    document.getElementById('columnName').value = '';
    document.getElementById('columnIndex').value = '';
    document.getElementById('editingProcess').value = currentProcess;
    document.getElementById('columnModal').classList.add('active');
}

// Edit column
function editColumn(index, process) {
    const columns = columnConfig[process];
    const column = columns.find(col => col.index === index);

    if (!column) return;

    document.getElementById('modalTitle').textContent = 'Edit Column';
    document.getElementById('columnName').value = column.name;
    document.getElementById('columnIndex').value = index;
    document.getElementById('editingProcess').value = process;
    document.getElementById('columnModal').classList.add('active');
}

// Close modal
function closeColumnModal() {
    document.getElementById('columnModal').classList.remove('active');
}

// Save column (add or edit)
function saveColumn() {
    const name = document.getElementById('columnName').value.trim();
    const indexStr = document.getElementById('columnIndex').value;
    const process = document.getElementById('editingProcess').value;

    if (!name) {
        alert('Please enter a column name');
        return;
    }

    if (!process) {
        alert('No process selected');
        return;
    }

    if (!columnConfig[process]) {
        columnConfig[process] = [];
    }

    if (indexStr) {
        // Edit existing column
        const index = parseInt(indexStr);
        const column = columnConfig[process].find(col => col.index === index);
        if (column) {
            column.name = name;
        }
    } else {
        // Add new column
        // Find next available index
        let maxIndex = 5;
        for (const [key, columns] of Object.entries(columnConfig)) {
            if (key === 'common') continue;
            columns.forEach(col => {
                if (col.index > maxIndex) maxIndex = col.index;
            });
        }

        const newIndex = maxIndex + 1;
        columnConfig[process].push({
            index: newIndex,
            name: name,
            editable: true
        });
        
        alert('Column added successfully! Please refresh the Dashboard page to see the new column.');
    }

    saveColumnConfig();
    renderColumns(currentProcess);
    closeColumnModal();
}

function deleteColumn(index, process) {
    if (!confirm('Are you sure you want to delete this column? Please refresh the Dashboard page after deletion.')) {
        return;
    }

    if (!columnConfig[process]) return;

    columnConfig[process] = columnConfig[process].filter(col => col.index !== index);
    saveColumnConfig();
    renderColumns(currentProcess);
}

function resetColumnConfig() {
    if (!confirm('Are you sure you want to reset all column configurations to default? This will remove all custom columns.')) {
        return;
    }
    
    localStorage.removeItem('columnConfig');
    
    columnConfig = {
        common: [
            { index: 0, name: 'Process', editable: false },
            { index: 1, name: 'Instance', editable: false },
            { index: 2, name: 'Created Date', editable: false },
            { index: 3, name: 'Department', editable: false },
            { index: 4, name: 'Status', editable: false },
            { index: 5, name: 'Assigned To', editable: false }
        ],
        'Card / Loan Application': [
            { index: 6, name: 'Applicant Name', editable: true },
            { index: 7, name: 'ID / Account Number', editable: true },
            { index: 8, name: 'Loan Amount / Credit Limit', editable: true },
            { index: 9, name: 'Interest Rate', editable: true },
            { index: 10, name: 'Approval Date', editable: true },
            { index: 11, name: 'Supporting Documents', editable: true }
        ],
        'Budget Review': [
            { index: 12, name: 'Budget Period', editable: true },
            { index: 13, name: 'Requested Amount', editable: true },
            { index: 14, name: 'Approved Amount', editable: true },
            { index: 15, name: 'Cost Center', editable: true },
            { index: 16, name: 'Reviewer', editable: true },
            { index: 17, name: 'Justification', editable: true }
        ],
        'Sales Report': [
            { index: 18, name: 'Report Period', editable: true },
            { index: 19, name: 'Region / Market', editable: true },
            { index: 20, name: 'Sales Amount', editable: true },
            { index: 21, name: 'Product Category', editable: true }
        ],
        'Client Survey': [
            { index: 22, name: 'Client Name', editable: true },
            { index: 23, name: 'Survey Date', editable: true },
            { index: 24, name: 'Survey Type', editable: true },
            { index: 25, name: 'Score / Rating', editable: true }
        ]
    };
    
    renderColumns(currentProcess);
}