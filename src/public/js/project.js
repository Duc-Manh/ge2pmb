// Project Management Page Scripts

document.addEventListener('click', function (event) {
  const selector = document.getElementById('projectSelector');
  const button = document.getElementById('btnToggleProject');
  if (selector && button && !selector.classList.contains('hidden')) {
    if (!selector.contains(event.target) && !button.contains(event.target)) {
      selector.classList.add('hidden');
    }
  }
});

function saveScheduleData(level) {
  const tbody = document.getElementById('scheduleBody' + level);
  const rows = tbody.querySelectorAll('tr');
  const data = [];
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    if (inputs.length >= 5) {
      data.push({
        start_time: inputs[0].value,
        end_time: inputs[1].value,
        content: inputs[2].value,
        personnel: inputs[3].value,
        equipment: inputs[4].value
      });
    }
  });

  const input = document.querySelector(`input[name="schedule_level${level}"]`);
  if (input) {
    input.value = JSON.stringify(data);
  }

  document.getElementById(`scheduleModal${level}`).classList.add('hidden');
}

function addScheduleRow(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  const tr = document.createElement('tr');
  tr.className = "text-sm text-slate-600 border-b border-slate-200 hover:bg-slate-50/50";
  tr.innerHTML = `
  <td class="px-4 py-3 border-r border-slate-200">
    <input type="date" class="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-evnBlue focus:ring-1 focus:ring-evnBlue">
  </td>
  <td class="px-4 py-3 border-r border-slate-200">
    <input type="date" class="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-evnBlue focus:ring-1 focus:ring-evnBlue">
  </td>
  <td class="px-4 py-3 border-r border-slate-200">
    <input type="text" class="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-evnBlue focus:ring-1 focus:ring-evnBlue">
  </td>
  <td class="px-4 py-3 border-r border-slate-200">
    <input type="number" min="1" max="100" class="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-evnBlue focus:ring-1 focus:ring-evnBlue">
  </td>
  <td class="px-4 py-3 border-r border-slate-200">
    <input type="text" class="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-evnBlue focus:ring-1 focus:ring-evnBlue">
  </td>
  <td class="px-4 py-3 text-center">
    <button type="button" onclick="this.closest('tr').remove()" class="text-red-600 hover:text-red-800 font-medium">Xoá</button>
  </td>
`;
  tbody.appendChild(tr);
}

function filterProjects(status, btnElement) {
  // Reset all buttons style
  const btns = document.querySelectorAll('.filter-btn');
  btns.forEach(btn => {
    btn.className = "filter-btn px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors whitespace-nowrap";
  });
  // Set active button style
  btnElement.className = "filter-btn px-4 py-1.5 rounded-full bg-evnBlue text-white text-sm font-medium shadow-sm whitespace-nowrap";

  // Filter rows
  const rows = document.querySelectorAll('.project-row');
  rows.forEach(row => {
    if (status === 'all' || row.getAttribute('data-status') === status) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}
