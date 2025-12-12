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

updateTokenDisplay('2022-01-01', '2025-12-31');

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
          labels: { boxWidth: 12, color: "#000000", font: { size: 11 } },
        },
      },
    },
  };
}

new Chart(document.getElementById("chartFormB"), pieConfig(formData.formB));
new Chart(document.getElementById("chartFormP"), pieConfig(formData.formP));
new Chart(document.getElementById("chartFormA"), pieConfig(formData.formA));
new Chart(document.getElementById("chartFormC"), pieConfig(formData.formC));

let lineChartInstance = null;

function getTableData() {
  const rows = document.querySelectorAll("#dataTable tbody tr");
  const data = [];
  
  rows.forEach(row => {
    const cells = row.cells;
    if (cells.length >= 8) {
      const createdDate = cells[2].innerText.trim();
      const statusElement = cells[7].querySelector('.status-badge');
      const status = statusElement ? statusElement.classList[1] : '';
      
      const parsedDate = parseDate(createdDate);
      if (parsedDate) {
        data.push({
          date: parsedDate,
          dateStr: createdDate,
          status: status
        });
      }
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
  
  if (lineChartInstance) {
    lineChartInstance.data = chartData;
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
          legend: { position: "top", labels: { color: "#000000" } },
        },
        scales: {
          x: { 
            ticks: { color: "#000000" }, 
            grid: { color: "rgba(140,170,200,0.12)" },
            title: {
              display: true,
              text: 'Date (Year-Month)',
              color: "#000000"
            }
          },
          y: { 
            beginAtZero: true, 
            ticks: { stepSize: 1, color: "#000000" }, 
            grid: { color: "rgba(140,170,200,0.12)" } 
          },
        },
      },
    });
  }
}

updateLineChart('2022-01-01', '2025-12-31');

const tableSearch = document.getElementById("tableSearch");
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
  const fromDate = dateFrom.value ? new Date(dateFrom.value) : null;
  const toDate = dateTo.value ? new Date(dateTo.value) : null;
  
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
    dateFrom.value = "2022-01-01";
    dateTo.value = "2025-12-31";
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
    const query = tableSearch.value.toLowerCase().trim();
    const rows = document.querySelectorAll("#dataTable tbody tr");
    
    rows.forEach(tr => {
      const match = tr.innerText.toLowerCase().includes(query);
      tr.style.display = match ? "" : "none";
    });
  });
}

if (columnManagerBtn && columnManagerDropdown) {
  columnManagerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    columnManagerDropdown.style.display = 
      columnManagerDropdown.style.display === 'none' ? 'block' : 'none';
  });
}

document.querySelectorAll('.column-option input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', (e) => {
    const columnIndex = parseInt(e.target.getAttribute('data-column'));
    const table = document.getElementById('dataTable');
    const isChecked = e.target.checked;
    
    const th = table.querySelector(`thead th[data-column="${columnIndex}"]`);
    if (th) {
      th.classList.toggle('hidden', !isChecked);
    }
    
    table.querySelectorAll('tbody tr').forEach(row => {
      const td = row.cells[columnIndex];
      if (td) {
        td.classList.toggle('hidden', !isChecked);
      }
    });
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

function swapColumns(col1, col2) {
  const table = document.getElementById('dataTable');
  const rows = table.querySelectorAll('tr');
  
  rows.forEach(row => {
    const cells = Array.from(row.cells);
    if (cells[col1] && cells[col2]) {
      const temp = cells[col1].outerHTML;
      cells[col1].outerHTML = cells[col2].outerHTML;
      cells[col2].outerHTML = temp;
      
      const newCells = Array.from(row.cells);
      if (newCells[col1].hasAttribute('data-column')) {
        newCells[col1].setAttribute('data-column', col1);
      }
      if (newCells[col2].hasAttribute('data-column')) {
        newCells[col2].setAttribute('data-column', col2);
      }
    }
  });
  
  rebindDragEvents();
}

function rebindDragEvents() {
  document.querySelectorAll('#tableHeader th').forEach(th => {
    const newTh = th.cloneNode(true);
    th.parentNode.replaceChild(newTh, th);
  });
  
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
}

document.addEventListener('click', () => {
  if (columnManagerDropdown) columnManagerDropdown.style.display = 'none';
});

const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');
const container = document.querySelector('.container');

if (sidebarToggle && sidebar && container) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    container.classList.toggle('sidebar-collapsed');
  });
}

const chartModal = document.getElementById('chartModal');
const modalClose = document.getElementById('modalClose');
const modalChartWrap = document.getElementById('modalChartWrap');
const expandBtns = document.querySelectorAll('.expand-btn');

let currentExpandedChart = null;

expandBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const chartId = btn.getAttribute('data-chart');
    const originalCanvas = document.getElementById(chartId);
    
    // Get chart title from the card
    const chartCard = btn.closest('.chart-card, .line-chart-container');
    const chartTitle = chartCard ? chartCard.querySelector('h3').textContent : '';
    
    if (originalCanvas && chartModal && modalChartWrap) {
      // Set modal title
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
                  font: { size: 14 }
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