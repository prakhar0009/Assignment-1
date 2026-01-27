// Global Selectors
const addBtn = document.querySelector(".add-btn");
const modalOverlay = document.querySelector(".modal-overlay");
const modalBox = document.querySelector(".modal-box");
const form = document.getElementById("documentForm");
const lastModifiedText = document.getElementById("lastModifiedText");
const userCard = document.querySelector(".user-card");
const logOut = document.querySelector(".log-out");
const docStatus = document.querySelector(".docStatus");
const forPending = document.querySelector(".for-pending");
const searchInput = document.querySelector(".search-input");

let editIndex = null; // Track if we are editing an existing row

// --- Modal Logic ---

addBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  editIndex = null; // Reset edit index for a new entry
  form.reset();
  forPending.style.display = "none";
  modalOverlay.querySelector("h3").innerText = "Add details";
  modalOverlay.classList.add("active");

  const now = new Date();
  lastModifiedText.textContent =
    now.toLocaleDateString() +
    " " +
    now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
});

modalOverlay.addEventListener("click", () => {
  modalOverlay.classList.remove("active");
});

modalBox.addEventListener("click", (e) => {
  e.stopPropagation();
});

// --- Form Submission (Add or Edit) ---

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("docName").value.trim();
  const status = docStatus.value;
  const waiting =
    status === "pending"
      ? Number(document.querySelector(".for-pending input")?.value || 0)
      : 0;

  const now = new Date();
  const lastModified =
    now.toLocaleDateString() +
    "<br/>" +
    now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const docs = readDocs();
  const updatedDoc = { title, status, waiting, lastModified };

  if (editIndex !== null) {
    // Edit existing document
    docs[editIndex] = updatedDoc;
    editIndex = null;
  } else {
    // Add new document
    docs.push(updatedDoc);
  }

  writeDocs(docs);
  renderTable();

  modalOverlay.classList.remove("active");
  form.reset();
  forPending.style.display = "none";
});

// --- User Interaction & Status Logic ---

userCard.addEventListener("click", function () {
  logOut.style.display = logOut.style.display === "none" ? "flex" : "none";
});

docStatus.addEventListener("change", statusChange);

function statusChange() {
  if (docStatus.value === "pending") {
    forPending.style.display = "block";
  } else {
    forPending.style.display = "none";
    forPending.querySelector("input").value = "";
  }
}

// --- Data Persistence ---

const STORAGE_KEY = "documents";

function readDocs() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeDocs(docs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

// --- Table Rendering ---

function renderTable() {
  const tbody = document.querySelector(".doc-table tbody");
  if (!tbody) return;
  tbody.innerHTML = ""; 
  const docs = readDocs();
  docs.forEach((doc) => tbody.appendChild(createRow(doc)));
}

document.addEventListener("DOMContentLoaded", renderTable);

// --- Search Logic ---

searchInput.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const rows = document.querySelectorAll(".doc-table tbody tr");

  rows.forEach(row => {
    const docName = row.querySelector(".col-name").innerText.toLowerCase();
    const status = row.querySelector(".col-status").innerText.toLowerCase();

    row.style.display = (docName.includes(searchValue) || status.includes(searchValue)) 
      ? "" 
      : "none";
  });
});

// --- Row Creation with Local Listeners ---

function createRow(doc) {
  const tr = document.createElement("tr");
  tr.className = "doc-item";

  // Logic for dynamic display text
  const statusClass = doc.status || "pending";
  const statusDisplay = statusClass === "needs-signing" ? "Needs Signing" : statusClass.charAt(0).toUpperCase() + statusClass.slice(1);
  const actionText = statusClass === "completed" ? "Download PDF" : statusClass === "needs-signing" ? "Sign now" : "Preview";

  tr.innerHTML = `
    <td class="col-check"><input type="checkbox" /></td>
    <td class="col-name"><span class="doc-title">${doc.title || "Untitled"}</span></td>
    <td class="col-status">
      <span class="status-pill ${statusClass}">${statusDisplay}</span>
      ${statusClass === "pending" ? `<div class="waiting-text">Waiting for <span style="color:#436d7c">${doc.waiting || 0} person</span></div>` : ""}
    </td>
    <td class="col-date"><span class="doc-date">${doc.lastModified || "--"}</span></td>
    <td class="col-action">
      <button class="action-btn">${actionText}</button>
      <button class="menu-dots">⋮</button>
      <div class="additional">
        <button class="additional-pill edit-row" style="color: gray">Edit</button>
        <button class="additional-pill delete-row" style="color: red">Delete</button>
      </div>
    </td>
  `;

  const menuDots = tr.querySelector(".menu-dots");
  const additional = tr.querySelector(".additional");
  const rowEditBtn = tr.querySelector(".edit-row");
  const rowDeleteBtn = tr.querySelector(".delete-row");

  // Toggle Menu
  menuDots.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".additional").forEach(m => m !== additional && (m.style.display = "none"));
    additional.style.display = additional.style.display === "flex" ? "none" : "flex";
  });

  // Edit Row Logic
  rowEditBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const docs = readDocs();
    editIndex = docs.findIndex(d => d.title === doc.title && d.lastModified === doc.lastModified);

    document.getElementById("docName").value = doc.title;
    docStatus.value = doc.status;
    statusChange();
    if(doc.status === "pending") {
      forPending.querySelector("input").value = doc.waiting;
    }

    modalOverlay.querySelector("h3").innerText = "Edit details";
    modalOverlay.classList.add("active");
    additional.style.display = "none";
  });

  // Delete Row Logic
  rowDeleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    const isConfirmed = confirm(`Are you sure you want to delete "${doc.title}"?`);
    
    if(isConfirmed){
      let docs = readDocs();
      docs = docs.filter(d => d.title !== doc.title || d.lastModified !== doc.lastModified);
      writeDocs(docs);
      renderTable();
    }else{
      additional.style.display = "none";
    }
  });

  return tr;
}