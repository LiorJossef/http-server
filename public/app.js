let assignments = [];
let currentFilter = 'all';

async function fetchAssignments() {
  const res = await fetch('/api/assignments/');
  assignments = await res.json();
  render();
}

async function addAssignment(title, course, dueDate) {
  const res = await fetch('/api/assignments/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, course, dueDate }),
  });
  const assignment = await res.json();
  assignments.push(assignment);
  render();
}

async function toggleDone(id) {
  const res = await fetch(`/api/assignments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const updated = await res.json();
  assignments = assignments.map((a) => (a.id === id ? updated : a));
  render();
}

async function deleteAssignment(id) {
  await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
  assignments = assignments.filter((a) => a.id !== id);
  render();
}

function isOverdue(dueDate) {
  return new Date(dueDate) < new Date() && dueDate;
}

function render() {
  const list = document.getElementById('assignments');

  const filtered = assignments.filter((a) => {
    if (currentFilter === 'pending') return !a.done;
    if (currentFilter === 'done') return a.done;
    return true;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<p class="empty">No assignments here 🎉</p>';
    return;
  }

  list.innerHTML = filtered.map((a) => `
    <li class="assignment-item ${a.done ? 'done' : ''}" data-id="${a.id}">
      <input type="checkbox" ${a.done ? 'checked' : ''} onchange="toggleDone('${a.id}')" />
      <div class="assignment-info">
        <div class="assignment-title">${a.title}</div>
        <div class="assignment-meta">
          <span class="course-tag">${a.course}</span>
          <span class="due-date ${!a.done && isOverdue(a.dueDate) ? 'overdue' : ''}">
            Due ${a.dueDate}
          </span>
        </div>
      </div>
      <button class="delete-btn" onclick="deleteAssignment('${a.id}')">✕</button>
    </li>
  `).join('');
}

document.getElementById('add-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const course = document.getElementById('course').value.trim();
  const dueDate = document.getElementById('dueDate').value;
  addAssignment(title, course, dueDate);
  e.target.reset();
});

document.querySelectorAll('.filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

fetchAssignments();
