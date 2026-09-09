const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const STORAGE_KEY = "homework-board-assignments";

const board = document.querySelector("#board");
const emptyState = document.querySelector("#emptyState");
const modalBackdrop = document.querySelector("#modalBackdrop");
const form = document.querySelector("#homeworkForm");
const dayInput = document.querySelector("#dayInput");
const toast = document.querySelector("#toast");

let homework = loadHomework();
let draggedId = null;
let toastTimer;

function loadHomework() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((item) => item && item.id && DAYS.includes(item.day)) : [];
  } catch {
    return [];
  }
}

function saveHomework() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(homework));
}

function render() {
  board.innerHTML = DAYS.map((day) => {
    const cards = homework.filter((item) => item.day === day);
    return `
      <section class="day-column" data-day="${day}">
        <div class="day-heading">
          <span class="day-name">${day}</span>
          <span class="day-count">${cards.length}</span>
        </div>
        <div class="cards" data-day="${day}">
          ${cards.map(cardTemplate).join("")}
        </div>
      </section>`;
  }).join("");
  bindBoardEvents();
  updateSummary();
  emptyState.hidden = homework.length > 0;
}

function cardTemplate(item) {
  return `
    <article class="homework-card ${item.completed ? "completed" : ""}" draggable="true" data-id="${item.id}">
      <button class="card-menu" type="button" data-delete="${item.id}" aria-label="Delete ${escapeHtml(item.task)}">×</button>
      <h3 class="task-name">${escapeHtml(item.task)}</h3>
      <span class="subject">${escapeHtml(item.subject)}</span>
      ${item.notes ? `<p class="notes">${escapeHtml(item.notes)}</p>` : ""}
      <div class="card-footer">
        <label class="complete-label">
          <input type="checkbox" data-complete="${item.id}" ${item.completed ? "checked" : ""} />
          ${item.completed ? "Completed" : "Mark complete"}
        </label>
      </div>
    </article>`;
}

function bindBoardEvents() {
  document.querySelectorAll(".homework-card").forEach((card) => {
    card.addEventListener("dragstart", () => {
      draggedId = card.dataset.id;
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => {
      draggedId = null;
      card.classList.remove("dragging");
      document.querySelectorAll(".drag-over").forEach((column) => column.classList.remove("drag-over"));
    });
  });
  document.querySelectorAll(".day-column").forEach((column) => {
    column.addEventListener("dragover", (event) => { event.preventDefault(); column.classList.add("drag-over"); });
    column.addEventListener("dragleave", (event) => {
      if (!column.contains(event.relatedTarget)) column.classList.remove("drag-over");
    });
    column.addEventListener("drop", (event) => {
      event.preventDefault();
      const item = homework.find((entry) => entry.id === draggedId);
      if (item && item.day !== column.dataset.day) {
        item.day = column.dataset.day;
        saveHomework();
        render();
        showToast(`Moved to ${item.day}`);
      }
    });
  });
  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      homework = homework.filter((item) => item.id !== button.dataset.delete);
      saveHomework();
      render();
      showToast("Homework deleted");
    });
  });
  document.querySelectorAll("[data-complete]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const item = homework.find((entry) => entry.id === checkbox.dataset.complete);
      if (!item) return;
      item.completed = checkbox.checked;
      saveHomework();
      render();
      showToast(item.completed ? "Nice work — marked complete" : "Marked as active");
    });
  });
}

function updateSummary() {
  const total = homework.length;
  const completed = homework.filter((item) => item.completed).length;
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  document.querySelector("#progressText").textContent = `${percentage}% complete`;
  document.querySelector("#progressBar").style.width = `${percentage}%`;
  document.querySelector("#clearCompletedButton").disabled = completed === 0;
}

function openModal() {
  modalBackdrop.hidden = false;
  dayInput.value = DAYS[0];
  document.querySelector("#taskInput").focus();
}
function closeModal() { modalBackdrop.hidden = true; form.reset(); }
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

dayInput.innerHTML = DAYS.map((day) => `<option value="${day}">${day}</option>`).join("");
document.querySelectorAll("#openModalButton, #emptyAddButton").forEach((button) => button.addEventListener("click", openModal));
document.querySelector("#closeModalButton").addEventListener("click", closeModal);
document.querySelector("#cancelButton").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (event) => { if (event.target === modalBackdrop) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modalBackdrop.hidden) closeModal(); });
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  homework.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    task: formData.get("task").trim(),
    subject: formData.get("subject").trim(),
    day: formData.get("day"),
    notes: formData.get("notes").trim(),
    completed: false,
  });
  saveHomework();
  render();
  closeModal();
  showToast("Homework added");
});
document.querySelector("#clearCompletedButton").addEventListener("click", () => {
  homework = homework.filter((item) => !item.completed);
  saveHomework();
  render();
  showToast("Completed homework cleared");
});

render();
