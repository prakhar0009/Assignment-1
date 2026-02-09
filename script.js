"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const addBtn = document.querySelector(".add-btn");
const modalOverlay = document.querySelector(".modal-overlay");
const modalBox = document.querySelector(".modal-box");
// const form = document.getElementById("documentForm") as HTMLFormElement | null;
const form = document.querySelector("#documentForm");
const lastModifiedText = document.getElementById("lastModifiedText");
const dropDown = document.querySelector(".user-right");
const logOut = document.querySelector(".log-out");
const docStatus = document.querySelector(".docStatus");
const forPending = document.querySelector(".for-pending");
const searchInput = document.querySelector(".search-input");
let editIndex = null;
if (!addBtn || !modalOverlay || !modalBox || !form || !lastModifiedText || !dropDown || !logOut || !docStatus || !forPending || !searchInput) {
    throw new Error("Required modal elements are not found");
}
addBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    editIndex = null;
    form.reset();
    forPending.style.display = "none";
    const title = modalOverlay.querySelector("h3");
    if (title)
        title.innerHTML = "Add Details";
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
    const docId = crypto.randomUUID();
    const titleInput = document.querySelector("#docName");
    if (!titleInput)
        return;
    const title = titleInput.value.trim();
    const status = docStatus.value;
    const waiting = status === "pending"
        ? Number(document.querySelector(".for-pending input")?.value || 0)
        : 0;
    const now = new Date();
    const lastModifiedDate = now.toLocaleDateString();
    const lastModifiedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    console.log(docId);
    const docs = readDocs();
    const updatedDoc = {
        docId,
        title,
        status,
        waiting,
        lastModifiedDate,
        lastModifiedTime,
    };
    if (editIndex !== null) {
        docs[editIndex] = updatedDoc;
        editIndex = null;
    }
    else {
        docs.push(updatedDoc);
    }
    writeDocs(docs);
    renderTable();
    modalOverlay.classList.remove("active");
    form.reset();
    forPending.style.display = "none";
});
dropDown.addEventListener("click", function () {
    console.log("clicked");
    logOut.style.display = logOut.style.display === "flex" ? "none" : "flex";
});
docStatus.addEventListener("change", statusChange);
function statusChange() {
    if (!docStatus || !forPending)
        return;
    if (docStatus.value === "pending") {
        forPending.style.display = "block";
    }
    else {
        forPending.style.display = "none";
        const input = forPending.querySelector("input");
        if (input)
            input.value = "";
    }
}
const STORAGE_KEY = "documents";
function readDocs() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    }
    catch {
        return [];
    }
}
function writeDocs(docs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}
function renderTable() {
    const tbody = document.getElementById("docTbody");
    if (!tbody)
        return;
    tbody.innerHTML = "";
    const docs = readDocs();
    docs.forEach((doc) => tbody.appendChild(createRow(doc)));
}
document.addEventListener("DOMContentLoaded", renderTable);
searchInput.addEventListener("input", (e) => {
    const target = e.target;
    const searchValue = target.value.toLowerCase();
    const rows = document.querySelectorAll(".doc-table tbody tr");
    rows.forEach((row) => {
        const colName = row.querySelector(".col-name");
        if (!colName)
            return;
        const docName = colName.innerText.toLowerCase();
        const isStatus = row.querySelector(".col-status");
        if (!isStatus)
            return;
        const status = isStatus.innerText.toLowerCase();
        row.style.display =
            docName.includes(searchValue) || status.includes(searchValue)
                ? ""
                : "none";
    });
});
function createRow(doc) {
    const tr = document.createElement("tr");
    tr.className = "doc-item";
    const statusClass = doc.status || "pending";
    const statusDisplay = statusClass === "needs-signing"
        ? "Needs Signing"
        : statusClass.charAt(0).toUpperCase() + statusClass.slice(1);
    const actionText = statusClass === "completed"
        ? "Download PDF"
        : statusClass === "needs-signing"
            ? "Sign now"
            : "Preview";
    tr.innerHTML = `
    <td class="col-check"><input type="checkbox" style="cursor: pointer;"/></td>
    <td class="col-name"><span class="doc-title">${doc.title || "Untitled"}</span></td>
    <td class="col-status">
      <span class="status-pill ${statusClass}">${statusDisplay}</span>
      ${statusClass === "pending" ? `<div class="waiting-text">Waiting for <span style="color:#436d7c">${doc.waiting || 0} person</span></div>` : ""}
    </td>
    <td class="col-date"><span class="doc-date">${doc.lastModifiedDate}</span><br/><span class="doc-date">${doc.lastModifiedTime}</span></td>
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
    if (!menuDots || !additional || !rowEditBtn || !rowDeleteBtn) {
        return tr;
    }
    menuDots.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".additional")
            .forEach((m) => m !== additional && (m.style.display = "none"));
        additional.style.display =
            additional.style.display === "flex" ? "none" : "flex";
    });
    rowEditBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const docs = readDocs();
        editIndex = docs.findIndex((d) => d.docId === doc.docId);
        const docInput = document.querySelector("#docName");
        if (!docInput)
            return;
        docInput.value = doc.title;
        const docStatus = document.querySelector(".docStatus");
        if (!docStatus)
            return;
        docStatus.value = doc.status;
        statusChange();
        if (doc.status === "pending") {
            const pendingInput = forPending.querySelector("input");
            if (!pendingInput)
                return;
            pendingInput.value = String(doc.waiting);
        }
        const title = modalOverlay?.querySelector("h3");
        if (title)
            title.innerText = "Edit details";
        modalOverlay?.classList.add("active");
        additional.style.display = "none";
    });
    rowDeleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isConfirmed = confirm(`Are you sure you want to delete "${doc.title}"?`);
        if (isConfirmed) {
            let docs = readDocs();
            docs = docs.filter((d) => d.docId !== doc.docId);
            writeDocs(docs);
            renderTable();
        }
        else {
            additional.style.display = "none";
        }
    });
    return tr;
}
//# sourceMappingURL=script.js.map