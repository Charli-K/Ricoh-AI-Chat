// 圖表色彩（與原先 script.js palette 對齊）
const chartColors = {
  pending: "#ffd966",
  inProgress: "#9dc3e6",
  approve: "#a9d08e",
  completed: "#70ad47",
  cancel: "#ff6b6b",
};

// 表單資料
const formData = {
  formB: { pending: 10, inProgress: 5, approve: 3, completed: 2, cancel: 0 },
  formP: { pending: 8, inProgress: 7, approve: 1, completed: 4, cancel: 2 },
  formA: { pending: 6, inProgress: 3, approve: 5, completed: 6, cancel: 0 },
  formC: { pending: 4, inProgress: 2, approve: 2, completed: 8, cancel: 1 },
};

// 產生圓餅圖設定
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

// 初始化圓餅圖
new Chart(document.getElementById("chartFormB"), pieConfig(formData.formB));
new Chart(document.getElementById("chartFormP"), pieConfig(formData.formP));
new Chart(document.getElementById("chartFormA"), pieConfig(formData.formA));
new Chart(document.getElementById("chartFormC"), pieConfig(formData.formC));

// 折線圖
new Chart(document.getElementById("lineChart"), {
  type: "line",
  data: {
    labels: ["Form B", "Form P", "Form A", "Form C"],
    datasets: [
      {
        label: "Pending",
        data: [formData.formB.pending, formData.formP.pending, formData.formA.pending, formData.formC.pending],
        borderColor: chartColors.pending,
        backgroundColor: chartColors.pending + "40",
        tension: 0.4,
      },
      {
        label: "In Progress",
        data: [formData.formB.inProgress, formData.formP.inProgress, formData.formA.inProgress, formData.formC.inProgress],
        borderColor: chartColors.inProgress,
        backgroundColor: chartColors.inProgress + "40",
        tension: 0.4,
      },
      {
        label: "Completed",
        data: [formData.formB.completed, formData.formP.completed, formData.formA.completed, formData.formC.completed],
        borderColor: chartColors.completed,
        backgroundColor: chartColors.completed + "40",
        tension: 0.4,
      },
      {
        label: "Cancel",
        data: [formData.formB.cancel, formData.formP.cancel, formData.formA.cancel, formData.formC.cancel],
        borderColor: chartColors.cancel,
        backgroundColor: chartColors.cancel + "40",
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: "top", labels: { color: "#000000" } },
    },
    scales: {
      x: { ticks: { color: "#000000" }, grid: { color: "rgba(140,170,200,0.12)" } },
      y: { beginAtZero: true, ticks: { stepSize: 2, color: "#000000" }, grid: { color: "rgba(140,170,200,0.12)" } },
    },
  },
});

// 簡易表格搜尋
const tableSearch = document.getElementById("tableSearch");
tableSearch.addEventListener("input", () => {
  const q = tableSearch.value.toLowerCase();
  document.querySelectorAll("#dataTable tbody tr").forEach(tr => {
    const match = tr.innerText.toLowerCase().includes(q);
    tr.style.display = match ? "" : "none";
  });
});

// 側邊欄切換功能
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');
const container = document.querySelector('.container');

if (sidebarToggle && sidebar && container) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    container.classList.toggle('sidebar-collapsed');
  });
}

// 圖表放大功能
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
    
    if (originalCanvas && chartModal && modalChartWrap) {
      // 清空模態框內容
      modalChartWrap.innerHTML = '';
      
      // 創建新的canvas
      const newCanvas = document.createElement('canvas');
      newCanvas.id = 'modalChart';
      modalChartWrap.appendChild(newCanvas);
      
      // 獲取原始圖表的Chart.js實例
      const originalChart = Chart.getChart(originalCanvas);
      if (originalChart) {
        // 深度複製圖表配置
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
                  ...originalChart.config.options.plugins.legend.labels
                }
              }
            },
            scales: originalChart.config.options.scales ? {
              x: originalChart.config.options.scales.x ? {...originalChart.config.options.scales.x} : undefined,
              y: originalChart.config.options.scales.y ? {...originalChart.config.options.scales.y} : undefined
            } : undefined
          }
        };
        
        currentExpandedChart = new Chart(newCanvas, config);
      }
      
      // 顯示模態框
      chartModal.classList.add('active');
    }
  });
});

// 關閉模態框
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

// ESC鍵關閉模態框
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chartModal && chartModal.classList.contains('active')) {
    closeModal();
  }
});