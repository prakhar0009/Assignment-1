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


addBtn.addEventListener("click", (e) => {
  e.stopPropagation();
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

  const newDoc = { title, status, waiting, lastModified };
  docs.push(newDoc);
  writeDocs(docs);

  document.querySelector(".doc-table tbody").appendChild(createRow(newDoc));

  modalOverlay.classList.remove("active");
  form.reset();
  forPending.style.display = "none";
});

userCard.addEventListener("click", function () {
  logOut.style.display = logOut.style.display === "none" ? "flex" : "none";
});

docStatus.addEventListener("change", function () {
  console.log(docStatus.value);
  statusChange();
});

function statusChange() {
  if (docStatus.value === "pending") {
    forPending.style.display = "block";
  } else {
    forPending.style.display = "none";
    forPending.querySelector("input").value = "";
  }
}

const STORAGE_KEY = "documents";

// Function to read documents from localStorage
function readDocs() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Function to save documents to localStorage
function writeDocs(docs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector(".doc-table tbody");
  if (!tbody) return;

  tbody.innerHTML = ""; // Clear any existing rows first

  const docs = readDocs();
  docs.forEach((doc) => tbody.appendChild(createRow(doc)));
});

//searching in search box also its not case-sensitive
searchInput.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const rows = document.querySelectorAll(".doc-table tbody tr");

  rows.forEach(row => {
    const docName = row
      .querySelector(".col-name")
      .innerText.toLowerCase();

    const status = row
      .querySelector(".col-status")
      .innerText.toLowerCase();

    if (
      docName.includes(searchValue) ||
      status.includes(searchValue)
    ) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});


// Function to create a table row for a document
function createRow(doc) {
  const tr = document.createElement("tr");
  tr.className = "doc-item";

  const title = doc.title || "Untitled";
  const status = doc.status || "pending";
  const waiting = doc.waiting || 0;
  const date = doc.lastModified || "--";

  let statusText =
    status === "needs-signing"
      ? "Needs Signing"
      : status.charAt(0).toUpperCase() + status.slice(1);

  let waitingHTML =
    status === "pending"
      ? `<div class="waiting-text">
           Waiting for <span style="color:#436d7c">${waiting} person</span>
         </div>`
      : "";

  let actionText =
    status === "completed"
      ? "Download PDF"
      : status === "needs-signing"
        ? "Sign now"
        : "Preview";

  // Build the row HTML with the additional menu included
  tr.innerHTML = `
    <td class="col-check"><input type="checkbox" /></td>

    <td class="col-name">
      <span class="doc-title">${title}</span>
    </td>

    <td class="col-status">
      <span class="status-pill ${status}">${statusText}</span>
      ${waitingHTML}
    </td>

    <td class="col-date">
      <span class="doc-date">${date}</span>
    </td>

    <td class="col-action">
      <button class="action-btn">${actionText}</button>
      <button class="menu-dots">⋮</button>
      
      <div class="additional">
        <button class="additional-pill" style="color: gray">Edit</button>
        <button class="additional-pill" style="color: red">Delete</button>
      </div>
    </td>
  `;

  // NOW add the click event to the menu-dots button
  const menuDots = tr.querySelector(".menu-dots");
  const additional = tr.querySelector(".additional");

  menuDots.addEventListener("click", function (e) {
    e.stopPropagation(); // Stop the click from bubbling up

    // Close all other open menus first
    document.querySelectorAll(".additional").forEach((menu) => {
      if (menu !== additional) {
        menu.style.display = "none";
      }
    });

    // Toggle this menu (show/hide)
    if (additional.style.display === "flex") {
      additional.style.display = "none";
    } else {
      additional.style.display = "flex";
    }
  });

  document.addEventListener("click", function () {
    additional.style.display = "none";
  });

  return tr;
}
