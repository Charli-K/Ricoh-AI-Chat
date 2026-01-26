let processData = [];

// Store column order for each process separately
let processColumnOrders = {
  '': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], // Select Processes (default)
  'Card / Loan Application': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
  'Budget Review': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
  'Sales Report': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
  'Client Survey': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
};

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
  
  if (typeof renderProcessCharts === 'function') {
    renderProcessCharts();
  }
  if (typeof updateLineChart === 'function' && lineChartInstance) {
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    updateLineChart(dateFrom?.value || '2022-01-01', dateTo?.value || '2025-12-31');
  }
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

const chartColors = {
  pending: "#ffd966",
  inProgress: "#9dc3e6",
  approve: "#a9d08e",
  completed: "#70ad47",
  cancel: "#ff6b6b",
};

Chart.defaults.plugins.datalabels = {
  display: false
};

function getProcessDataFromTable() {
  const processCounts = {};
  
  processData.forEach(item => {
    const process = item.process;
    const status = item.status;
    
    if (!processCounts[process]) {
      processCounts[process] = {
        pending: 0,
        inProgress: 0,
        approve: 0,
        completed: 0,
        cancel: 0
      };
    }
    
    if (status === 'Pending') processCounts[process].pending++;
    else if (status === 'In Progress') processCounts[process].inProgress++;
    else if (status === 'Approve') processCounts[process].approve++;
    else if (status === 'Complete') processCounts[process].completed++;
    else if (status === 'Cancel') processCounts[process].cancel++;
  });
  
  return processCounts;
}

let pieCharts = {};
// Store selected processes for charts for each process filter
let processChartSelections = {
  '': ['', '', '', ''],
  'Card / Loan Application': ['', '', '', ''],
  'Budget Review': ['', '', '', ''],
  'Sales Report': ['', '', '', ''],
  'Client Survey': ['', '', '', '']
};

// Store date ranges for each process filter
let processDateRanges = {
  '': { from: '2022-01-01', to: '2025-12-31' },
  'Card / Loan Application': { from: '2022-01-01', to: '2025-12-31' },
  'Budget Review': { from: '2022-01-01', to: '2025-12-31' },
  'Sales Report': { from: '2022-01-01', to: '2025-12-31' },
  'Client Survey': { from: '2022-01-01', to: '2025-12-31' }
};

function initializeProcessDropdowns() {
  const processFilter = document.getElementById('processFilter');
  const currentProcess = processFilter ? processFilter.value : '';
  const processCounts = getProcessDataFromTable();
  const processes = Object.keys(processCounts).sort();
  
  // Get or initialize chart selections for current process
  if (!processChartSelections[currentProcess]) {
    processChartSelections[currentProcess] = ['', '', '', ''];
  }
  let selectedProcesses = processChartSelections[currentProcess];
  
  // Initialize with available processes if not set
  if (selectedProcesses.every(p => !p)) {
    selectedProcesses = [
      processes[0] || '',
      processes[1] || '',
      processes[2] || '',
      processes[3] || ''
    ];
    processChartSelections[currentProcess] = selectedProcesses;
  }
  
  document.querySelectorAll('.process-selector-dropdown').forEach((dropdown, index) => {
    dropdown.innerHTML = '';
    
    processes.forEach(process => {
      const option = document.createElement('option');
      option.value = process;
      option.textContent = process;
      if (process === selectedProcesses[index]) {
        option.selected = true;
      }
      dropdown.appendChild(option);
    });
    
    dropdown.addEventListener('change', (e) => {
      const processFilter = document.getElementById('processFilter');
      const currentProcess = processFilter ? processFilter.value : '';
      const chartIndex = parseInt(e.target.getAttribute('data-chart-index'));
      processChartSelections[currentProcess][chartIndex] = e.target.value;
      updateChart(chartIndex, e.target.value);
    });
  });
  
  renderAllProcessCharts();
}

function updateChart(chartIndex, processName) {
  const processCounts = getProcessDataFromTable();
  const chartId = `chartProcess${chartIndex}`;
  const titleId = `chartTitle${chartIndex}`;
  
  const titleElement = document.getElementById(titleId);
  if (titleElement) {
    titleElement.textContent = processName;
  }
  
  if (pieCharts[chartId]) {
    pieCharts[chartId].destroy();
  }
  
  const canvas = document.getElementById(chartId);
  if (canvas && processCounts[processName]) {
    pieCharts[chartId] = new Chart(canvas, pieConfig(processCounts[processName]));
  }
}

function renderAllProcessCharts() {
  const processFilter = document.getElementById('processFilter');
  const currentProcess = processFilter ? processFilter.value : '';
  const processCounts = getProcessDataFromTable();
  const selectedProcesses = processChartSelections[currentProcess] || ['', '', '', ''];
  
  selectedProcesses.forEach((processName, index) => {
    if (processName) {
      updateChart(index, processName);
    }
  });
  
  attachExpandListeners();
}

const formData = {
  formB: { pending: 10, inProgress: 5, approve: 3, completed: 2, cancel: 0 },
  formP: { pending: 8, inProgress: 7, approve: 1, completed: 4, cancel: 2 },
  formA: { pending: 6, inProgress: 3, approve: 5, completed: 6, cancel: 0 },
  formC: { pending: 4, inProgress: 2, approve: 2, completed: 8, cancel: 1 },
};

const tokenData = [
  { date: "2023-07-17", department: "IT", tokens: 1500 },
  { date: "2024-06-23", department: "Finance", tokens: 2300 },
  { date: "2024-07-11", department: "HR", tokens: 1800 },
  { date: "2025-07-11", department: "IT", tokens: 3200 },
  { date: "2025-07-18", department: "Operations", tokens: 2100 },
  { date: "2025-09-12", department: "Finance", tokens: 2800 },
  { date: "2025-10-02", department: "HR", tokens: 1900 },
  { date: "2023-07-17", department: "Operations", tokens: 1600 },
  { date: "2024-06-23", department: "IT", tokens: 2500 },
  { date: "2024-07-11", department: "Finance", tokens: 3100 },
  { date: "2025-07-11", department: "HR", tokens: 2200 },
  { date: "2025-07-18", department: "IT", tokens: 2900 },
  { date: "2025-09-12", department: "Operations", tokens: 2400 },
  { date: "2025-10-02", department: "Finance", tokens: 3500 },
  { date: "2025-09-12", department: "Client Services", tokens: 2400 },
  { date: "2025-10-02", department: "Marketing", tokens: 3500 },
  { date: "2024-01-12", department: "Client Services", tokens: 3610 },
  { date: "2023-01-12", department: "Sales", tokens: 650 },
  { date: "2024-05-25", department: "Sales", tokens: 1350 },
  { date: "2025-03-18", department: "Sales", tokens: 2540 },
  { date: "2023-02-08", department: "Legal", tokens: 1235 },
  { date: "2024-11-01", department: "Legal", tokens: 3530 },
  { date: "2024-12-08", department: "Solutions & Portfolio", tokens: 1880 },
  { date: "2025-03-14", department: "Solutions & Portfolio", tokens: 4550 },
];

function filterTokenData(fromDate, toDate) {
  const from = fromDate ? new Date(fromDate) : new Date('2022-01-01');
  const to = toDate ? new Date(toDate) : new Date('2025-12-31');
  to.setHours(23, 59, 59, 999);
  
  return tokenData.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= from && itemDate <= to;
  });
}

function calculateTokenStats(filteredData) {
  const total = filteredData.reduce((sum, item) => sum + item.tokens, 0);
  const byDepartment = {};
  
  filteredData.forEach(item => {
    if (!byDepartment[item.department]) {
      byDepartment[item.department] = 0;
    }
    byDepartment[item.department] += item.tokens;
  });
  
  return { total, byDepartment };
}

function updateTokenDisplay(fromDate, toDate) {
  const filteredData = filterTokenData(fromDate, toDate);
  const stats = calculateTokenStats(filteredData);
  
  const totalTokensEl = document.getElementById('totalTokens');
  if (totalTokensEl) {
    totalTokensEl.textContent = stats.total.toLocaleString();
  }
  
  const departmentGrid = document.getElementById('departmentTokensGrid');
  if (departmentGrid) {
    departmentGrid.innerHTML = '';
    
    const sortedDepts = Object.entries(stats.byDepartment)
      .sort((a, b) => b[1] - a[1]);
    
    sortedDepts.forEach(([dept, tokens]) => {
      const card = document.createElement('div');
      card.className = 'department-card';
      card.innerHTML = `
        <div class="department-name">${dept}</div>
        <div class="department-tokens">${tokens.toLocaleString()}</div>
        <div class="department-label">tokens used</div>
      `;
      departmentGrid.appendChild(card);
    });
  }
}

const departmentGrid = document.getElementById('departmentTokensGrid');
if (departmentGrid) {
  let isDown = false;
  let startX;
  let scrollLeft;

  departmentGrid.addEventListener('mousedown', (e) => {
    isDown = true;
    departmentGrid.style.cursor = 'grabbing';
    startX = e.pageX - departmentGrid.offsetLeft;
    scrollLeft = departmentGrid.scrollLeft;
  });

  departmentGrid.addEventListener('mouseleave', () => {
    isDown = false;
    departmentGrid.style.cursor = 'grab';
  });

  departmentGrid.addEventListener('mouseup', () => {
    isDown = false;
    departmentGrid.style.cursor = 'grab';
  });

  departmentGrid.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - departmentGrid.offsetLeft;
    const walk = (x - startX) * 2; 
    departmentGrid.scrollLeft = scrollLeft - walk;
  });
}


function pieConfig(data){
  const isDarkMode = document.body.classList.contains('dark-mode');
  return {
    type: "pie",
    data: {
      labels: ["Pending", "In Progress", "Approve", "Completed", "Cancel"],
      datasets: [{
        data: [data.pending, data.inProgress, data.approve, data.completed, data.cancel],
        backgroundColor: [
          chartColors.pending,
          chartColors.inProgress,
          chartColors.approve,
          chartColors.completed,
          chartColors.cancel,
        ],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: { 
            boxWidth: 12, 
            color: isDarkMode ? "#e4e6eb" : "#000000", 
            font: { size: 11 } 
          },
        },
        tooltip: {
          callbacks: {
            title: function() {
              return '';
            },
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
    },
  };
}

function renderPieCharts() {
  Object.values(pieCharts).forEach(chart => {
    if (chart) chart.destroy();
  });
  pieCharts = {};
}

function renderProcessCharts() {
  renderAllProcessCharts();
}

let lineChartInstance = null;

function getTableData() {
  const data = [];
  
  processData.forEach(item => {
    const parsedDate = parseDate(item.createdDate);
    const statusMap = {
      'Pending': 'pending',
      'In Progress': 'inprogress',
      'Approve': 'approve',
      'Complete': 'complete',
      'Cancel': 'cancel'
    };
    
    if (parsedDate) {
      data.push({
        date: parsedDate,
        dateStr: item.createdDate,
        status: statusMap[item.status] || item.status.toLowerCase()
      });
    }
  });
  
  return data;
}

function generateLineChartData(fromDate, toDate) {
  const tableData = getTableData();
  const from = fromDate ? new Date(fromDate) : new Date('2022-01-01');
  const to = toDate ? new Date(toDate) : new Date('2025-12-31');
  to.setHours(23, 59, 59, 999);
  
  const filteredData = tableData.filter(item => item.date >= from && item.date <= to);
  
  filteredData.sort((a, b) => a.date - b.date);
  
  const dateGroups = {};
  
  filteredData.forEach(item => {
    const monthKey = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!dateGroups[monthKey]) {
      dateGroups[monthKey] = {
        pending: 0,
        inprogress: 0,
        approve: 0,
        complete: 0,
        cancel: 0
      };
    }
    
    const status = item.status.toLowerCase();
    if (dateGroups[monthKey][status] !== undefined) {
      dateGroups[monthKey][status]++;
    }
  });
  
  const labels = Object.keys(dateGroups).sort();
  
  return {
    labels: labels,
    datasets: [
      {
        label: "Pending",
        data: labels.map(label => dateGroups[label].pending),
        borderColor: chartColors.pending,
        backgroundColor: chartColors.pending + "40",
        tension: 0.4,
      },
      {
        label: "In Progress",
        data: labels.map(label => dateGroups[label].inprogress),
        borderColor: chartColors.inProgress,
        backgroundColor: chartColors.inProgress + "40",
        tension: 0.4,
      },
      {
        label: "Approve",
        data: labels.map(label => dateGroups[label].approve),
        borderColor: chartColors.approve,
        backgroundColor: chartColors.approve + "40",
        tension: 0.4,
      },
      {
        label: "Completed",
        data: labels.map(label => dateGroups[label].complete),
        borderColor: chartColors.completed,
        backgroundColor: chartColors.completed + "40",
        tension: 0.4,
      },
      {
        label: "Cancel",
        data: labels.map(label => dateGroups[label].cancel),
        borderColor: chartColors.cancel,
        backgroundColor: chartColors.cancel + "40",
        tension: 0.4,
      },
    ]
  };
}

function updateLineChart(fromDate, toDate) {
  const chartData = generateLineChartData(fromDate, toDate);
  const isDarkMode = document.body.classList.contains('dark-mode');
  const textColor = isDarkMode ? '#c2c2c2ff' : '#9d9d9dff';
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(140,170,200,0.12)';
  
  if (lineChartInstance) {
    lineChartInstance.data = chartData;
    lineChartInstance.options.plugins.legend.labels.color = textColor;
    lineChartInstance.options.scales.x.ticks.color = textColor;
    lineChartInstance.options.scales.x.title.color = textColor;
    lineChartInstance.options.scales.x.grid.color = gridColor;
    lineChartInstance.options.scales.y.ticks.color = textColor;
    lineChartInstance.options.scales.y.grid.color = gridColor;
    lineChartInstance.update();
  } else {
    const ctx = document.getElementById("lineChart");
    lineChartInstance = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { 
            position: "bottom", 
            labels: { 
              color: textColor,
              usePointStyle: false,
              padding: 15,
              font: {
                size: 12
              },
              generateLabels: (chart) => {
                const datasets = chart.data.datasets;
                const isDarkMode = document.body.classList.contains('dark-mode');
                const labelColor = isDarkMode ? '#c2c2c2ff' : '#9d9d9dff';
                return datasets.map((dataset, i) => ({
                  text: dataset.label,
                  fillStyle: dataset.borderColor,
                  strokeStyle: dataset.borderColor,
                  lineWidth: 3,
                  hidden: !chart.isDatasetVisible(i),
                  datasetIndex: i,
                  fontColor: labelColor
                }));
              }
            } 
          },
        },
        scales: {
          x: { 
            ticks: { color: textColor }, 
            grid: { color: gridColor },
            title: {
              display: true,
              text: 'Date (Year-Month)',
              color: textColor
            }
          },
          y: { 
            beginAtZero: true, 
            ticks: { 
              stepSize: 1, 
              color: textColor
            }, 
            grid: { color: gridColor } 
          },
        },
      },
    });
  }
}

const tableSearch = document.getElementById("tableSearch");
const processFilter = document.getElementById("processFilter");
const columnManagerBtn = document.getElementById("columnManagerBtn");
const columnManagerDropdown = document.getElementById("columnManagerDropdown");

const dateFrom = document.getElementById("dateFrom");
const dateTo = document.getElementById("dateTo");
const applyDateFilter = document.getElementById("applyDateFilter");
const resetDateFilter = document.getElementById("resetDateFilter");

function parseDate(dateStr) {
  const parts = dateStr.split(/[\/\s:]/);
  if (parts.length >= 3) {
    const month = parseInt(parts[0]);
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    return new Date(year, month - 1, day);
  }
  return null;
}

function filterTableByDate() {
  const processFilter = document.getElementById('processFilter');
  const currentProcess = processFilter ? processFilter.value : '';
  const fromDate = dateFrom.value ? new Date(dateFrom.value) : null;
  const toDate = dateTo.value ? new Date(dateTo.value) : null;
  
  // Save date range for current process
  processDateRanges[currentProcess] = {
    from: dateFrom.value || '2022-01-01',
    to: dateTo.value || '2025-12-31'
  };
  
  if (toDate) {
    toDate.setHours(23, 59, 59, 999);
  }
  
  const rows = document.querySelectorAll("#dataTable tbody tr");
  
  rows.forEach(tr => {
    const createdDateCell = tr.cells[2];
    if (createdDateCell) {
      const dateText = createdDateCell.innerText.trim();
      const rowDate = parseDate(dateText);
      
      let showRow = true;
      
      if (rowDate) {
        if (fromDate && rowDate < fromDate) {
          showRow = false;
        }
        if (toDate && rowDate > toDate) {
          showRow = false;
        }
      }
      
      tr.style.display = showRow ? "" : "none";
    }
  });
  
  updateLineChart(dateFrom.value, dateTo.value);
  updateTokenDisplay(dateFrom.value, dateTo.value);
}

if (applyDateFilter) {
  applyDateFilter.addEventListener("click", filterTableByDate);
}

if (resetDateFilter) {
  resetDateFilter.addEventListener("click", () => {
    const processFilter = document.getElementById('processFilter');
    const currentProcess = processFilter ? processFilter.value : '';
    
    dateFrom.value = "2022-01-01";
    dateTo.value = "2025-12-31";
    
    // Reset date range for current process
    processDateRanges[currentProcess] = {
      from: '2022-01-01',
      to: '2025-12-31'
    };
    
    if (processFilter) {
      processFilter.value = "";
      // Also reset for 'Select Processes'
      processDateRanges[''] = {
        from: '2022-01-01',
        to: '2025-12-31'
      };
    }
    if (tableSearch) {
      tableSearch.value = "";
    }
    const rows = document.querySelectorAll("#dataTable tbody tr");
    rows.forEach(tr => {
      tr.style.display = "";
    });
    updateLineChart('2022-01-01', '2025-12-31');
    updateTokenDisplay('2022-01-01', '2025-12-31');
  });
}

if (tableSearch) {
  tableSearch.addEventListener("input", () => {
    applyTableFilters();
  });
}

if (processFilter) {
  processFilter.addEventListener("change", () => {
    const selectedProcess = processFilter.value;
    
    // Restore date range for this process
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    if (dateFrom && dateTo) {
      const savedRange = processDateRanges[selectedProcess] || processDateRanges[''];
      dateFrom.value = savedRange.from;
      dateTo.value = savedRange.to;
      updateTokenDisplay(savedRange.from, savedRange.to);
      if (typeof updateLineChart === 'function') {
        updateLineChart(savedRange.from, savedRange.to);
      }
    }
    
    // Restore chart selections for this process
    if (typeof initializeProcessDropdowns === 'function') {
      initializeProcessDropdowns();
    }
    
    // Re-render table data with the selected process filter and restore column order
    renderTableData(selectedProcess);
    // Update dynamic columns based on selection
    if (selectedProcess) {
      hideNoProcessMessage();
      updateDynamicColumns(selectedProcess);
    } else {
      showNoProcessMessage();
      updateDynamicColumns(''); 
    }
    applyTableFilters();
  });
}

function applyTableFilters() {
  const searchQuery = tableSearch ? tableSearch.value.toLowerCase().trim() : "";
  const selectedProcess = processFilter ? processFilter.value : "";
  const rows = document.querySelectorAll("#dataTable tbody tr");
  
  rows.forEach(tr => {
    const searchMatch = tr.innerText.toLowerCase().includes(searchQuery);
    
    let processMatch = true;
    if (selectedProcess) {
      const processCell = tr.cells[0]; 
      if (processCell) {
        const processText = processCell.innerText.trim();
        processMatch = processText === selectedProcess;
      }
    }
    
    tr.style.display = (searchMatch && processMatch) ? "" : "none";
  });
  
  if (typeof currentPage !== 'undefined') {
    currentPage = 1;
  }
  if (typeof updatePagination === 'function') {
    updatePagination();
  }
}

if (columnManagerBtn && columnManagerDropdown) {
  columnManagerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    columnManagerDropdown.style.display = 
      columnManagerDropdown.style.display === 'none' ? 'block' : 'none';
  });
}

function initializeColumnVisibility() {
  document.querySelectorAll('.column-option input[type="checkbox"]').forEach(checkbox => {
    const originalColumnIndex = parseInt(checkbox.getAttribute('data-column'));
    const table = document.getElementById('dataTable');
    const isChecked = checkbox.checked;
    
    // Find the actual position of the column with this data-column attribute
    const headers = table.querySelectorAll('thead th');
    let actualPosition = -1;
    headers.forEach((th, index) => {
      if (parseInt(th.getAttribute('data-column')) === originalColumnIndex) {
        actualPosition = index;
      }
    });
    
    if (actualPosition !== -1) {
      const th = headers[actualPosition];
      if (th) {
        th.classList.toggle('hidden', !isChecked);
      }
      
      table.querySelectorAll('tbody tr').forEach(row => {
        const td = row.cells[actualPosition];
        if (td) {
          td.classList.toggle('hidden', !isChecked);
        }
      });
    }
  });
}

initializeColumnVisibility();

document.querySelectorAll('.column-option input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', (e) => {
    const originalColumnIndex = parseInt(e.target.getAttribute('data-column'));
    const table = document.getElementById('dataTable');
    const isChecked = e.target.checked;
    
    // Find the actual position of the column with this data-column attribute
    const headers = table.querySelectorAll('thead th');
    let actualPosition = -1;
    headers.forEach((th, index) => {
      if (parseInt(th.getAttribute('data-column')) === originalColumnIndex) {
        actualPosition = index;
      }
    });
    
    if (actualPosition !== -1) {
      const th = headers[actualPosition];
      if (th) {
        th.classList.toggle('hidden', !isChecked);
      }
      
      table.querySelectorAll('tbody tr').forEach(row => {
        const td = row.cells[actualPosition];
        if (td) {
          td.classList.toggle('hidden', !isChecked);
        }
      });
    }
  });
});

let draggedColumn = null;

document.querySelectorAll('#tableHeader th').forEach(th => {
  th.addEventListener('dragstart', (e) => {
    draggedColumn = parseInt(e.target.getAttribute('data-column'));
    e.target.classList.add('dragging');
  });
  
  th.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
    document.querySelectorAll('#tableHeader th').forEach(header => {
      header.classList.remove('drag-over');
    });
  });
  
  th.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.target.classList.add('drag-over');
  });
  
  th.addEventListener('dragleave', (e) => {
    e.target.classList.remove('drag-over');
  });
  
  th.addEventListener('drop', (e) => {
    e.preventDefault();
    const targetColumn = parseInt(e.target.getAttribute('data-column'));
    
    if (draggedColumn !== null && draggedColumn !== targetColumn) {
      swapColumns(draggedColumn, targetColumn);
    }
    
    e.target.classList.remove('drag-over');
  });
});

function swapColumns(fromDataCol, toDataCol) {
  const table = document.getElementById('dataTable');
  const headers = table.querySelectorAll('thead th');
  
  // Find actual positions of the columns to swap
  let fromPos = -1, toPos = -1;
  headers.forEach((th, index) => {
    const dataCol = parseInt(th.getAttribute('data-column'));
    if (dataCol === fromDataCol) fromPos = index;
    if (dataCol === toDataCol) toPos = index;
  });
  
  if (fromPos === -1 || toPos === -1 || fromPos === toPos) return;
  
  // Swap columns in all rows (including header and body)
  const rows = table.querySelectorAll('tr');
  rows.forEach(row => {
    const cells = Array.from(row.cells);
    if (cells[fromPos] && cells[toPos]) {
      // Clone cells to preserve all attributes and event listeners
      const tempCell = cells[fromPos].cloneNode(true);
      const cell2Clone = cells[toPos].cloneNode(true);
      
      // Replace cells
      row.replaceChild(cell2Clone, cells[fromPos]);
      row.replaceChild(tempCell, row.cells[toPos]);
    }
  });
  
  // Save the new column order for current process
  const processFilter = document.getElementById('processFilter');
  const currentProcess = processFilter ? processFilter.value : '';
  const newHeaders = table.querySelectorAll('thead th');
  processColumnOrders[currentProcess] = Array.from(newHeaders)
    .map(th => parseInt(th.getAttribute('data-column')))
    .filter(col => !isNaN(col));
  
  rebindAllHeaderEvents();
}

function rebindAllHeaderEvents() {
  // Clone all headers to remove old event listeners
  const headers = document.querySelectorAll('#dataTable th');
  headers.forEach(header => {
    const newHeader = header.cloneNode(true);
    header.parentNode.replaceChild(newHeader, header);
  });
  
  // Re-bind both drag and sort events
  const newHeaders = document.querySelectorAll('#dataTable th');
  newHeaders.forEach((th, index) => {
    // Add drag events
    th.addEventListener('dragstart', (e) => {
      draggedColumn = parseInt(e.target.getAttribute('data-column'));
      e.target.classList.add('dragging');
    });
    
    th.addEventListener('dragend', (e) => {
      e.target.classList.remove('dragging');
      document.querySelectorAll('#tableHeader th').forEach(header => {
        header.classList.remove('drag-over');
      });
    });
    
    th.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.target.classList.add('drag-over');
    });
    
    th.addEventListener('dragleave', (e) => {
      e.target.classList.remove('drag-over');
    });
    
    th.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetColumn = parseInt(e.target.getAttribute('data-column'));
      
      if (draggedColumn !== null && draggedColumn !== targetColumn) {
        swapColumns(draggedColumn, targetColumn);
      }
      
      e.target.classList.remove('drag-over');
    });
    
    // Add sort event
    th.classList.add('sortable');
    if (!th.hasAttribute('data-sort-order')) {
      th.setAttribute('data-sort-order', 'none');
    }
    th.addEventListener('click', (e) => {
      // Don't sort if dragging
      if (e.target.classList.contains('dragging')) return;
      sortTableByColumn(index);
    });
  });
}

function rebindSortEvents() {
  // This function is kept for compatibility but now calls rebindAllHeaderEvents
  rebindAllHeaderEvents();
}

function rebindDragEvents() {
  // This function is kept for compatibility but now calls rebindAllHeaderEvents
  rebindAllHeaderEvents();
}

document.addEventListener('click', () => {
  if (columnManagerDropdown) columnManagerDropdown.style.display = 'none';
});

const chartModal = document.getElementById('chartModal');
const modalClose = document.getElementById('modalClose');
const modalChartWrap = document.getElementById('modalChartWrap');

let currentExpandedChart = null;

function attachExpandListeners() {
  const expandBtns = document.querySelectorAll('.expand-btn');
  
  expandBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      const chartId = btn.getAttribute('data-chart');
      const originalCanvas = document.getElementById(chartId);
      
      if (!originalCanvas) {
        console.error('Canvas not found:', chartId);
        return;
      }
      
      const chartCard = btn.closest('.chart-card, .line-chart-container');
      const chartTitle = chartCard ? chartCard.querySelector('h3').textContent : '';
      
      if (chartModal && modalChartWrap) {
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        const modalTitle = document.getElementById('modalChartTitle');
        if (modalTitle) {
          modalTitle.textContent = chartTitle;
        }
        
        modalChartWrap.innerHTML = '';
        
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'modalChart';
        modalChartWrap.appendChild(newCanvas);
        
        const originalChart = Chart.getChart(originalCanvas);
        if (originalChart) {
          const isPieChart = originalChart.config.type === 'pie';
          
          const config = {
            type: originalChart.config.type,
            data: {
              labels: [...originalChart.config.data.labels],
              datasets: originalChart.config.data.datasets.map(dataset => ({
                ...dataset,
                data: [...dataset.data],
                backgroundColor: Array.isArray(dataset.backgroundColor) 
                  ? [...dataset.backgroundColor] 
                  : dataset.backgroundColor,
                borderColor: dataset.borderColor,
                borderWidth: dataset.borderWidth,
                tension: dataset.tension
              }))
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  position: originalChart.config.options.plugins.legend.position,
                  labels: {
                    ...originalChart.config.options.plugins.legend.labels,
                    font: { size: 14 },
                    color: isDarkMode ? "#e4e6eb" : "#000000", 
                  }
                },
                tooltip: isPieChart ? {
                  callbacks: {
                    title: function() {
                      return '';
                    },
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.parsed;
                      const dataset = context.dataset;
                      const total = dataset.data.reduce((acc, val) => acc + val, 0);
                      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                      return `${label}: ${value} (${percentage}%)`;
                    }
                  }
                } : originalChart.config.options.plugins.tooltip,
                datalabels: isPieChart ? {
                  color: '#fff',
                  font: {
                    weight: 'bold',
                    size: 18
                  },
                  formatter: (value, context) => {
                    const dataset = context.dataset;
                    const total = dataset.data.reduce((acc, val) => acc + val, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return value > 0 ? `${percentage}%` : '';
                  },
                  textAlign: 'center'
                } : undefined
              },
              scales: originalChart.config.options.scales ? {
                x: originalChart.config.options.scales.x ? {...originalChart.config.options.scales.x} : undefined,
                y: originalChart.config.options.scales.y ? {...originalChart.config.options.scales.y} : undefined
              } : undefined
            }
          };
          
          currentExpandedChart = new Chart(newCanvas, config);
        }
        
        chartModal.classList.add('active');
      }
    });
  });
}

function closeModal() {
  if (chartModal) {
    chartModal.classList.remove('active');
    if (currentExpandedChart) {
      currentExpandedChart.destroy();
      currentExpandedChart = null;
    }
    if (modalChartWrap) {
      modalChartWrap.innerHTML = '';
    }
    const modalTitle = document.getElementById('modalChartTitle');
    if (modalTitle) {
      modalTitle.textContent = '';
    }
  }
}

attachExpandListeners();

if (modalClose) {
  modalClose.addEventListener('click', closeModal);
}

if (chartModal) {
  chartModal.addEventListener('click', (e) => {
    if (e.target === chartModal) {
      closeModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chartModal && chartModal.classList.contains('active')) {
    closeModal();
  }
});

loadDarkModePreference();
loadMenuState();
const processColumns = {
  "Card / Loan Application": [
    { id: 6, name: "Applicant Name" },
    { id: 7, name: "ID / Account Number" },
    { id: 8, name: "Loan Amount / Credit Limit" },
    { id: 9, name: "Interest Rate" },
    { id: 10, name: "Approval Date" },
    { id: 11, name: "Supporting Documents" }
  ],
  "Budget Review": [
    { id: 12, name: "Budget Period" },
    { id: 13, name: "Requested Amount" },
    { id: 14, name: "Approved Amount" },
    { id: 15, name: "Cost Center" },
    { id: 16, name: "Reviewer" },
    { id: 17, name: "Justification" }
  ],
  "Sales Report": [
    { id: 18, name: "Report Period" },
    { id: 19, name: "Region / Market" },
    { id: 20, name: "Sales Amount" },
    { id: 21, name: "Product Category" }
  ],
  "Client Survey": [
    { id: 22, name: "Client Name" },
    { id: 23, name: "Survey Date" },
    { id: 24, name: "Survey Type" },
    { id: 25, name: "Score / Rating" }
  ]
};

// Update dynamic columns based on selected process
function updateDynamicColumns(selectedProcess) {
  const dynamicColumnsContainer = document.getElementById('dynamicColumns');
  if (!dynamicColumnsContainer) return;
  
  // Clear existing dynamic columns
  dynamicColumnsContainer.innerHTML = '';
  
  // Hide all process-specific columns in table
  document.querySelectorAll('.process-specific-column').forEach(th => {
    th.style.display = 'none';
  });
  
  // Hide all process-specific cells in tbody
  const tbody = document.querySelector('#dataTable tbody');
  if (tbody) {
    tbody.querySelectorAll('tr').forEach(row => {
      for (let i = 6; i <= 25; i++) {
        if (row.cells[i]) {
          row.cells[i].style.display = 'none';
        }
      }
    });
  }
  
  // If a process is selected, show its specific columns
  if (selectedProcess && processColumns[selectedProcess]) {
    const columns = processColumns[selectedProcess];
    
    columns.forEach(col => {
      // Add to column manager
      const option = document.createElement('div');
      option.className = 'column-option';
      option.innerHTML = `
        <input type="checkbox" id="col-${col.id}" checked data-column="${col.id}">
        <label for="col-${col.id}">${col.name}</label>
      `;
      dynamicColumnsContainer.appendChild(option);
      
      // Show corresponding table header
      const th = document.querySelector(`th[data-column="${col.id}"][data-process="${selectedProcess}"]`);
      if (th) {
        th.style.display = '';
      }
      
      // Show corresponding table cells
      if (tbody) {
        tbody.querySelectorAll('tr').forEach(row => {
          if (row.cells[col.id]) {
            row.cells[col.id].style.display = '';
          }
        });
      }
      
      // Add event listener to checkbox
      const checkbox = option.querySelector('input');
      checkbox.addEventListener('change', (e) => {
        const columnIndex = parseInt(e.target.getAttribute('data-column'));
        const isChecked = e.target.checked;
        
        const th = document.querySelector(`th[data-column="${columnIndex}"]`);
        if (th) {
          th.classList.toggle('hidden', !isChecked);
        }
        
        tbody.querySelectorAll('tr').forEach(row => {
          const td = row.cells[columnIndex];
          if (td) {
            td.classList.toggle('hidden', !isChecked);
          }
        });
      });
    });
  }
}

// Show only common columns when no process is selected
function showNoProcessMessage() {
  const tbody = document.querySelector('#dataTable tbody');
  if (!tbody) return;
  
  // Remove existing message if any
  const existingMessage = tbody.querySelector('.no-process-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Show all data rows
  tbody.querySelectorAll('tr').forEach(row => {
    row.style.display = '';
    
    // Show only the first 6 common columns (0-5: Process, Instance, Created Date, Department, Status, Assigned To)
    // Hide all process-specific columns (6+)
    for (let i = 0; i < row.cells.length; i++) {
      if (i < 6) {
        row.cells[i].style.display = '';
      } else {
        row.cells[i].style.display = 'none';
      }
    }
  });
  
  // Hide all process-specific column headers
  document.querySelectorAll('.process-specific-column').forEach(th => {
    th.style.display = 'none';
  });
}

function hideNoProcessMessage() {
  const tbody = document.querySelector('#dataTable tbody');
  if (!tbody) return;
  
  const messageRow = tbody.querySelector('.no-process-message');
  if (messageRow) {
    messageRow.remove();
  }
  
  // Show all data rows (filtering will be applied by applyTableFilters)
  tbody.querySelectorAll('tr').forEach(row => {
    row.style.display = '';
  });
}

// Initialize table display (show common columns when no process is selected)
function initializeTableDisplay() {
  const processFilter = document.getElementById("processFilter");
  
  if (processFilter && processFilter.value) {
    updateDynamicColumns(processFilter.value);
  }
}

// Load JSON data and render table
async function loadProcessData() {
  try {
    const response = await fetch('data/processes.json');
    processData = await response.json();
    renderTableData();
    initializeTableDisplay();
    initTableSorting();
    
    // Initialize charts after data is loaded
    if (typeof initializeProcessDropdowns === 'function') {
      initializeProcessDropdowns();
    }
    if (typeof updateLineChart === 'function') {
      updateLineChart('2022-01-01', '2025-12-31');
    }
    
    // Initialize pagination after data is loaded
    if (typeof initPagination === 'function') {
      setTimeout(() => initPagination(), 100);
    }
  } catch (error) {
    console.error('Error loading process data:', error);
  }
}

// Restore header order for a specific process
function restoreHeaderOrder(filterProcess = '') {
  const table = document.getElementById('dataTable');
  if (!table) return;
  
  const thead = table.querySelector('thead');
  const headerRow = thead.querySelector('tr');
  if (!headerRow) return;
  
  const columnOrder = processColumnOrders[filterProcess] || processColumnOrders[''];
  const currentHeaders = Array.from(headerRow.querySelectorAll('th'));
  
  // Create a map of data-column to header element
  const headerMap = {};
  currentHeaders.forEach(th => {
    const dataCol = parseInt(th.getAttribute('data-column'));
    if (!isNaN(dataCol)) {
      headerMap[dataCol] = th;
    }
  });
  
  // Reorder headers based on saved column order
  headerRow.innerHTML = '';
  columnOrder.forEach(colIndex => {
    if (headerMap[colIndex]) {
      headerRow.appendChild(headerMap[colIndex]);
    }
  });
  
  // Rebind events after reordering
  rebindAllHeaderEvents();
}

// Render table rows from JSON data
function renderTableData(filterProcess = '') {
  const tbody = document.querySelector('#dataTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  // Get column order for this specific process
  const columnOrder = processColumnOrders[filterProcess] || processColumnOrders[''];
  
  // If columnOrder is empty or invalid, return early
  if (columnOrder.length === 0) {
    console.error('No valid column order found');
    return;
  }
  
  // Restore header order for this process
  restoreHeaderOrder(filterProcess);
  
  // Filter data if process is selected
  let filteredData = filterProcess ? processData.filter(item => item.process === filterProcess) : processData;
  
  // Sort by created date (newest first)
  filteredData = filteredData.sort((a, b) => {
    const dateA = new Date(a.createdDate);
    const dateB = new Date(b.createdDate);
    return dateB - dateA; // Descending order (newest first)
  });
  
  filteredData.forEach(item => {
    const row = document.createElement('tr');
    
    // Create status badge HTML
    const statusClass = item.status.toLowerCase().replace(' ', '');
    const statusBadge = `<span class=\"status-badge ${statusClass}\">${item.status}</span>`;
    
    // Create instance link
    const instanceLink = `<a href=\"https://apps.ricohsolution.com.hk:1443/laserfiche/#?id=1\" target=\"_blank\" style=\"color: #00a2ff; text-decoration: underline;\">${item.instance}</a>`;
    
    // Map data-column indices to values
    const columnData = {
      0: item.process,
      1: instanceLink,
      2: item.createdDate,
      3: item.department,
      4: statusBadge,
      5: item.assignedTo,
      6: item.applicantName || '',
      7: item.idAccountNumber || '',
      8: item.loanAmountCreditLimit || '',
      9: item.interestRate || '',
      10: item.approvalDate || '',
      11: item.supportingDocuments || '',
      12: item.budgetPeriod || '',
      13: item.requestedAmount || '',
      14: item.approvedAmount || '',
      15: item.costCenter || '',
      16: item.reviewer || '',
      17: item.justification || '',
      18: item.reportPeriod || '',
      19: item.regionMarket || '',
      20: item.salesAmount || '',
      21: item.productCategory || '',
      22: item.clientName || '',
      23: item.surveyDate || '',
      24: item.surveyType || '',
      25: item.scoreRating || ''
    };
    
    // Build row HTML according to current column order
    let rowHTML = '';
    columnOrder.forEach(colIndex => {
      // Skip invalid column indices
      if (isNaN(colIndex) || colIndex < 0 || colIndex > 25) return;
      
      const value = columnData[colIndex] || '';
      const isProcessSpecific = colIndex >= 6;
      
      // Determine if this cell should be hidden based on process
      let shouldHide = false;
      if (!filterProcess && isProcessSpecific) {
        shouldHide = true;
      } else if (filterProcess && isProcessSpecific) {
        // Check if this column belongs to the current process
        if (item.process === 'Card / Loan Application') {
          shouldHide = colIndex < 6 || colIndex > 11;
        } else if (item.process === 'Budget Review') {
          shouldHide = colIndex < 12 || colIndex > 17;
        } else if (item.process === 'Sales Report') {
          shouldHide = colIndex < 18 || colIndex > 21;
        } else if (item.process === 'Client Survey') {
          shouldHide = colIndex < 22 || colIndex > 25;
        } else {
          shouldHide = isProcessSpecific;
        }
      }
      
      rowHTML += `<td${shouldHide ? ' style="display:none;"' : ''}>${value}</td>`;
    });
    
    row.innerHTML = rowHTML;
    tbody.appendChild(row);
  });
  
  // Apply current column visibility based on selected process
  const processFilter = document.getElementById('processFilter');
  if (processFilter && processFilter.value) {
    updateDynamicColumns(processFilter.value);
  }
  
  // Re-apply user's column visibility preferences from checkboxes
  applyColumnVisibilityState();
  
  // Update pagination after rendering table data
  if (typeof currentPage !== 'undefined') {
    currentPage = 1;
  }
  if (typeof initPagination === 'function') {
    setTimeout(() => initPagination(), 50);
  }
}

// Table sorting functionality
let currentSortColumn = null;
let currentSortOrder = 'asc';

function initTableSorting() {
  const headers = document.querySelectorAll('#dataTable th');
  headers.forEach((header, index) => {
    header.classList.add('sortable');
    header.setAttribute('data-sort-order', 'none'); // Track individual column sort order
    header.addEventListener('click', (e) => {
      // Don't sort if dragging
      if (e.target.classList.contains('dragging')) return;
      
      sortTableByColumn(index);
    });
  });
}

function sortTableByColumn(columnIndex) {
  const processFilter = document.getElementById('processFilter');
  const filterProcess = processFilter ? processFilter.value : '';
  const headers = document.querySelectorAll('#dataTable th');
  const clickedHeader = headers[columnIndex];
  
  // Get current sort order for this specific column
  const currentOrder = clickedHeader.getAttribute('data-sort-order') || 'none';
  
  // Determine next sort order for this column
  let nextOrder;
  if (currentOrder === 'none' || currentOrder === 'desc') {
    nextOrder = 'asc';
  } else {
    nextOrder = 'desc';
  }
  
  // Update this column's sort order
  clickedHeader.setAttribute('data-sort-order', nextOrder);
  
  // Filter data if process is selected
  let filteredData = filterProcess ? processData.filter(item => item.process === filterProcess) : processData;
  
  // Get column name for sorting based on the original data-column attribute
  const columnMap = [
    'process', 'instance', 'createdDate', 'department', 'status', 'assignedTo',
    'applicantName', 'idAccountNumber', 'loanAmountCreditLimit', 'interestRate', 'approvalDate', 'supportingDocuments',
    'budgetPeriod', 'requestedAmount', 'approvedAmount', 'costCenter', 'reviewer', 'justification',
    'reportPeriod', 'regionMarket', 'salesAmount', 'productCategory',
    'clientName', 'surveyDate', 'surveyType', 'scoreRating'
  ];
  
  // Use the data-column attribute to get the original column index
  const originalColumnIndex = parseInt(clickedHeader.getAttribute('data-column'));
  const sortKey = columnMap[originalColumnIndex];
  
  // Sort the data
  filteredData.sort((a, b) => {
    let valA = a[sortKey] || '';
    let valB = b[sortKey] || '';
    
    // Handle different data types
    // Date columns
    if (sortKey.includes('Date') || sortKey === 'createdDate' || sortKey === 'approvalDate' || sortKey === 'surveyDate') {
      valA = new Date(valA);
      valB = new Date(valB);
    }
    // Currency/Number columns
    else if (sortKey.includes('Amount') || sortKey.includes('Limit') || sortKey === 'salesAmount') {
      valA = parseFloat(valA.replace(/[^0-9.-]+/g, '')) || 0;
      valB = parseFloat(valB.replace(/[^0-9.-]+/g, '')) || 0;
    }
    // Percentage columns
    else if (sortKey === 'interestRate') {
      valA = parseFloat(valA.replace('%', '')) || 0;
      valB = parseFloat(valB.replace('%', '')) || 0;
    }
    // Text columns
    else {
      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();
    }
    
    if (valA < valB) return nextOrder === 'asc' ? -1 : 1;
    if (valA > valB) return nextOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Re-render table with sorted data
  renderSortedTableData(filteredData, filterProcess);
  
  // Update header styling for this column only
  updateSortIndicators(columnIndex, nextOrder);
}

function renderSortedTableData(sortedData, filterProcess) {
  const tbody = document.querySelector('#dataTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  // Get column order for this specific process
  const columnOrder = processColumnOrders[filterProcess] || processColumnOrders[''];
  
  // If columnOrder is empty or invalid, return early
  if (columnOrder.length === 0) {
    console.error('No valid column order found');
    return;
  }
  
  // Restore header order for this process
  restoreHeaderOrder(filterProcess);
  
  sortedData.forEach(item => {
    const row = document.createElement('tr');
    
    const statusClass = item.status.toLowerCase().replace(' ', '');
    const statusBadge = `<span class="status-badge ${statusClass}">${item.status}</span>`;
    
    const instanceLink = `<a href="https://apps.ricohsolution.com.hk:1443/laserfiche/#?id=1" target="_blank" style="color: #00a2ff; text-decoration: underline;">${item.instance}</a>`;
    
    // Map data-column indices to values
    const columnData = {
      0: item.process,
      1: instanceLink,
      2: item.createdDate,
      3: item.department,
      4: statusBadge,
      5: item.assignedTo,
      6: item.applicantName || '',
      7: item.idAccountNumber || '',
      8: item.loanAmountCreditLimit || '',
      9: item.interestRate || '',
      10: item.approvalDate || '',
      11: item.supportingDocuments || '',
      12: item.budgetPeriod || '',
      13: item.requestedAmount || '',
      14: item.approvedAmount || '',
      15: item.costCenter || '',
      16: item.reviewer || '',
      17: item.justification || '',
      18: item.reportPeriod || '',
      19: item.regionMarket || '',
      20: item.salesAmount || '',
      21: item.productCategory || '',
      22: item.clientName || '',
      23: item.surveyDate || '',
      24: item.surveyType || '',
      25: item.scoreRating || ''
    };
    
    // Build row HTML according to current column order
    let rowHTML = '';
    columnOrder.forEach(colIndex => {
      // Skip invalid column indices
      if (isNaN(colIndex) || colIndex < 0 || colIndex > 25) return;
      
      const value = columnData[colIndex] || '';
      const isProcessSpecific = colIndex >= 6;
      
      // Determine if this cell should be hidden based on process
      let shouldHide = false;
      if (!filterProcess && isProcessSpecific) {
        shouldHide = true;
      } else if (filterProcess && isProcessSpecific) {
        // Check if this column belongs to the current process
        if (item.process === 'Card / Loan Application') {
          shouldHide = colIndex < 6 || colIndex > 11;
        } else if (item.process === 'Budget Review') {
          shouldHide = colIndex < 12 || colIndex > 17;
        } else if (item.process === 'Sales Report') {
          shouldHide = colIndex < 18 || colIndex > 21;
        } else if (item.process === 'Client Survey') {
          shouldHide = colIndex < 22 || colIndex > 25;
        } else {
          shouldHide = isProcessSpecific;
        }
      }
      
      rowHTML += `<td${shouldHide ? ' style="display:none;"' : ''}>${value}</td>`;
    });
    
    row.innerHTML = rowHTML;
    tbody.appendChild(row);
  });
  
  // Apply current column visibility
  const processFilter = document.getElementById('processFilter');
  if (processFilter && processFilter.value) {
    updateDynamicColumns(processFilter.value);
  }
  
  // Re-apply user's column visibility preferences from checkboxes
  applyColumnVisibilityState();
  
  // Update pagination
  if (typeof initPagination === 'function') {
    setTimeout(() => initPagination(), 50);
  }
}

function applyColumnVisibilityState() {
  // Re-apply the visibility state based on the checkboxes
  document.querySelectorAll('.column-option input[type="checkbox"]').forEach(checkbox => {
    const originalColumnIndex = parseInt(checkbox.getAttribute('data-column'));
    const table = document.getElementById('dataTable');
    const isChecked = checkbox.checked;
    
    // Find the actual position of the column with this data-column attribute
    const headers = table.querySelectorAll('thead th');
    let actualPosition = -1;
    headers.forEach((th, index) => {
      if (parseInt(th.getAttribute('data-column')) === originalColumnIndex) {
        actualPosition = index;
      }
    });
    
    if (actualPosition !== -1) {
      const th = headers[actualPosition];
      if (th) {
        th.classList.toggle('hidden', !isChecked);
      }
      
      table.querySelectorAll('tbody tr').forEach(row => {
        const td = row.cells[actualPosition];
        if (td) {
          td.classList.toggle('hidden', !isChecked);
        }
      });
    }
  });
}

function updateSortIndicators(columnIndex, sortOrder) {
  // Remove sort classes only from the clicked column
  const headers = document.querySelectorAll('#dataTable th');
  const currentHeader = headers[columnIndex];
  
  if (currentHeader) {
    // Remove existing sort classes from this column
    currentHeader.classList.remove('sort-asc', 'sort-desc');
    
    // Add new sort class based on current order
    currentHeader.classList.add(sortOrder === 'asc' ? 'sort-asc' : 'sort-desc');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Set dateTo to today's date
  const dateToInput = document.getElementById('dateTo');
  const dateFromInput = document.getElementById('dateFrom');
  
  if (dateToInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateToInput.value = `${year}-${month}-${day}`;
  }
  
  // Initialize Token Display with default date range
  const fromDate = dateFromInput?.value || '2022-01-01';
  const toDate = dateToInput?.value || '2025-12-31';
  updateTokenDisplay(fromDate, toDate);
  
  loadProcessData();
});