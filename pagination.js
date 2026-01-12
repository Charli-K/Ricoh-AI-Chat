let currentPage = 1;
let rowsPerPage = 10;
let allRows = [];

function initPagination() {
  const tbody = document.querySelector("#dataTable tbody");
  if (!tbody) return;
  
  allRows = Array.from(tbody.querySelectorAll("tr"));
  updatePagination();
}

function updatePagination() {
  const visibleRows = allRows.filter(row => row.style.display !== 'none');
  const totalPages = Math.ceil(visibleRows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  
  allRows.forEach(row => {
    if (row.style.display !== 'none') {
      row.classList.add('pagination-hidden');
    }
  });
  
  visibleRows.slice(startIndex, endIndex).forEach(row => {
    row.classList.remove('pagination-hidden');
  });
  
  updatePaginationButtons(totalPages);
}

function updatePaginationButtons(totalPages) {
  const pagination = document.querySelector('.pagination');
  if (!pagination) return;
  
  pagination.innerHTML = '';
  
  const newPrevBtn = document.createElement('button');
  newPrevBtn.id = 'prevBtn';
  newPrevBtn.textContent = 'Previous';
  newPrevBtn.disabled = currentPage === 1;
  newPrevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updatePagination();
    }
  });
  pagination.appendChild(newPrevBtn);
  
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      updatePagination();
    });
    pagination.appendChild(btn);
  }
  
  if (totalPages > 5) {
    const lastBtn = document.createElement('button');
    lastBtn.textContent = totalPages;
    if (totalPages === currentPage) lastBtn.classList.add('active');
    lastBtn.addEventListener('click', () => {
      currentPage = totalPages;
      updatePagination();
    });
    pagination.appendChild(lastBtn);
  }
  
  const newNextBtn = document.createElement('button');
  newNextBtn.id = 'nextBtn';
  newNextBtn.textContent = 'Next';
  newNextBtn.disabled = currentPage === totalPages;
  newNextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      updatePagination();
    }
  });
  pagination.appendChild(newNextBtn);
}

const pageSizeSelect = document.getElementById('pageSize');
if (pageSizeSelect) {
  // Set initial value
  rowsPerPage = parseInt(pageSizeSelect.value) || 10;
  
  pageSizeSelect.addEventListener('change', (e) => {
    rowsPerPage = parseInt(e.target.value);
    currentPage = 1;
    updatePagination();
  });
}

setTimeout(() => {
  initPagination();
}, 100);
