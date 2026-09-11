const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const STORAGE_KEY = "homework-board-assignments";

const board = document.querySelector("#board");
const emptyState = document.querySelector("#emptyState");
const modalBackdrop = document.querySelector("#modalBackdrop");
const form = document.querySelector("#homeworkForm");
const dayInput = document.querySelector("#dayInput");
const dueDateInput = document.querySelector("#dueDateInput");
const toast = document.querySelector("#toast");
const welcomeBackdrop = document.querySelector("#welcomeBackdrop");
const welcomeForm = document.querySelector("#welcomeForm");
const nameInput = document.querySelector("#nameInput");
const welcomeHeading = document.querySelector("#welcomeHeading");
const themePicker = document.querySelector("#themePicker");
const themeButton = document.querySelector("#themeButton");

let homework = loadHomework();
let toastTimer;
let pointerDrag = null;
const PROFILE_KEY = "homework-board-profile";
const THEME_KEY = "homework-board-theme";

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

function loadProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    return profile && typeof profile.name === "string" ? profile : null;
  } catch {
    return null;
  }
}

function applyProfile() {
  const profile = loadProfile();
  if (profile) welcomeHeading.textContent = `Welcome back, ${profile.name}.`;
}

function applyTheme(theme) {
  const validThemes = ["coffee", "ocean", "sage", "plum"];
  const selectedTheme = validThemes.includes(theme) ? theme : "coffee";
  document.documentElement.dataset.theme = selectedTheme;
  localStorage.setItem(THEME_KEY, selectedTheme);
  document.querySelectorAll(".theme-option").forEach((option) => {
    option.classList.toggle("selected", option.dataset.theme === selectedTheme);
  });
}

function cardTemplate(item, index) {
  const dueStatus = getDueStatus(item.dueDate, item.completed);
  const dueTitle = isValidDateValue(item.dueDate) ? `Due ${formatDate(item.dueDate)}` : "No due date";
  return `
    <article class="homework-card ${item.completed ? "completed" : ""}" draggable="true" data-id="${item.id}">
      <button class="card-menu" type="button" data-delete="${item.id}" aria-label="Delete ${escapeHtml(item.task)}">×</button>
      <h3 class="task-name">${escapeHtml(item.task)}</h3>
      <span class="subject">${escapeHtml(item.subject)}</span>
      <span class="due-date due-date-${dueStatus.className}" title="${dueTitle}">
        <span aria-hidden="true">${dueStatus.icon}</span>
        ${dueStatus.label}
      </span>
      ${item.notes ? `<p class="notes">${escapeHtml(item.notes)}</p>` : ""}
      <div class="card-footer">
        <label class="complete-label">
          <input type="checkbox" data-complete="${item.id}" ${item.completed ? "checked" : ""} />
          ${item.completed ? "Completed" : "Mark complete"}
        </label>
      </div>
    </article>`;
}

function isValidDateValue(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function getDueStatus(dueDate, completed) {
  if (!isValidDateValue(dueDate)) return { className: "upcoming", label: "No due date", icon: "•" };
  if (completed) return { className: "complete", label: `Due ${formatDate(dueDate)}`, icon: "✓" };
  const today = startOfToday();
  const due = new Date(`${dueDate}T00:00:00`);
  const daysUntilDue = Math.round((due - today) / 86400000);
  if (daysUntilDue < 0) return { className: "overdue", label: `Overdue · ${formatDate(dueDate)}`, icon: "!" };
  if (daysUntilDue === 0) return { className: "today", label: "Due today", icon: "!" };
  if (daysUntilDue <= 3) return { className: "soon", label: `Due ${formatDate(dueDate)}`, icon: "•" };
  return { className: "upcoming", label: `Due ${formatDate(dueDate)}`, icon: "•" };
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" })
    .format(new Date(`${value}T00:00:00`));
}

function bindBoardEvents() {
  document.querySelectorAll(".homework-card").forEach((card) => {
    card.addEventListener("pointerdown", (event) => beginPointerDrag(event, card));
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

function beginPointerDrag(event, card) {
  if (event.button !== 0 || event.target.closest("button, input, label")) return;
  event.preventDefault();
  pointerDrag = {
    card,
    id: card.dataset.id,
    startX: event.clientX,
    startY: event.clientY,
    preview: null,
    active: false,
  };
  document.addEventListener("pointermove", movePointerDrag);
  document.addEventListener("pointerup", endPointerDrag, { once: true });
  document.addEventListener("pointercancel", cancelPointerDrag, { once: true });
}

function movePointerDrag(event) {
  if (!pointerDrag) return;
  const distance = Math.hypot(event.clientX - pointerDrag.startX, event.clientY - pointerDrag.startY);
  if (!pointerDrag.active && distance < 6) return;
  if (!pointerDrag.active) {
    pointerDrag.active = true;
    const bounds = pointerDrag.card.getBoundingClientRect();
    pointerDrag.preview = pointerDrag.card.cloneNode(true);
    pointerDrag.preview.classList.add("drag-preview");
    pointerDrag.preview.style.width = `${bounds.width}px`;
    document.body.appendChild(pointerDrag.preview);
    pointerDrag.card.classList.add("drag-placeholder");
  }
  pointerDrag.preview.style.left = `${event.clientX - pointerDrag.preview.offsetWidth / 2}px`;
  pointerDrag.preview.style.top = `${event.clientY - 20}px`;
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".day-column");
  document.querySelectorAll(".drag-over").forEach((column) => column.classList.toggle("drag-over", column === target));
}

function endPointerDrag(event) {
  if (!pointerDrag) return;
  document.removeEventListener("pointermove", movePointerDrag);
  document.removeEventListener("pointercancel", cancelPointerDrag);
  const drag = pointerDrag;
  pointerDrag = null;
  if (!drag.active) return;
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".day-column");
  const item = homework.find((entry) => entry.id === drag.id);
  const targetCards = target?.querySelector(".cards");
  if (item && targetCards && target.dataset.day !== item.day) {
    item.day = target.dataset.day;
    saveHomework();
    targetCards.appendChild(drag.card);
    updateDayCounts();
    updateSummary();
    drag.card.classList.add("just-moved");
    setTimeout(() => drag.card.classList.remove("just-moved"), 500);
    showToast(`Moved to ${item.day}`);
  }
  cleanupPointerDrag(drag);
}

function cancelPointerDrag() {
  if (!pointerDrag) return;
  const drag = pointerDrag;
  pointerDrag = null;
  document.removeEventListener("pointermove", movePointerDrag);
  document.removeEventListener("pointerup", endPointerDrag);
  cleanupPointerDrag(drag);
}

function cleanupPointerDrag(drag) {
  drag.card.classList.remove("drag-placeholder");
  drag.preview?.remove();
  document.querySelectorAll(".drag-over").forEach((column) => column.classList.remove("drag-over"));
}

function updateDayCounts() {
  document.querySelectorAll(".day-column").forEach((column) => {
    column.querySelector(".day-count").textContent = column.querySelector(".cards").children.length;
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
  dueDateInput.value = "";
  document.querySelector("#taskInput").focus();
}
function closeModal() { modalBackdrop.hidden = true; form.reset(); }
function closeThemePicker() {
  themePicker.hidden = true;
  themeButton.setAttribute("aria-expanded", "false");
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

themeButton.addEventListener("click", () => {
  themePicker.hidden = !themePicker.hidden;
  themeButton.setAttribute("aria-expanded", String(!themePicker.hidden));
});
document.querySelectorAll(".theme-option").forEach((option) => {
  option.addEventListener("click", () => {
    applyTheme(option.dataset.theme);
    closeThemePicker();
    showToast("Theme updated");
  });
});
document.addEventListener("click", (event) => {
  if (!themePicker.hidden && !themePicker.contains(event.target) && event.target !== themeButton) closeThemePicker();
});
welcomeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ name }));
  welcomeBackdrop.hidden = true;
  applyProfile();
  showToast(`Nice to meet you, ${name}`);
});
document.querySelector("#welcomeBackdrop").addEventListener("click", (event) => {
  if (event.target === welcomeBackdrop) nameInput.focus();
});

applyTheme(localStorage.getItem(THEME_KEY) || "coffee");
applyProfile();
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
    dueDate: formData.get("dueDate"),
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
if (!loadProfile()) {
  welcomeBackdrop.hidden = false;
  nameInput.focus();
}
