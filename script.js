const addBtn = document.querySelector(".add-btn");
const modalOverlay = document.querySelector(".modal-overlay");
const modalBox = document.querySelector(".modal-box");
const form = document.getElementById("documentForm");
const lastModifiedText = document.getElementById("lastModifiedText");
const userCard = document.querySelector(".user-card");
const logOut = document.querySelector(".log-out");
const additional = document.querySelector(".additional");
const menuDots = document.querySelector(".menu-dots");
const docStatus = document.querySelector(".docStatus");
const forPending = document.querySelector(".for-pending");

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

userCard.addEventListener("click", function () {
  logOut.style.display = logOut.style.display === "none" ? "flex" : "none";
});

menuDots.addEventListener("click", function () {
  additional.style.display =
    additional.style.display === "none" ? "flex" : "none";
});

docStatus.addEventListener("change", function () {
  console.log(docStatus.value);
  statusChange();
});

function statusChange() {
  if (docStatus.value === "pending") forPending.style.display = "block";
  else {
    forPending.style.display = "none";
    forPending.value = "";
  }
}
