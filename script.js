// CONFIG: Replace with your Apps Script web app URL
const API_URL = 'https://script.google.com/macros/s/AKfycbxpkzzL9GJWD-60FIp0uubeM0RrT6DXyyOu81vmMgwjv80jN-U4-P6AAlIX2gvvW_uN/exec';

let editingRow = null;
let editingEntryId = null;

const form = document.getElementById('student-form');
const tableBody = document.querySelector('#student-table tbody');
const idInput = document.getElementById('student-id');
const nameInput = document.getElementById('student-name');
const phoneInput = document.getElementById('student-phone');
const addBtn = document.getElementById('add-btn');

// Fetch and display all students
async function loadStudents() {
  tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>';
  try {
    const res = await fetch(API_URL + '?action=read');
    const data = await res.json();
    tableBody.innerHTML = '';
    data.forEach((student, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.phone}</td>
        <td class="actions">
          <button class="btn btn-edit" data-idx="${idx}">Edit</button>
          <button class="btn btn-delete" data-idx="${idx}">Delete</button>
        </td>
      `;
      tr.dataset.entryId = student.id;
      tableBody.appendChild(tr);
    });

    // Attach events
    document.querySelectorAll('.btn-edit').forEach(btn => btn.onclick = () => startEdit(data[btn.dataset.idx]));
    document.querySelectorAll('.btn-delete').forEach(btn => btn.onclick = () => deleteEntry(data[btn.dataset.idx]));
  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:red;">Failed to load data.</td></tr>';
  }
}

function resetForm() {
  form.reset();
  addBtn.textContent = 'Add Student';
  editingRow = null;
  editingEntryId = null;
}

form.onsubmit = async function(e) {
  e.preventDefault();
  const id = idInput.value.trim();
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  if (!id || !name || !phone) return;

  addBtn.disabled = true;

  if (editingEntryId) {
    // Update existing
    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', id, name, phone }),
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    // Add new
    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'create', id, name, phone }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  resetForm();
  addBtn.disabled = false;
  await loadStudents();
};

function startEdit(student) {
  idInput.value = student.id;
  nameInput.value = student.name;
  phoneInput.value = student.phone;
  addBtn.textContent = 'Update Student';
  editingEntryId = student.id;
}

async function deleteEntry(student) {
  if (!confirm('Delete this entry?')) return;
  await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'delete', id: student.id }),
    headers: { 'Content-Type': 'application/json' }
  });
  await loadStudents();
}

// On page load
window.onload = loadStudents;
