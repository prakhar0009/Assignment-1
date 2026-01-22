const addBtn = document.querySelector(".add-btn");
const modalOverlay = document.querySelector(".modal-overlay");
const modalBox = document.querySelector(".modal-box");
const form = document.getElementById("documentForm");
const lastModifiedText = document.getElementById("lastModifiedText");

addBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // prevent immediate close
  modalOverlay.classList.add("active");

  // auto set date & time
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
  modalOverlay.classList.remove("active");
});
