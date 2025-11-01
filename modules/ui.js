/**
 * UI Module
 * Handles all rendering, view management, and user interface interactions
 * This file contains all view rendering functions, modals, and UI updates
 * Large file due to extensive UI logic - organized by sections
 */

import { supabase } from '../config.js';
import { getCurrentUser } from '../auth.js';
import { 
  appState, 
  getViewingDate, 
  setViewingDate,
  getViewingMonth,
  setViewingMonth,
  getRandomMotivationalMessage,
  getUserSettings,
  getModules,
  getTasksForDate,
  getSBAForDate,
  getTelegramQuestionsForDate,
  getCatchUpQueue,
  setCatchUpQueue,
  getScheduleForDate,
  setScheduleForDate
} from './state.js';
import {
  formatDate,
  formatDateShort,
  formatDateISO,
  getDaysBetween,
  getWeekStart,
  getDayType,
  getWorkInfo,
  getTemplateRevisionResourcesForWeek,
  templateDetailedSchedule,
  defaultModules
} from './schedule.js';
import {
  loadTasksForDate,
  loadTasksForDateRange,
  toggleTaskCompletion,
  saveDailyNote,
  updateDayScheduleType,
  removeCatchUpItem,
  getModuleProgressStats,
  loadSBATests,
  loadSBASchedule,
  loadSBAScheduleByDate,
  toggleSBAScheduleCompletion,
  deleteSBAScheduleEntry,
  createSBATest,
  updateSBATest,
  deleteSBATest,
  createSBAScheduleEntry,
  loadTelegramQuestions,
  loadTelegramQuestionsByDate,
  toggleTelegramQuestionCompletion,
  deleteTelegramQuestion,
  createTelegramQuestion,
  updateTelegramQuestion,
  bulkUploadSBA,
  bulkUploadTelegramQuestions,
  createPlaceholders,
  updateSBATestProgress,
  createTask,
  updateTask,
  deleteTask,
  createTaskCategory,
  findNextAvailableDay,
  rescheduleTask,
  findMissedTasks,
  autoRescheduleMissedTasks,
  executeReschedulePlan,
  loadCatchUpQueue
} from './storage.js';
import {
  calculateOverallProgress,
  calculateModuleProgress,
  updateSBAHeaderStats,
  updateTelegramHeaderStats
} from './progress.js';
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirm,
  showToastWithAction
} from './toast.js';
import {
  validateSBABulkUpload,
  validateTelegramBulkUpload
} from './validation.js';

// ==========================================================
// HELPER FUNCTIONS
// ==========================================================

export function showLoading(show) {
  document.getElementById('loadingIndicator').style.display = show ? 'flex' : 'none';
}

// ==========================================================
// MODAL ACCESSIBILITY HELPERS
// ==========================================================

let lastFocusedElement = null;

/**
 * Open modal with focus management
 * @param {HTMLElement} modalElement - The modal element to open
 */
export function openModal(modalElement) {
  if (!modalElement) return;
  
  // Store the currently focused element
  lastFocusedElement = document.activeElement;
  
  // Show the modal
  modalElement.style.display = 'flex';
  
  // Move focus to the first focusable element in the modal
  setTimeout(() => {
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, 10);
  
  // Trap focus within modal
  modalElement.addEventListener('keydown', trapFocus);
}

/**
 * Close modal with focus restoration
 * @param {HTMLElement} modalElement - The modal element to close
 */
export function closeModal(modalElement) {
  if (!modalElement) return;
  
  // Hide the modal
  modalElement.style.display = 'none';
  
  // Remove focus trap listener
  modalElement.removeEventListener('keydown', trapFocus);
  
  // Restore focus to the element that was focused before opening
  if (lastFocusedElement && lastFocusedElement.focus) {
    lastFocusedElement.focus();
  }
  lastFocusedElement = null;
}

/**
 * Trap focus within modal
 * @param {KeyboardEvent} e - The keyboard event
 */
function trapFocus(e) {
  if (e.key !== 'Tab') return;
  
  const modal = e.currentTarget;
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (e.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}

// Calculate total time for a day from categories
function calculateTotalTimeForDay(categories) {
  let totalMinutes = 0;
  categories.forEach(cat => {
    const catTime = parseTimeEstimate(cat.time_estimate);
    totalMinutes += catTime;
  });
  return totalMinutes;
}

// Parse time estimate string to minutes
function parseTimeEstimate(timeStr) {
  if (!timeStr) return 0;
  
  let minutes = 0;
  const hourMatch = timeStr.match(/(\d+)\s*h/i);
  const minMatch = timeStr.match(/(\d+)\s*m/i);
  
  if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
  if (minMatch) minutes += parseInt(minMatch[1]);
  
  return minutes;
}

// Format minutes to hours and minutes display
function formatMinutesToHours(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
}

// Update header stats
export function updateHeaderStats() {
  if (!getUserSettings()) return;

  const examDate = new Date(getUserSettings().exam_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysToExam = getDaysBetween(today, examDate);

  document.getElementById('daysUntilExam').textContent = daysToExam;
  document.getElementById('headerExamDate').textContent = formatDate(examDate);

  // Calculate overall progress - ONLY TASKS UP TO TODAY
  const progress = calculateOverallProgress();
  document.getElementById('overallProgress').textContent = `${progress.percentage}% (${progress.completed}/${progress.total})`;
}

// Update motivational banner
export function updateMotivationalBanner() {
  const randomMessage = getRandomMotivationalMessage();
  document.getElementById('motivationalBanner').textContent = randomMessage;
}

// Update catch-up queue
export function updateCatchUpQueue() {
  const catchUpQueue = getCatchUpQueue();
  const count = catchUpQueue.length;
  document.getElementById('catchUpCount').textContent = count;

  const panel = document.getElementById('catchUpQueue');
  const content = document.getElementById('catchUpContent');

  if (count === 0) {
    content.innerHTML = '<p class="no-catchup">No catch-up tasks! You\'re all caught up! 🎉</p>';
    panel.style.display = 'none';
  } else {
    panel.style.display = 'block';

    content.innerHTML = `
      <div class="catch-up-actions-row">
        <button onclick="window.showAutoRescheduleModal()" class="btn btn--primary btn--sm">🚀 Auto-reschedule Missed Tasks</button>
      </div>
      ${catchUpQueue.map(item => `
        <div class="catch-up-item">
          <div class="catch-up-item-info">
            <div class="catch-up-item-title">${item.original_topic}</div>
            <div class="catch-up-item-meta">
              Original: ${formatDateShort(new Date(item.original_date))} →
              Rescheduled to: ${formatDateShort(new Date(item.new_date))}
            </div>
          </div>
          <div class="catch-up-actions">
            <button class="btn btn--sm btn--outline" onclick="window.removeCatchUpItem('${item.id}')">Remove</button>
          </div>
        </div>
      `).join('')}
    `;
  }
}

// Remove catch-up item (exposed to window)
export async function removeCatchUpItemHandler(itemId) {
  try {
    await removeCatchUpItem(itemId);
    await loadAllUserData();
    updateCatchUpQueue();
  } catch (error) {
    console.error('Error removing catch-up item:', error);
  }
}

// Toggle catch-up queue visibility
export function toggleCatchUpQueue() {
  const panel = document.getElementById('catchUpQueue');
  const isHidden = panel.classList.contains('hidden');

  if (isHidden) {
    panel.classList.remove('hidden');
    document.getElementById('toggleCatchUpBtn').textContent = 'Hide';
  } else {
    panel.classList.add('hidden');
    document.getElementById('toggleCatchUpBtn').textContent = 'Show';
  }
}

// ==========================================================
// VIEW SWITCHING
// ==========================================================

export async function switchView(viewName) {
  // Update active tab
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === viewName) {
      btn.classList.add('active');
    }
  });

  // Update active view
  document.querySelectorAll('.view-section').forEach(section => {
    section.style.display = 'none';
  });

  const viewMap = {
    daily: 'dailyView',
    weekly: 'weeklyView',
    calendar: 'calendarView',
    modules: 'modulesView',
    sba: 'sbaView',
    telegram: 'telegramView'
  };

  document.getElementById(viewMap[viewName]).style.display = 'block';

  // Save to localStorage
  localStorage.setItem('studyplan-last-view', viewName);

  // Render the view
  if (viewName === 'daily') renderDailyView();
  else if (viewName === 'weekly') await renderWeeklyView();
  else if (viewName === 'calendar') await renderCalendarView();
  else if (viewName === 'modules') await renderModulesView();
  else if (viewName === 'sba') await renderSBAView();
  else if (viewName === 'telegram') await renderTelegramView();
}

// ==========================================================
// DAILY VIEW
// ==========================================================

export function renderDailyView() {
  const date = getViewingDate();
  const dateStr = formatDateISO(date);
  
  console.log('[renderDailyView] Rendering for date:', dateStr);

  // Update date display
  const currentDateEl = document.getElementById('currentDate');
  const newDateText = formatDate(date);
  if (currentDateEl.textContent !== newDateText) {
    currentDateEl.textContent = newDateText;
  }
  
  // Restore work-suitable filter state
  const filterCheckbox = document.getElementById('workSuitableFilter');
  const filterEnabled = localStorage.getItem('work-suitable-filter') === 'true';
  if (filterCheckbox && filterCheckbox.checked !== filterEnabled) {
    filterCheckbox.checked = filterEnabled;
  }

  // Get day type using loaded schedule or template fallback
  const dayTypeBadge = document.getElementById('dayTypeBadge');
  const workInfoElement = document.getElementById('workInfo');
  
  const daySchedule = getScheduleForDate(dateStr) || templateDetailedSchedule[dateStr];
  
  if (daySchedule) {
    const dayType = daySchedule.type;
    
    // Set badge based on day type
    const badgeClasses = {
      'work': 'day-type-badge work-day clickable',
      'off': 'day-type-badge light-day clickable',
      'revision': 'day-type-badge revision-day clickable',
      'trip': 'day-type-badge brazil-trip clickable',
      'trip-end': 'day-type-badge brazil-trip clickable',
      'intensive': 'day-type-badge intensive-day clickable',
      'intensive-post': 'day-type-badge intensive-day clickable',
      'rest': 'day-type-badge rest-day clickable',
      'exam-eve': 'day-type-badge rest-day clickable',
      'light': 'day-type-badge light-day clickable'
    };
    
    const badgeLabels = {
      'work': 'Work Day',
      'off': 'Off Day',
      'revision': 'Revision Day',
      'trip': 'Brazil Trip',
      'trip-end': 'Brazil Trip',
      'intensive': 'Intensive Study',
      'intensive-post': 'Intensive Study',
      'rest': 'Rest Day',
      'exam-eve': 'Exam Eve',
      'light': 'Light Study'
    };
    
    const newBadgeClass = badgeClasses[dayType] || 'day-type-badge clickable';
    const newBadgeText = badgeLabels[dayType] || 'Study Day';
    
    if (dayTypeBadge.className !== newBadgeClass) {
      dayTypeBadge.className = newBadgeClass;
    }
    if (dayTypeBadge.textContent !== newBadgeText) {
      dayTypeBadge.textContent = newBadgeText;
    }
    dayTypeBadge.onclick = () => window.showDayTypeEditor(dateStr, dayType);
    
    const newWorkInfo = getWorkInfo(date);
    if (workInfoElement.textContent !== newWorkInfo) {
      workInfoElement.textContent = newWorkInfo;
    }
  } else {
    if (dayTypeBadge.textContent !== 'Study Day') {
      dayTypeBadge.textContent = 'Study Day';
      dayTypeBadge.className = 'day-type-badge';
    }
    if (workInfoElement.textContent !== 'Regular study day') {
      workInfoElement.textContent = 'Regular study day';
    }
  }

  // Render tasks
  const categories = getTasksForDate(dateStr);
  const sbaEntries = getSBAForDate(dateStr);
  const telegramQuestions = getTelegramQuestionsForDate(dateStr);
  const dailyContent = document.getElementById('dailyContent');
  
  // Apply work-suitable filter if enabled
  const workSuitableFilter = localStorage.getItem('work-suitable-filter') === 'true';
  const filteredCategories = workSuitableFilter ? 
    categories.map(cat => ({
      ...cat,
      tasks: cat.tasks.filter(task => task.work_suitable)
    })).filter(cat => cat.tasks.length > 0) : 
    categories;
  
  console.log('[renderDailyView] Tasks:', filteredCategories);
  console.log('[renderDailyView] SBA:', sbaEntries);
  console.log('[renderDailyView] Telegram:', telegramQuestions);
  
  // Calculate statistics for sticky summary bar
  let totalTasks = 0;
  let completedTasks = 0;
  let totalMinutes = 0;
  let completedMinutes = 0;
  
  filteredCategories.forEach(cat => {
    const catTime = parseTimeEstimate(cat.time_estimate);
    totalMinutes += catTime;
    
    cat.tasks.forEach(task => {
      totalTasks++;
      if (task.completed) {
        completedTasks++;
        completedMinutes += parseTimeEstimate(task.time_estimate);
      }
    });
  });
  
  // Update sticky summary bar (only if changed)
  const summaryBar = document.getElementById('dailySummaryBar');
  const summaryTasksEl = document.getElementById('summaryTasks');
  const summaryTimeDoneEl = document.getElementById('summaryTimeDone');
  const summaryTimeRemainingEl = document.getElementById('summaryTimeRemaining');
  
  if (totalTasks > 0) {
    if (summaryBar.style.display !== 'flex') {
      summaryBar.style.display = 'flex';
    }
    const tasksSummary = `${completedTasks}/${totalTasks}`;
    if (summaryTasksEl.textContent !== tasksSummary) {
      summaryTasksEl.textContent = tasksSummary;
    }
    const timeDone = formatMinutesToHours(completedMinutes);
    if (summaryTimeDoneEl.textContent !== timeDone) {
      summaryTimeDoneEl.textContent = timeDone;
    }
    const timeRemaining = formatMinutesToHours(totalMinutes - completedMinutes);
    if (summaryTimeRemainingEl.textContent !== timeRemaining) {
      summaryTimeRemainingEl.textContent = timeRemaining;
    }
  } else {
    if (summaryBar.style.display !== 'none') {
      summaryBar.style.display = 'none';
    }
  }
  
  // Generate new HTML (still needed for complex structures, but we'll minimize changes)
  const timeDisplay = totalMinutes > 0 ? 
    `<div class="daily-time-total">⏱ Total time today: ${formatMinutesToHours(totalMinutes)}</div>` : '';

  let html = timeDisplay;

  // Render task categories
  if (filteredCategories.length > 0) {
    html += filteredCategories.map((category, catIndex) => `
      <div class="task-category" data-category-id="${category.id}">
        <div class="task-category-header" onclick="window.toggleCategory(${catIndex})">
          <div class="category-title">
            <span class="toggle-icon" id="toggle-${catIndex}">▶</span>
            ${category.category_name}
          </div>
          <div class="category-meta">${category.time_estimate}</div>
        </div>
        <div class="task-category-content" id="content-${catIndex}">
          <ul class="task-list">
            ${category.tasks.map(task => `
              <li class="task-item ${task.completed ? 'completed' : ''} ${task.is_placeholder ? 'placeholder' : ''}" data-task-id="${task.id}">
                <input
                  type="checkbox"
                  class="task-checkbox"
                  ${task.completed ? 'checked' : ''}
                  onchange="window.toggleTaskCompletionHandler('${task.id}')"
                />
                <div class="task-details">
                  <div class="task-name">
                    ${task.task_name}
                    ${task.is_placeholder ? '<span class="placeholder-badge">Placeholder</span>' : ''}
                  </div>
                  <div class="task-meta">
                    <span>⏱ ${task.time_estimate}</span>
                    ${task.work_suitable ? '<span class="task-badge work-suitable">✓ Work Suitable</span>' : ''}
                    <button class="btn btn--sm btn--accent" onclick="window.showRescheduleTaskModal('${task.id}', '${task.task_name}', '${dateStr}')" title="Reschedule this task">📅 Reschedule</button>
                    <button class="btn btn--sm btn--secondary" onclick="window.editTask('${task.id}')">Edit</button>
                    <button class="btn btn--sm btn--outline" onclick="window.deleteTaskConfirm('${task.id}')">Delete</button>
                  </div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  }

  // Render SBA schedule entries
  if (sbaEntries.length > 0) {
    const sbaIndex = filteredCategories.length;
    html += `
      <div class="task-category sba-category">
        <div class="task-category-header" onclick="window.toggleCategory(${sbaIndex})">
          <div class="category-title">
            <span class="toggle-icon" id="toggle-${sbaIndex}">▶</span>
            📋 SBA Tests
          </div>
          <div class="category-meta">${sbaEntries.length} test${sbaEntries.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="task-category-content" id="content-${sbaIndex}">
          <ul class="task-list">
            ${sbaEntries.map(sba => `
              <li class="task-item ${sba.completed ? 'completed' : ''} ${sba.is_placeholder ? 'placeholder' : ''}">
                <input
                  type="checkbox"
                  class="task-checkbox"
                  ${sba.completed ? 'checked' : ''}
                  onchange="window.handleSBAScheduleToggle('${sba.id}')"
                />
                <div class="task-details">
                  <div class="task-name">
                    ${sba.sba_name}
                    ${sba.is_placeholder ? '<span class="placeholder-badge">Placeholder</span>' : ''}
                  </div>
                  <div class="task-meta">
                    <button class="btn btn--sm btn--secondary" onclick="window.editSBAScheduleEntry('${sba.id}')">Edit</button>
                    <button class="btn btn--sm btn--outline" onclick="window.deleteSBAScheduleEntryConfirm('${sba.id}')">Delete</button>
                  </div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  // Render Telegram questions
  if (telegramQuestions.length > 0) {
    const telegramIndex = filteredCategories.length + (sbaEntries.length > 0 ? 1 : 0);
    html += `
      <div class="task-category telegram-category">
        <div class="task-category-header" onclick="window.toggleCategory(${telegramIndex})">
          <div class="category-title">
            <span class="toggle-icon" id="toggle-${telegramIndex}">▶</span>
            💬 Telegram Questions
          </div>
          <div class="category-meta">${telegramQuestions.length} question${telegramQuestions.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="task-category-content" id="content-${telegramIndex}">
          <ul class="task-list">
            ${telegramQuestions.map(q => `
              <li class="task-item ${q.completed ? 'completed' : ''} ${q.is_placeholder ? 'placeholder' : ''}">
                <input
                  type="checkbox"
                  class="task-checkbox"
                  ${q.completed ? 'checked' : ''}
                  onchange="window.handleTelegramToggle('${q.id}')"
                />
                <div class="task-details">
                  <div class="task-name">
                    ${q.question_text}
                    ${q.source ? `<span class="source-badge">${q.source}</span>` : ''}
                    ${q.is_placeholder ? '<span class="placeholder-badge">Placeholder</span>' : ''}
                  </div>
                  <div class="task-meta">
                    <button class="btn btn--sm btn--secondary" onclick="window.editTelegramQuestionFromDaily('${q.id}')">Edit</button>
                    <button class="btn btn--sm btn--outline" onclick="window.deleteTelegramQuestionConfirm('${q.id}')">Delete</button>
                  </div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  if (html === '') {
    html = `
      <div class="empty-state">
        <p>No tasks, SBA tests, or Telegram questions scheduled for this day.</p>
        <div class="empty-state-actions">
          <button onclick="window.showAddTaskModal()" class="btn btn--primary">+ Add Task</button>
          <button onclick="window.showAddTelegramModal()" class="btn btn--secondary">+ Add Telegram Question</button>
          <button onclick="window.showAddSBAScheduleEntry('${dateStr}')" class="btn btn--accent">+ Create SBA for Today</button>
        </div>
        <p class="empty-state-hint">Or use the SBA Tests and Telegram Q tabs to manage items in bulk.</p>
      </div>
    `;
  }

  console.log('[renderDailyView] Generated HTML length:', html.length);
  console.log('[renderDailyView] First 200 chars of HTML:', html.substring(0, 200));
  console.log('[renderDailyView] dailyContent element:', dailyContent);
  dailyContent.innerHTML = html;
  console.log('[renderDailyView] HTML set to DOM, dailyContent.children.length:', dailyContent.children.length);

  // Auto-expand all categories on initial render
  setTimeout(() => {
    document.querySelectorAll('.task-category-content').forEach((content, index) => {
      content.classList.add('expanded');
      const toggle = document.getElementById(`toggle-${index}`);
      if (toggle) toggle.classList.add('expanded');
    });
  }, 10);

  // Load notes
  const notesTextarea = document.getElementById('dailyNotes');
  // Notes will be loaded by the main app
  
  // Render revision resources
  renderRevisionResources();
}

// Render revision resources section
export function renderRevisionResources() {
  const resources = getTemplateRevisionResourcesForWeek(getViewingDate());
  const hasResources = resources.podcasts.length > 0 || resources.summaries.length > 0 || 
                       resources.nice.length > 0 || resources.rrr.length > 0;
  
  const section = document.getElementById('revisionResourcesSection');
  
  if (!section) return;
  
  if (!hasResources) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  
  let html = '';
  
  if (resources.podcasts.length > 0) {
    html += `
      <div class="resource-category">
        <div class="resource-category-title">🎧 GTG Podcasts</div>
        <ul class="resource-list">
          ${resources.podcasts.map(p => `<li class="resource-item">${p}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  if (resources.summaries.length > 0) {
    html += `
      <div class="resource-category">
        <div class="resource-category-title">📄 GTG Summaries</div>
        <ul class="resource-list">
          ${resources.summaries.map(s => `<li class="resource-item">${s}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  if (resources.nice.length > 0) {
    html += `
      <div class="resource-category">
        <div class="resource-category-title">📋 NICE Guidelines</div>
        <ul class="resource-list">
          ${resources.nice.map(n => `<li class="resource-item">${n}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  if (resources.rrr.length > 0) {
    html += `
      <div class="resource-category">
        <div class="resource-category-title">🎥 RRR Session Recordings</div>
        <ul class="resource-list">
          ${resources.rrr.map(r => `<li class="resource-item">${r}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  document.getElementById('revisionResourcesContent').innerHTML = html;
}

// Toggle task category
export function toggleCategory(index) {
  const content = document.getElementById(`content-${index}`);
  const toggle = document.getElementById(`toggle-${index}`);

  if (content.classList.contains('expanded')) {
    content.classList.remove('expanded');
    toggle.classList.remove('expanded');
  } else {
    content.classList.add('expanded');
    toggle.classList.add('expanded');
  }
}

// Change day
export async function changeDay(delta) {
  const viewingDate = getViewingDate();
  viewingDate.setDate(viewingDate.getDate() + delta);
  setViewingDate(viewingDate);
  
  // Save to localStorage
  localStorage.setItem('studyplan-last-date', formatDateISO(viewingDate));
  
  await loadTasksForDateHandler(viewingDate);
  renderDailyView();
  renderRevisionResources();
}

// ==========================================================
// WEEKLY VIEW
// ==========================================================

export async function renderWeeklyView() {
  const weekStart = getWeekStart(getViewingDate());
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    weekDays.push(day);
  }

  const weekEnd = new Date(weekDays[6]);
  document.getElementById('currentWeek').textContent =
    `${formatDateShort(weekStart)} - ${formatDateShort(weekEnd)}`;

  // Load data for entire week with 3 queries instead of 21 (7 days × 3 queries)
  const currentUser = getCurrentUser();
  const startStr = formatDateISO(weekStart);
  const endStr = formatDateISO(weekEnd);
  
  const [tasksByDate, sbaByDate, telegramByDate] = await Promise.all([
    loadTasksForDateRange(currentUser.id, startStr, endStr),
    loadSBAScheduleByDate(currentUser.id, startStr, endStr),
    loadTelegramQuestionsByDate(currentUser.id, startStr, endStr)
  ]);

  const weeklyContent = document.getElementById('weeklyContent');
  weeklyContent.innerHTML = weekDays.map(day => {
    const dateStr = formatDateISO(day);
    const dayName = day.toLocaleDateString('en-GB', { weekday: 'long' });
    
    const categories = tasksByDate[dateStr] || [];
    const sbaEntries = sbaByDate[dateStr] || [];
    const telegramQuestions = telegramByDate[dateStr] || [];
    
    const totalTasks = categories.reduce((sum, cat) => sum + cat.tasks.length, 0);
    const completedTasks = categories.reduce((sum, cat) => 
      sum + cat.tasks.filter(t => t.completed).length, 0);
    const sbaCount = sbaEntries.length;
    const completedSBA = sbaEntries.filter(s => s.completed).length;
    const telegramCount = telegramQuestions.length;
    const completedTelegram = telegramQuestions.filter(q => q.completed).length;

    // Calculate total time for capacity check
    let totalMinutes = 0;
    categories.forEach(cat => {
      cat.tasks.forEach(task => {
        totalMinutes += parseTimeEstimate(task.time_estimate);
      });
    });
    
    // Determine capacity badge
    let capacityBadge = '';
    if (totalMinutes > 360) {
      capacityBadge = '<span class="capacity-badge critical">⚠️ Overload</span>';
    } else if (totalMinutes > 240) {
      capacityBadge = '<span class="capacity-badge warning">⏰ Heavy</span>';
    }

    // Extract topics from tasks
    const topics = [];
    categories.forEach(cat => {
      cat.tasks.forEach(task => {
        if (task.task_name) {
          topics.push(task.task_name);
        }
      });
    });

    // Also add SBA modules if any
    sbaEntries.forEach(sba => {
      if (sba.module_name) {
        topics.push(`${sba.module_name} (SBA)`);
      }
    });

    // Limit to first 5 topics for display
    const displayTopics = topics.slice(0, 5);
    const hasMoreTopics = topics.length > 5;

    return `
      <div class="week-day-card" onclick="window.viewDayFromWeek('${dateStr}')">
        <div class="week-day-header">${dayName}${capacityBadge}</div>
        <div class="week-day-date">${formatDateShort(day)}</div>
        <div class="week-day-info">
          ${totalTasks > 0 ? `
            <div class="week-item">
              📚 Tasks: ${completedTasks}/${totalTasks}
            </div>
          ` : ''}
          ${sbaCount > 0 ? `
            <div class="week-item">
              📋 SBA: ${completedSBA}/${sbaCount}
            </div>
          ` : ''}
          ${telegramCount > 0 ? `
            <div class="week-item">
              💬 Telegram: ${completedTelegram}/${telegramCount}
            </div>
          ` : ''}
          ${totalTasks === 0 && sbaCount === 0 && telegramCount === 0 ? 
            '<div class="week-item-empty">No items scheduled</div>' : ''}
        </div>
        ${displayTopics.length > 0 ? `
          <div class="week-day-topics">
            <strong>Topics:</strong>
            <ul class="topics-list">
              ${displayTopics.map(topic => `<li>${topic}</li>`).join('')}
              ${hasMoreTopics ? `<li class="more-topics">+${topics.length - 5} more...</li>` : ''}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

export async function viewDayFromWeek(dateStr) {
  setViewingDate(new Date(dateStr));
  await loadTasksForDateHandler(getViewingDate());
  switchView('daily');
}

export async function changeWeek(delta) {
  const weekStart = getWeekStart(getViewingDate());
  weekStart.setDate(weekStart.getDate() + (delta * 7));
  setViewingDate(weekStart);
  await renderWeeklyView();
}

// ==========================================================
// CALENDAR VIEW
// ==========================================================

export async function renderCalendarView() {
  const viewMonth = getViewingMonth();
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  document.getElementById('currentMonth').textContent =
    viewMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = lastDay.getDate();

  // Load data for entire month with 3 queries instead of ~90 (30 days × 3 queries)
  const currentUser = getCurrentUser();
  const startStr = formatDateISO(firstDay);
  const endStr = formatDateISO(lastDay);
  
  const [tasksByDate, sbaByDate, telegramByDate] = await Promise.all([
    loadTasksForDateRange(currentUser.id, startStr, endStr),
    loadSBAScheduleByDate(currentUser.id, startStr, endStr),
    loadTelegramQuestionsByDate(currentUser.id, startStr, endStr)
  ]);

  const calendarContent = document.getElementById('calendarContent');
  let html = '';

  // Day headers
  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  dayHeaders.forEach(day => {
    html += `<div class="calendar-day-header">${day}</div>`;
  });

  // Empty cells before month starts
  for (let i = 0; i < startDay; i++) {
    html += '<div class="calendar-day other-month"></div>';
  }

  // Days of the month
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDateISO(date);
    let dayClass = 'calendar-day';

    if (date.toDateString() === today.toDateString()) {
      dayClass += ' today';
    }

    // Add day-type coloring
    const daySchedule = getScheduleForDate(dateStr) || templateDetailedSchedule[dateStr];
    if (daySchedule && daySchedule.type) {
      const typeClassMap = {
        'work': 'work-day',
        'revision': 'revision-day',
        'trip': 'brazil-trip',
        'trip-end': 'brazil-trip',
        'intensive': 'intensive-day',
        'intensive-post': 'intensive-day',
        'light': 'light-day',
        'off': 'light-day',
        'rest': 'rest-day',
        'exam-eve': 'rest-day'
      };
      const typeClass = typeClassMap[daySchedule.type];
      if (typeClass) {
        dayClass += ` ${typeClass}`;
      }
    }

    const categories = tasksByDate[dateStr] || [];
    const sbaEntries = sbaByDate[dateStr] || [];
    const telegramQuestions = telegramByDate[dateStr] || [];
    
    const totalTasks = categories.reduce((sum, cat) => sum + cat.tasks.length, 0);
    const completedTasks = categories.reduce((sum, cat) => 
      sum + cat.tasks.filter(t => t.completed).length, 0);
    const sbaCount = sbaEntries.length;
    const completedSBA = sbaEntries.filter(s => s.completed).length;
    const telegramCount = telegramQuestions.length;
    const completedTelegram = telegramQuestions.filter(q => q.completed).length;

    const hasItems = totalTasks > 0 || sbaCount > 0 || telegramCount > 0;
    
    // Calculate total time for capacity check
    let totalMinutes = 0;
    categories.forEach(cat => {
      cat.tasks.forEach(task => {
        totalMinutes += parseTimeEstimate(task.time_estimate);
      });
    });
    
    // Determine capacity badge
    let capacityClass = '';
    let capacityText = '';
    if (totalMinutes > 360) {
      capacityClass = 'critical-capacity';
      capacityText = '<span class="capacity-badge critical">⚠️</span>';
    } else if (totalMinutes > 240) {
      capacityClass = 'warning-capacity';
      capacityText = '<span class="capacity-badge warning">⏰</span>';
    }

    html += `
      <div class="${dayClass} ${hasItems ? 'has-items' : ''} ${capacityClass}" onclick="window.viewDayFromCalendar('${dateStr}')">
        <div class="calendar-day-number">${day}${capacityText}</div>
        ${hasItems ? `
          <div class="calendar-day-items">
            ${totalTasks > 0 ? `<div class="calendar-indicator">📚 ${completedTasks}/${totalTasks}</div>` : ''}
            ${sbaCount > 0 ? `<div class="calendar-indicator">📋 ${completedSBA}/${sbaCount}</div>` : ''}
            ${telegramCount > 0 ? `<div class="calendar-indicator">💬 ${completedTelegram}/${telegramCount}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  calendarContent.innerHTML = html;
}

export async function viewDayFromCalendar(dateStr) {
  setViewingDate(new Date(dateStr));
  await loadTasksForDateHandler(getViewingDate());
  switchView('daily');
}

export async function changeMonth(delta) {
  const newMonth = new Date(getViewingMonth());
  newMonth.setMonth(newMonth.getMonth() + delta);
  setViewingMonth(newMonth);
  await renderCalendarView();
}

// ==========================================================
// MODULES VIEW
// ==========================================================

export async function renderModulesView() {
  const modulesContent = document.getElementById('modulesContent');
  const currentUser = getCurrentUser();

  // Get stats for each module
  const modulesWithStats = await Promise.all(getModules().map(async (module) => {
    const stats = await getModuleProgressStats(currentUser.id, module.id);
    const progress = calculateModuleProgress(module, stats);
    
    // Get subtopic progress (gracefully handle if table doesn't exist yet)
    let subtopicMap = new Map();
    try {
      const { data: subtopicProgress, error } = await supabase
        .from('subtopic_progress')
        .select('subtopic_name, completed, notes')
        .eq('user_id', currentUser.id)
        .eq('module_id', module.id);
      
      if (error) {
        // If table doesn't exist, just continue without subtopic tracking
        if (error.code === 'PGRST205') {
          console.warn('Subtopic progress table not yet created. Run supabase/04-subtopic-tracking.sql to enable this feature.');
        } else {
          console.error('Error loading subtopic progress:', error);
        }
      } else {
        (subtopicProgress || []).forEach(sp => {
          subtopicMap.set(sp.subtopic_name, sp);
        });
      }
    } catch (err) {
      console.warn('Subtopic tracking not available:', err.message);
    }
    
    return { ...module, ...progress, subtopicMap };
  }));

  modulesContent.innerHTML = modulesWithStats.map(module => {
    return `
      <div class="module-card">
        <div class="module-header">
          <div class="module-name">${module.name}</div>
          <div class="module-weight">${module.exam_weight}% of exam</div>
        </div>
        <div class="module-progress">
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${module.combinedProgress}%; background-color: ${module.color};"></div>
          </div>
          <div class="progress-text">
            <span>${module.combinedProgress}% complete</span>
            <span>${module.completed}/${module.subtopics} subtopics checked</span>
          </div>
          ${module.totalTasks > 0 || module.placeholders > 0 ? `
            <div class="module-task-stats">
              <span>📚 ${module.completedTasks}/${module.totalTasks} daily tasks (${module.taskProgress}%)</span>
              ${module.placeholders > 0 ? `<span class="placeholder-count">(${module.placeholders} placeholders)</span>` : ''}
            </div>
          ` : ''}
        </div>
        <div class="module-subtopics">
          <div class="subtopics-header">
            <strong>Subtopics:</strong>
            <button class="btn btn--xs btn--outline" onclick="toggleSubtopicList('${module.id}')">
              <span id="toggle-subtopics-${module.id}">▼ Show All</span>
            </button>
          </div>
          <div class="subtopics-list collapsed" id="subtopics-${module.id}">
            ${module.subtopics_list.map((subtopic, index) => {
              const progress = module.subtopicMap.get(subtopic);
              const isCompleted = progress && progress.completed;
              return `
                <label class="subtopic-checkbox-label">
                  <input 
                    type="checkbox" 
                    class="subtopic-checkbox"
                    ${isCompleted ? 'checked' : ''}
                    onchange="toggleSubtopicCompletion('${module.id}', '${subtopic.replace(/'/g, "\\'")}', this.checked)"
                  />
                  <span class="${isCompleted ? 'completed' : ''}">${subtopic}</span>
                  ${progress && progress.notes ? `<span class="subtopic-notes" title="${progress.notes}">📝</span>` : ''}
                </label>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================
// SBA VIEW (simplified - full implementation would be much longer)
// ==========================================================

export async function renderSBAView() {
  const sbaTestsList = document.getElementById('sbaTestsList');
  const currentUser = getCurrentUser();
  const tests = await loadSBATests(currentUser.id);
  
  if (tests.length === 0) {
    sbaTestsList.innerHTML = `
      <div class="empty-state">
        <p>No SBA tests defined yet.</p>
        <button onclick="window.showAddSBAModal()" class="btn btn--primary">+ Add Your First SBA Test</button>
      </div>
    `;
  } else {
    sbaTestsList.innerHTML = tests.map(test => `
      <div class="sba-test-card">
        <div class="sba-test-header">
          <div class="sba-test-name">${test.name}</div>
          <div class="sba-test-actions">
            <button class="btn btn--sm btn--secondary" onclick="window.editSBATest('${test.id}')">Edit</button>
            <button class="btn btn--sm btn--outline" onclick="window.deleteSBATestConfirm('${test.id}')">Delete</button>
          </div>
        </div>
        <div class="sba-test-meta">
          <span>📊 ${test.total_days} days</span>
          <span>⏱ ${test.avg_time}/day</span>
          <span>📖 ${test.reading_time} reading</span>
        </div>
        <div class="sba-test-progress">
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${Math.round((test.completed / test.total_days) * 100)}%;"></div>
          </div>
          <div class="progress-text">
            <span>${test.completed}/${test.total_days} completed (${Math.round((test.completed / test.total_days) * 100)}%)</span>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  await updateSBAHeaderStatsHandler();
}

// Show Add SBA Schedule Entry with pre-filled date
export async function showAddSBAScheduleEntry(date) {
  // For now, just show the add telegram modal with today's date pre-filled
  // In a full implementation, we'd have a dedicated SBA schedule entry modal
  const today = date || formatDateISO(new Date());
  showInfo(`SBA schedule entry creation for ${today} - Use the SBA Tests view to add entries for specific dates.`);
}

// Show Add SBA Modal
export function showAddSBAModal() {
  const modal = document.getElementById('addSBAModal');
  document.getElementById('sbaModalTitle').textContent = 'Add SBA Test';
  document.getElementById('sbaEditId').value = '';
  document.getElementById('sbaTestKey').value = '';
  document.getElementById('sbaName').value = '';
  document.getElementById('sbaTotalDays').value = '';
  document.getElementById('sbaReadingTime').value = '';
  document.getElementById('sbaAvgTime').value = '';
  
  // Enable test key field for new tests
  document.getElementById('sbaTestKey').disabled = false;
  
  openModal(modal);
  
  // Setup form submission if not already set
  const form = document.getElementById('sbaForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    await saveSBATest();
  };
}

// Close SBA Modal
export function closeSBAModal() {
  const modal = document.getElementById('addSBAModal');
  closeModal(modal);
}

// Save SBA Test (create or update)
export async function saveSBATest() {
  const editId = document.getElementById('sbaEditId').value;
  const testKey = document.getElementById('sbaTestKey').value.trim();
  const name = document.getElementById('sbaName').value.trim();
  const totalDays = parseInt(document.getElementById('sbaTotalDays').value);
  const readingTime = document.getElementById('sbaReadingTime').value.trim();
  const avgTime = document.getElementById('sbaAvgTime').value.trim();
  
  // Validation
  if (!testKey || !name || !totalDays || !readingTime || !avgTime) {
    showError('All fields are required');
    return;
  }
  
  if (totalDays <= 0) {
    showError('Total days must be greater than 0');
    return;
  }
  
  const currentUser = getCurrentUser();
  
  try {
    showLoading(true);
    
    if (editId) {
      // Update existing test
      await updateSBATest(editId, {
        name,
        total_days: totalDays,
        reading_time: readingTime,
        avg_time: avgTime
      });
      showSuccess('SBA test updated successfully!');
    } else {
      // Create new test
      await createSBATest(currentUser.id, {
        test_key: testKey,
        name,
        total_days: totalDays,
        reading_time: readingTime,
        avg_time: avgTime
      });
      showSuccess('SBA test added successfully!');
    }
    
    closeSBAModal();
    await renderSBAView();
    showLoading(false);
  } catch (error) {
    console.error('Error saving SBA test:', error);
    showError('Failed to save SBA test: ' + error.message);
    showLoading(false);
  }
}

// Edit SBA Test
export async function editSBATest(testId) {
  const currentUser = getCurrentUser();
  const tests = await loadSBATests(currentUser.id);
  const test = tests.find(t => t.id === testId);
  
  if (!test) {
    showError('Test not found');
    return;
  }
  
  const modal = document.getElementById('addSBAModal');
  document.getElementById('sbaModalTitle').textContent = 'Edit SBA Test';
  document.getElementById('sbaEditId').value = test.id;
  document.getElementById('sbaTestKey').value = test.test_key;
  document.getElementById('sbaName').value = test.name;
  document.getElementById('sbaTotalDays').value = test.total_days;
  document.getElementById('sbaReadingTime').value = test.reading_time;
  document.getElementById('sbaAvgTime').value = test.avg_time;
  
  // Disable test key field when editing
  document.getElementById('sbaTestKey').disabled = true;
  
  openModal(modal);
  
  // Setup form submission if not already set
  const form = document.getElementById('sbaForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    await saveSBATest();
  };
}

// Delete SBA Test with confirmation
export async function deleteSBATestConfirm(testId) {
  showConfirm('Are you sure you want to delete this SBA test? This will not delete associated schedule entries.', async () => {
    try {
      showLoading(true);
      await deleteSBATest(testId);
      await renderSBAView();
      showSuccess('SBA test deleted successfully!');
      showLoading(false);
    } catch (error) {
      showError('Failed to delete SBA test: ' + error.message);
      showLoading(false);
    }
  });
}

// Show SBA Bulk Upload Modal
export function showSBABulkUploadModal() {
  const modal = document.getElementById('bulkUploadModal');
  document.getElementById('bulkUploadTitle').textContent = 'SBA Bulk Upload';
  document.getElementById('bulkUploadType').value = 'sba';
  document.getElementById('bulkUploadJSON').value = '';
  document.getElementById('bulkUploadResult').innerHTML = '';
  
  modal.style.display = 'flex';
  
  // Setup process button
  const processBtn = modal.querySelector('button[onclick="processBulkUpload()"]');
  if (processBtn) {
    processBtn.onclick = () => processSBABulkUpload();
  }
}

// Process SBA Bulk Upload
async function processSBABulkUpload() {
  const jsonText = document.getElementById('bulkUploadJSON').value.trim();
  const resultDiv = document.getElementById('bulkUploadResult');
  
  if (!jsonText) {
    showError('Please enter JSON data');
    return;
  }
  
  try {
    const jsonData = JSON.parse(jsonText);
    const validation = validateSBABulkUpload(jsonData);
    
    // Show preview
    resultDiv.innerHTML = `
      <div class="bulk-upload-summary ${validation.valid ? 'success' : 'error'}">
        <h4>Validation Results</h4>
        <p><strong>Total:</strong> ${validation.summary.total} entries</p>
        <p><strong>✓ Valid:</strong> ${validation.summary.valid}</p>
        <p><strong>✗ Errors:</strong> ${validation.summary.errors}</p>
        ${validation.summary.duplicates > 0 ? `<p class="warning-text"><strong>⚠ Duplicates:</strong> ${validation.summary.duplicates} duplicate rows detected</p>` : ''}
      </div>
      ${validation.preview.length > 0 ? `
        <div class="bulk-upload-preview">
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 8px; text-align: left;">Row</th>
                <th style="padding: 8px; text-align: left;">Date</th>
                <th style="padding: 8px; text-align: left;">SBA Name</th>
                <th style="padding: 8px; text-align: left;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${validation.preview.map(row => `
                <tr style="border-bottom: 1px solid #eee; ${row.valid ? '' : 'background: #fff3f3;'}${row.isDuplicate ? ' background: #fff9e6;' : ''}">
                  <td style="padding: 8px;">${row.rowNum}</td>
                  <td style="padding: 8px;">${row.data.date || '—'}</td>
                  <td style="padding: 8px;">${row.data.sba_name || '—'}</td>
                  <td style="padding: 8px;">
                    ${row.valid ? 
                      '<span style="color: green;">✓</span>' : 
                      `<span style="color: red;">✗ ${row.errors.join(', ')}</span>`
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
    `;
    
    if (!validation.valid) {
      showError('Please fix validation errors before uploading');
      return;
    }
    
    // Confirm upload
    const confirmed = await new Promise(resolve => {
      showConfirm(`Upload ${validation.summary.valid} SBA schedule entries?`, () => resolve(true));
      // If they cancel, resolve to false after 100ms
      setTimeout(() => resolve(false), 100);
    });
    
    if (!confirmed) return;
    
    // Perform upload
    showLoading(true);
    const currentUser = getCurrentUser();
    await bulkUploadSBA(currentUser.id, jsonData);
    
    closeBulkUploadModal();
    showSuccess(`Successfully uploaded ${validation.summary.valid} SBA entries!`);
    showLoading(false);
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      showError('Invalid JSON format: ' + error.message);
      resultDiv.innerHTML = `<div class="bulk-upload-summary error"><p>Invalid JSON: ${error.message}</p></div>`;
    } else {
      console.error('Error processing bulk upload:', error);
      showError('Failed to upload: ' + error.message);
    }
    showLoading(false);
  }
}

// Close Bulk Upload Modal
function closeBulkUploadModal() {
  document.getElementById('bulkUploadModal').style.display = 'none';
}

// Show Telegram Bulk Upload Modal (wire it up)
export function showTelegramBulkUploadModal() {
  const modal = document.getElementById('bulkUploadModal');
  document.getElementById('bulkUploadTitle').textContent = 'Telegram Bulk Upload';
  document.getElementById('bulkUploadType').value = 'telegram';
  document.getElementById('bulkUploadJSON').value = '';
  document.getElementById('bulkUploadResult').innerHTML = '';
  
  modal.style.display = 'flex';
  
  // Setup process button
  const processBtn = modal.querySelector('button[onclick="processBulkUpload()"]');
  if (processBtn) {
    processBtn.onclick = () => processTelegramBulkUpload();
  }
}

// Process Telegram Bulk Upload
async function processTelegramBulkUpload() {
  const jsonText = document.getElementById('bulkUploadJSON').value.trim();
  const resultDiv = document.getElementById('bulkUploadResult');
  
  if (!jsonText) {
    showError('Please enter JSON data');
    return;
  }
  
  try {
    const jsonData = JSON.parse(jsonText);
    const validation = validateTelegramBulkUpload(jsonData);
    
    // Show preview
    resultDiv.innerHTML = `
      <div class="bulk-upload-summary ${validation.valid ? 'success' : 'error'}">
        <h4>Validation Results</h4>
        <p><strong>Total:</strong> ${validation.summary.total} entries</p>
        <p><strong>✓ Valid:</strong> ${validation.summary.valid}</p>
        <p><strong>✗ Errors:</strong> ${validation.summary.errors}</p>
        ${validation.summary.duplicates > 0 ? `<p class="warning-text"><strong>⚠ Duplicates:</strong> ${validation.summary.duplicates} duplicate rows detected</p>` : ''}
      </div>
      ${validation.preview.length > 0 ? `
        <div class="bulk-upload-preview">
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 8px; text-align: left;">Row</th>
                <th style="padding: 8px; text-align: left;">Date</th>
                <th style="padding: 8px; text-align: left;">Question</th>
                <th style="padding: 8px; text-align: left;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${validation.preview.map(row => `
                <tr style="border-bottom: 1px solid #eee; ${row.valid ? '' : 'background: #fff3f3;'}${row.isDuplicate ? ' background: #fff9e6;' : ''}">
                  <td style="padding: 8px;">${row.rowNum}</td>
                  <td style="padding: 8px;">${row.data.date || '—'}</td>
                  <td style="padding: 8px;">${row.data.question_text ? row.data.question_text.substring(0, 50) + '...' : '—'}</td>
                  <td style="padding: 8px;">
                    ${row.valid ? 
                      '<span style="color: green;">✓</span>' : 
                      `<span style="color: red;">✗ ${row.errors.join(', ')}</span>`
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
    `;
    
    if (!validation.valid) {
      showError('Please fix validation errors before uploading');
      return;
    }
    
    // Confirm upload
    const confirmed = await new Promise(resolve => {
      showConfirm(`Upload ${validation.summary.valid} telegram questions?`, () => resolve(true));
      setTimeout(() => resolve(false), 100);
    });
    
    if (!confirmed) return;
    
    // Perform upload
    showLoading(true);
    const currentUser = getCurrentUser();
    await bulkUploadTelegramQuestions(currentUser.id, jsonData);
    
    closeBulkUploadModal();
    showSuccess(`Successfully uploaded ${validation.summary.valid} telegram questions!`);
    showLoading(false);
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      showError('Invalid JSON format: ' + error.message);
      resultDiv.innerHTML = `<div class="bulk-upload-summary error"><p>Invalid JSON: ${error.message}</p></div>`;
    } else {
      console.error('Error processing bulk upload:', error);
      showError('Failed to upload: ' + error.message);
    }
    showLoading(false);
  }
}

// Show SBA Placeholder Modal
export function showSBAPlaceholderModal() {
  openPlaceholderModal('sba');
}

// Show Telegram Placeholder Modal
export function showTelegramPlaceholderModal() {
  openPlaceholderModal('telegram');
}

// State for placeholder modal
let placeholderModalState = {
  type: null, // 'sba' or 'telegram'
  selectedDates: new Set(),
  excludeWeekends: true
};

// Open placeholder modal for a given type
function openPlaceholderModal(type) {
  placeholderModalState.type = type;
  placeholderModalState.selectedDates.clear();
  placeholderModalState.excludeWeekends = true;
  
  const modal = document.getElementById('placeholderModal');
  const excludeWeekendsCheckbox = document.getElementById('excludeWeekends');
  
  excludeWeekendsCheckbox.checked = true;
  
  // Render calendar
  renderPlaceholderCalendar();
  
  openModal(modal);
  
  // Add event listener for weekend exclusion toggle
  excludeWeekendsCheckbox.addEventListener('change', (e) => {
    placeholderModalState.excludeWeekends = e.target.checked;
    renderPlaceholderCalendar();
  });
}

// Close placeholder modal
export function closePlaceholderModal() {
  const modal = document.getElementById('placeholderModal');
  closeModal(modal);
  placeholderModalState.selectedDates.clear();
}

// Render placeholder calendar (similar to calendar view but for selection)
function renderPlaceholderCalendar() {
  const calendarDiv = document.getElementById('placeholderCalendar');
  if (!calendarDiv) return;
  
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(1); // First day of current month
  
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + 3); // Show 3 months ahead
  
  let html = '';
  let currentMonth = startDate.getMonth();
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (currentDate.getMonth() !== currentMonth) {
      currentMonth = currentDate.getMonth();
    }
    
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    html += `<div class="placeholder-month"><h4>${monthName}</h4><div class="placeholder-days">`;
    
    // Days of the week header
    html += '<div class="placeholder-day-header">Sun</div>';
    html += '<div class="placeholder-day-header">Mon</div>';
    html += '<div class="placeholder-day-header">Tue</div>';
    html += '<div class="placeholder-day-header">Wed</div>';
    html += '<div class="placeholder-day-header">Thu</div>';
    html += '<div class="placeholder-day-header">Fri</div>';
    html += '<div class="placeholder-day-header">Sat</div>';
    
    // Padding days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const paddingDays = firstDay.getDay();
    for (let i = 0; i < paddingDays; i++) {
      html += '<div class="placeholder-day empty"></div>';
    }
    
    // Days in month
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayStr = formatDateISO(dayDate);
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
      const isPast = dayDate < today;
      const isSelected = placeholderModalState.selectedDates.has(dayStr);
      const isDisabled = (placeholderModalState.excludeWeekends && isWeekend) || isPast;
      
      let dayClass = 'placeholder-day';
      if (isSelected) dayClass += ' selected';
      if (isDisabled) dayClass += ' disabled';
      if (isWeekend) dayClass += ' weekend';
      if (isPast) dayClass += ' past';
      
      html += `<div class="${dayClass}" data-date="${dayStr}" onclick="togglePlaceholderDate('${dayStr}')">
        ${day}
      </div>`;
    }
    
    html += '</div></div>';
    
    // Move to next month
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }
  
  calendarDiv.innerHTML = html;
  updateSelectedDatesDisplay();
}

// Toggle date selection
window.togglePlaceholderDate = function(dateStr) {
  const dayEl = document.querySelector(`[data-date="${dateStr}"]`);
  if (dayEl && !dayEl.classList.contains('disabled')) {
    if (placeholderModalState.selectedDates.has(dateStr)) {
      placeholderModalState.selectedDates.delete(dateStr);
      dayEl.classList.remove('selected');
    } else {
      placeholderModalState.selectedDates.add(dateStr);
      dayEl.classList.add('selected');
    }
    updateSelectedDatesDisplay();
  }
};

// Update selected dates display
function updateSelectedDatesDisplay() {
  const countEl = document.getElementById('selectedDatesCount');
  if (countEl) {
    countEl.textContent = placeholderModalState.selectedDates.size;
  }
}

// Create placeholders from modal
window.createPlaceholdersFromModal = async function() {
  if (placeholderModalState.selectedDates.size === 0) {
    showError('Please select at least one date');
    return;
  }
  
  try {
    showLoading(true);
    const userId = appState.user.id;
    const dates = Array.from(placeholderModalState.selectedDates);
    
    let data = {};
    if (placeholderModalState.type === 'sba') {
      data = { sba_name: 'TBD' };
    } else if (placeholderModalState.type === 'telegram') {
      data = { question_text: 'Placeholder - to be added', source: null };
    }
    
    const results = await createPlaceholders(userId, dates, placeholderModalState.type, data);
    
    showSuccess(`Created ${results.length} placeholder(s)`);
    closePlaceholderModal();
    
    // Reload the relevant view
    if (placeholderModalState.type === 'sba') {
      await loadSBAScheduleView();
    } else if (placeholderModalState.type === 'telegram') {
      await loadTelegramQuestionsView();
    }
    
    showLoading(false);
  } catch (error) {
    showError('Failed to create placeholders: ' + error.message);
    showLoading(false);
  }
};

// Load SBA Schedule View
export async function loadSBAScheduleView() {
  const startDateInput = document.getElementById('sbaScheduleStartDate');
  const endDateInput = document.getElementById('sbaScheduleEndDate');
  
  if (!startDateInput.value || !endDateInput.value) {
    showWarning('Please select both start and end dates');
    return;
  }
  
  const currentUser = getCurrentUser();
  const schedule = await loadSBASchedule(currentUser.id, startDateInput.value, endDateInput.value);
  
  const contentEl = document.getElementById('sbaScheduleContent');
  
  if (schedule.length === 0) {
    contentEl.innerHTML = '<p class="empty-state">No SBA schedule entries for the selected date range.</p>';
    return;
  }
  
  // Group by date
  const byDate = {};
  schedule.forEach(entry => {
    if (!byDate[entry.date]) {
      byDate[entry.date] = [];
    }
    byDate[entry.date].push(entry);
  });
  
  contentEl.innerHTML = Object.keys(byDate).sort().map(date => {
    const entries = byDate[date];
    return `
      <div class="sba-schedule-day">
        <div class="sba-schedule-date">${new Date(date).toLocaleDateString('en-GB', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        })}</div>
        <div class="sba-schedule-entries">
          ${entries.map(entry => `
            <div class="sba-schedule-entry ${entry.completed ? 'completed' : ''}">
              <input
                type="checkbox"
                ${entry.completed ? 'checked' : ''}
                onchange="window.handleSBAScheduleToggle('${entry.id}')"
              />
              <span class="sba-schedule-name">${entry.sba_name}</span>
              ${entry.is_placeholder ? '<span class="placeholder-badge">Placeholder</span>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================
// TELEGRAM VIEW (simplified)
// ==========================================================

export async function renderTelegramView() {
  const contentEl = document.getElementById('telegramQuestionsContent');
  contentEl.innerHTML = `
    <div class="empty-state">
      <p>Click "Filter" to load telegram questions, or add your first question.</p>
      <button onclick="window.showAddTelegramModal()" class="btn btn--primary">+ Add Telegram Question</button>
    </div>
  `;
  await updateTelegramHeaderStatsHandler();
}

// Show Add Telegram Modal
export function showAddTelegramModal() {
  const modal = document.getElementById('addTelegramModal');
  const today = new Date().toISOString().split('T')[0];
  
  document.getElementById('telegramModalTitle').textContent = 'Add Telegram Question';
  document.getElementById('telegramEditId').value = '';
  document.getElementById('telegramQuestionDate').value = today;
  document.getElementById('telegramQuestionText').value = '';
  document.getElementById('telegramQuestionSource').value = '';
  
  openModal(modal);
  
  // Setup form submission if not already set
  const form = document.getElementById('telegramForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    await saveTelegramQuestion();
  };
}

// Close Telegram Modal
export function closeTelegramModal() {
  const modal = document.getElementById('addTelegramModal');
  closeModal(modal);
}

// Save Telegram Question (create or update)
export async function saveTelegramQuestion() {
  const editId = document.getElementById('telegramEditId').value;
  const date = document.getElementById('telegramQuestionDate').value;
  const questionText = document.getElementById('telegramQuestionText').value.trim();
  const source = document.getElementById('telegramQuestionSource').value.trim();
  
  // Validation
  if (!date || !questionText) {
    showError('Date and question text are required');
    return;
  }
  
  const currentUser = getCurrentUser();
  
  try {
    showLoading(true);
    
    if (editId) {
      // Update existing question
      await updateTelegramQuestion(editId, {
        date,
        question_text: questionText,
        source: source || null
      });
      showSuccess('Telegram question updated successfully!');
    } else {
      // Create new question
      await createTelegramQuestion(currentUser.id, {
        date,
        question_text: questionText,
        source: source || null
      });
      showSuccess('Telegram question added successfully!');
    }
    
    closeTelegramModal();
    
    // Reload the telegram view with current filters
    const startDate = document.getElementById('telegramStartDate').value;
    const endDate = document.getElementById('telegramEndDate').value;
    if (startDate && endDate) {
      await loadTelegramQuestionsView();
    }
    
    // If we're in daily view and the question was for viewing date, reload
    const viewingDate = getViewingDate();
    const dateStr = formatDateISO(viewingDate);
    if (date === dateStr) {
      await loadTasksForDateHandler(viewingDate);
      renderDailyView();
    }
    
    await updateTelegramHeaderStatsHandler();
    showLoading(false);
  } catch (error) {
    console.error('Error saving telegram question:', error);
    showError('Failed to save telegram question: ' + error.message);
    showLoading(false);
  }
}

// Edit Telegram Question
export async function editTelegramQuestion(questionId) {
  const currentUser = getCurrentUser();
  
  try {
    // Load question data - we'll need to search across dates
    const { data: question, error } = await supabase
      .from('telegram_questions')
      .select('*')
      .eq('id', questionId)
      .single();
    
    if (error) throw error;
    
    if (!question) {
      showError('Question not found');
      return;
    }
    
    const modal = document.getElementById('addTelegramModal');
    document.getElementById('telegramModalTitle').textContent = 'Edit Telegram Question';
    document.getElementById('telegramEditId').value = question.id;
    document.getElementById('telegramQuestionDate').value = question.date;
    document.getElementById('telegramQuestionText').value = question.question_text;
    document.getElementById('telegramQuestionSource').value = question.source || '';
    
    openModal(modal);
    
    // Setup form submission if not already set
    const form = document.getElementById('telegramForm');
    form.onsubmit = async (e) => {
      e.preventDefault();
      await saveTelegramQuestion();
    };
  } catch (error) {
    console.error('Error loading telegram question:', error);
    showError('Failed to load telegram question: ' + error.message);
  }
}

// Load Telegram Questions View with filters
export async function loadTelegramQuestionsView() {
  const startDateInput = document.getElementById('telegramStartDate');
  const endDateInput = document.getElementById('telegramEndDate');
  const sourceFilter = document.getElementById('telegramSourceFilter').value;
  const statusFilter = document.getElementById('telegramStatusFilter').value;
  
  if (!startDateInput.value || !endDateInput.value) {
    showWarning('Please select both start and end dates');
    return;
  }
  
  const currentUser = getCurrentUser();
  
  try {
    showLoading(true);
    
    // Load all questions in the date range
    let questions = await loadTelegramQuestions(currentUser.id, startDateInput.value, endDateInput.value);
    
    // Apply filters
    if (sourceFilter) {
      questions = questions.filter(q => q.source === sourceFilter);
    }
    
    if (statusFilter) {
      if (statusFilter === 'completed') {
        questions = questions.filter(q => q.completed);
      } else if (statusFilter === 'pending') {
        questions = questions.filter(q => !q.completed);
      }
    }
    
    const contentEl = document.getElementById('telegramQuestionsContent');
    
    if (questions.length === 0) {
      contentEl.innerHTML = `
        <div class="empty-state">
          <p>No telegram questions found for the selected filters.</p>
          <button onclick="window.showAddTelegramModal()" class="btn btn--primary">+ Add Telegram Question</button>
        </div>
      `;
      showLoading(false);
      return;
    }
    
    // Group by date
    const byDate = {};
    questions.forEach(q => {
      if (!byDate[q.date]) {
        byDate[q.date] = [];
      }
      byDate[q.date].push(q);
    });
    
    contentEl.innerHTML = `
      <div class="telegram-results-header">
        <h3>Found ${questions.length} question${questions.length !== 1 ? 's' : ''}</h3>
        <div class="telegram-stats">
          <span>✅ ${questions.filter(q => q.completed).length} completed</span>
          <span>⏳ ${questions.filter(q => !q.completed).length} pending</span>
        </div>
      </div>
      ${Object.keys(byDate).sort().map(date => {
        const dateQuestions = byDate[date];
        return `
          <div class="telegram-day-group">
            <div class="telegram-day-header">${new Date(date).toLocaleDateString('en-GB', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}</div>
            <div class="telegram-questions-list">
              ${dateQuestions.map(q => `
                <div class="telegram-question-card ${q.completed ? 'completed' : ''}">
                  <div class="telegram-question-header">
                    <input
                      type="checkbox"
                      ${q.completed ? 'checked' : ''}
                      onchange="window.handleTelegramToggle('${q.id}')"
                    />
                    <div class="telegram-question-content">
                      <div class="telegram-question-text">${q.question_text}</div>
                      ${q.source ? `<div class="telegram-question-source">📱 ${q.source}</div>` : ''}
                      ${q.is_placeholder ? '<span class="placeholder-badge">Placeholder</span>' : ''}
                    </div>
                  </div>
                  <div class="telegram-question-actions">
                    <button class="btn btn--sm btn--secondary" onclick="window.editTelegramQuestion('${q.id}')">Edit</button>
                    <button class="btn btn--sm btn--outline" onclick="window.deleteTelegramQuestionConfirm('${q.id}')">Delete</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    `;
    
    showLoading(false);
  } catch (error) {
    console.error('Error loading telegram questions:', error);
    showError('Failed to load telegram questions: ' + error.message);
    showLoading(false);
  }
}

// ==========================================================
// MODALS AND SETTINGS
// ==========================================================

export function showSettingsModal() {
  if (!getUserSettings()) return;

  document.getElementById('settingsExamDate').value = getUserSettings().exam_date;
  document.getElementById('settingsTripStart').value = getUserSettings().brazil_trip_start || '';
  document.getElementById('settingsTripEnd').value = getUserSettings().brazil_trip_end || '';

  const modal = document.getElementById('settingsModal');
  openModal(modal);
}

export function closeSettingsModal() {
  const modal = document.getElementById('settingsModal');
  closeModal(modal);
}

export function showAddModuleModal() {
  showInfo('Add module functionality coming soon!');
}

// ==========================================================
// TASK CRUD FUNCTIONS
// ==========================================================

// Show Add Task Modal
export async function showAddTaskModal() {
  const modal = document.getElementById('addTaskModal');
  const viewingDate = getViewingDate();
  const dateStr = formatDateISO(viewingDate);
  
  document.getElementById('taskModalTitle').textContent = 'Add Task';
  document.getElementById('taskEditId').value = '';
  document.getElementById('taskCategoryId').value = '';
  document.getElementById('taskDate').value = dateStr;
  document.getElementById('taskName').value = '';
  document.getElementById('taskTime').value = '';
  document.getElementById('taskWorkSuitable').checked = false;
  
  // Populate category dropdown with existing categories for this date
  const categories = getTasksForDate(dateStr);
  const categorySelect = document.getElementById('taskCategorySelect');
  categorySelect.innerHTML = `
    <option value="">Select category...</option>
    <option value="__new__">+ Create New Category</option>
    ${categories.map(cat => `<option value="${cat.id}">${cat.category_name}</option>`).join('')}
  `;
  
  // Populate module dropdown
  const modules = getModules();
  const moduleSelect = document.getElementById('taskModule');
  moduleSelect.innerHTML = `
    <option value="">Select module...</option>
    ${modules.map(mod => `<option value="${mod.id}">${mod.name}</option>`).join('')}
  `;
  
  // Hide new category fields initially
  document.getElementById('newCategoryGroup').style.display = 'none';
  document.getElementById('categoryTimeGroup').style.display = 'none';
  
  // Setup category select change handler
  categorySelect.onchange = () => {
    const isNewCategory = categorySelect.value === '__new__';
    document.getElementById('newCategoryGroup').style.display = isNewCategory ? 'block' : 'none';
    document.getElementById('categoryTimeGroup').style.display = isNewCategory ? 'block' : 'none';
  };
  
  openModal(modal);
  
  // Setup form submission
  const form = document.getElementById('taskForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    await saveTask();
  };
}

// Close Task Modal
export function closeTaskModal() {
  const modal = document.getElementById('addTaskModal');
  closeModal(modal);
}

// Save Task (create or update)
export async function saveTask() {
  const editId = document.getElementById('taskEditId').value;
  const categorySelect = document.getElementById('taskCategorySelect');
  const categoryId = categorySelect.value;
  const date = document.getElementById('taskDate').value;
  const taskName = document.getElementById('taskName').value.trim();
  const taskTime = document.getElementById('taskTime').value.trim();
  const moduleId = document.getElementById('taskModule').value || null;
  const workSuitable = document.getElementById('taskWorkSuitable').checked;
  
  // Validation
  if (!date || !taskName || !taskTime) {
    showError('Date, task name, and time estimate are required');
    return;
  }
  
  if (!categoryId) {
    showError('Please select a category');
    return;
  }
  
  const currentUser = getCurrentUser();
  
  try {
    showLoading(true);
    
    let finalCategoryId = categoryId;
    
    // Create new category if needed
    if (categoryId === '__new__') {
      const newCategoryName = document.getElementById('newCategoryName').value.trim();
      const newCategoryTime = document.getElementById('newCategoryTime').value.trim();
      
      if (!newCategoryName || !newCategoryTime) {
        showError('New category name and time estimate are required');
        showLoading(false);
        return;
      }
      
      const newCategory = await createTaskCategory(currentUser.id, {
        date,
        category_name: newCategoryName,
        time_estimate: newCategoryTime,
        sort_order: 0
      });
      
      finalCategoryId = newCategory.id;
    }
    
    if (editId) {
      // Update existing task
      await updateTask(editId, {
        category_id: finalCategoryId,
        module_id: moduleId,
        date,
        task_name: taskName,
        time_estimate: taskTime,
        work_suitable: workSuitable
      });
      showSuccess('Task updated successfully!');
    } else {
      // Create new task
      await createTask(currentUser.id, {
        category_id: finalCategoryId,
        module_id: moduleId,
        date,
        task_name: taskName,
        time_estimate: taskTime,
        work_suitable: workSuitable
      });
      showSuccess('Task added successfully!');
    }
    
    closeTaskModal();
    
    // Reload tasks for the date
    await loadTasksForDateHandler(new Date(date));
    renderDailyView();
    updateHeaderStats();
    showLoading(false);
  } catch (error) {
    console.error('Error saving task:', error);
    showError('Failed to save task: ' + error.message);
    showLoading(false);
  }
}

// Edit Task
export async function editTask(taskId) {
  try {
    // Load task data
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();
    
    if (error) throw error;
    
    if (!task) {
      showError('Task not found');
      return;
    }
    
    const modal = document.getElementById('addTaskModal');
    document.getElementById('taskModalTitle').textContent = 'Edit Task';
    document.getElementById('taskEditId').value = task.id;
    document.getElementById('taskCategoryId').value = task.category_id;
    document.getElementById('taskDate').value = task.date;
    document.getElementById('taskName').value = task.task_name;
    document.getElementById('taskTime').value = task.time_estimate;
    document.getElementById('taskWorkSuitable').checked = task.work_suitable;
    
    // Populate category dropdown
    const categories = getTasksForDate(task.date);
    const categorySelect = document.getElementById('taskCategorySelect');
    categorySelect.innerHTML = `
      <option value="">Select category...</option>
      <option value="__new__">+ Create New Category</option>
      ${categories.map(cat => `<option value="${cat.id}" ${cat.id === task.category_id ? 'selected' : ''}>${cat.category_name}</option>`).join('')}
    `;
    
    // Populate module dropdown
    const modules = getModules();
    const moduleSelect = document.getElementById('taskModule');
    moduleSelect.innerHTML = `
      <option value="">Select module...</option>
      ${modules.map(mod => `<option value="${mod.id}" ${mod.id === task.module_id ? 'selected' : ''}>${mod.name}</option>`).join('')}
    `;
    
    // Hide new category fields
    document.getElementById('newCategoryGroup').style.display = 'none';
    document.getElementById('categoryTimeGroup').style.display = 'none';
    
    // Setup category select change handler
    categorySelect.onchange = () => {
      const isNewCategory = categorySelect.value === '__new__';
      document.getElementById('newCategoryGroup').style.display = isNewCategory ? 'block' : 'none';
      document.getElementById('categoryTimeGroup').style.display = isNewCategory ? 'block' : 'none';
    };
    
    openModal(modal);
    
    // Setup form submission
    const form = document.getElementById('taskForm');
    form.onsubmit = async (e) => {
      e.preventDefault();
      await saveTask();
    };
  } catch (error) {
    console.error('Error loading task:', error);
    showError('Failed to load task: ' + error.message);
  }
}

// Delete Task with confirmation
export async function deleteTaskConfirm(taskId) {
  showConfirm('Are you sure you want to delete this task?', async () => {
    try {
      showLoading(true);
      
      // Store task data before deletion for undo
      const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
      
      if (fetchError) throw fetchError;
      
      await deleteTask(taskId);
      await loadTasksForDateHandler(getViewingDate());
      renderDailyView();
      updateHeaderStats();
      showLoading(false);
      
      // Show undo toast
      showToastWithAction(
        'Task deleted',
        'Undo',
        async () => {
          // Re-insert the task
          const { error: insertError } = await supabase
            .from('tasks')
            .insert([task]);
          
          if (insertError) {
            showError('Failed to undo: ' + insertError.message);
          } else {
            await loadTasksForDateHandler(getViewingDate());
            renderDailyView();
            updateHeaderStats();
            showSuccess('Task restored');
          }
        },
        6000
      );
    } catch (error) {
      showError('Failed to delete task: ' + error.message);
      showLoading(false);
    }
  });
}

// Day Type Editor
export function showDayTypeEditor(dateStr, currentType) {
  const dayTypes = [
    { value: 'work', label: 'Work Day', emoji: '🏥' },
    { value: 'off', label: 'Off Day', emoji: '📚' },
    { value: 'revision', label: 'Revision Day', emoji: '🔄' },
    { value: 'intensive', label: 'Intensive Study', emoji: '🔥' },
    { value: 'intensive-post', label: 'Post-Brazil Intensive', emoji: '💪' },
    { value: 'light', label: 'Light Study', emoji: '📖' },
    { value: 'rest', label: 'Rest Day', emoji: '😌' },
    { value: 'trip', label: 'Trip Day', emoji: '🌴' },
    { value: 'trip-end', label: 'Trip End', emoji: '🌴' },
    { value: 'exam-eve', label: 'Exam Eve', emoji: '🎯' }
  ];
  
  const options = dayTypes.map(type => `
    <option value="${type.value}" ${type.value === currentType ? 'selected' : ''}>
      ${type.emoji} ${type.label}
    </option>
  `).join('');
  
  const html = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;" onclick="if(event.target === this) window.closeDayTypeEditor()">
      <div style="background: white; padding: 24px; border-radius: 12px; max-width: 400px; width: 90%;" onclick="event.stopPropagation()">
        <h3 style="margin-top: 0;">Change Day Type</h3>
        <p style="font-size: 14px; color: #666; margin-bottom: 16px;">Select the day type for ${new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <select id="dayTypeSelector" style="width: 100%; padding: 12px; font-size: 16px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 16px;">
          ${options}
        </select>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button onclick="window.closeDayTypeEditor()" class="btn btn--secondary">Cancel</button>
          <button onclick="window.saveDayType('${dateStr}')" class="btn btn--primary">Save</button>
        </div>
      </div>
    </div>
  `;
  
  const modal = document.createElement('div');
  modal.id = 'dayTypeEditorModal';
  modal.innerHTML = html;
  document.body.appendChild(modal);
}

export function closeDayTypeEditor() {
  const modal = document.getElementById('dayTypeEditorModal');
  if (modal) {
    modal.remove();
  }
}

export async function saveDayType(dateStr) {
  const selector = document.getElementById('dayTypeSelector');
  const newType = selector.value;
  
  try {
    const currentSchedule = getScheduleForDate(dateStr) || templateDetailedSchedule[dateStr];
    const currentUser = getCurrentUser();
    await updateDayScheduleType(currentUser.id, dateStr, newType, currentSchedule);
    
    // Update local state
    setScheduleForDate(dateStr, {
      ...currentSchedule,
      type: newType
    });
    
    closeDayTypeEditor();
    renderDailyView();
    showSuccess('Day type updated successfully!');
  } catch (error) {
    console.error('Error saving day type:', error);
    showError('Failed to save day type: ' + error.message);
  }
}

// ==========================================================
// HELPER HANDLERS (exposed to window)
// ==========================================================

export async function toggleTaskCompletionHandler(taskId) {
  try {
    // Store previous state before toggling
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', taskId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const previousState = task.completed;
    
    // Toggle the task
    await toggleTaskCompletion(taskId);
    await loadTasksForDateHandler(getViewingDate());
    renderDailyView();
    updateHeaderStats();
    
    // Show undo toast
    showToastWithAction(
      previousState ? 'Task marked as incomplete' : 'Task marked as complete',
      'Undo',
      async () => {
        // Undo the toggle
        await toggleTaskCompletion(taskId);
        await loadTasksForDateHandler(getViewingDate());
        renderDailyView();
        updateHeaderStats();
      },
      6000
    );
  } catch (error) {
    console.error('Error toggling task:', error);
    showError('Failed to update task: ' + error.message);
  }
}

export async function loadTasksForDateHandler(date) {
  const currentUser = getCurrentUser();
  const categories = await loadTasksForDate(currentUser.id, date);
  const dateStr = formatDateISO(date);
  appState.tasks[dateStr] = categories;
}

export async function updateSBAHeaderStatsHandler() {
  const currentUser = getCurrentUser();
  const stats = await updateSBAHeaderStats(currentUser.id);
  document.getElementById('sbaProgress').textContent = `${stats.completed}/${stats.total} (${stats.percentage}%)`;
}

export async function updateTelegramHeaderStatsHandler() {
  const currentUser = getCurrentUser();
  const completed = await updateTelegramHeaderStats(currentUser.id);
  document.getElementById('telegramProgress').textContent = completed;
}

export async function handleSBAScheduleToggle(id) {
  try {
    // Store previous state
    const { data: entry, error: fetchError } = await supabase
      .from('sba_schedule')
      .select('completed')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    const previousState = entry.completed;
    
    // Toggle
    await toggleSBAScheduleCompletion(id);
    await loadTasksForDateHandler(getViewingDate());
    renderDailyView();
    await updateSBAHeaderStatsHandler();
    
    // Show undo toast
    showToastWithAction(
      previousState ? 'SBA marked as incomplete' : 'SBA marked as complete',
      'Undo',
      async () => {
        await toggleSBAScheduleCompletion(id);
        await loadTasksForDateHandler(getViewingDate());
        renderDailyView();
        await updateSBAHeaderStatsHandler();
      },
      6000
    );
  } catch (error) {
    console.error('Error toggling SBA schedule:', error);
    showError('Failed to update SBA: ' + error.message);
  }
}

export async function handleTelegramToggle(id) {
  try {
    // Store previous state
    const { data: question, error: fetchError } = await supabase
      .from('telegram_questions')
      .select('completed')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    const previousState = question.completed;
    
    // Toggle
    await toggleTelegramQuestionCompletion(id);
    await loadTasksForDateHandler(getViewingDate());
    renderDailyView();
    await updateTelegramHeaderStatsHandler();
    
    // Show undo toast
    showToastWithAction(
      previousState ? 'Telegram question marked as incomplete' : 'Telegram question marked as complete',
      'Undo',
      async () => {
        await toggleTelegramQuestionCompletion(id);
        await loadTasksForDateHandler(getViewingDate());
        renderDailyView();
        await updateTelegramHeaderStatsHandler();
      },
      6000
    );
  } catch (error) {
    console.error('Error toggling telegram question:', error);
    showError('Failed to update telegram question: ' + error.message);
  }
}

export async function deleteSBAScheduleEntryConfirm(id) {
  showConfirm('Are you sure you want to delete this SBA schedule entry?', async () => {
    try {
      showLoading(true);
      
      // Store entry data before deletion for undo
      const { data: entry, error: fetchError } = await supabase
        .from('sba_schedule')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      await deleteSBAScheduleEntry(id);
      await loadTasksForDateHandler(getViewingDate());
      renderDailyView();
      await updateSBAHeaderStatsHandler();
      showLoading(false);
      
      // Show undo toast
      showToastWithAction(
        'SBA entry deleted',
        'Undo',
        async () => {
          // Re-insert the entry
          const { error: insertError } = await supabase
            .from('sba_schedule')
            .insert([entry]);
          
          if (insertError) {
            showError('Failed to undo: ' + insertError.message);
          } else {
            await loadTasksForDateHandler(getViewingDate());
            renderDailyView();
            await updateSBAHeaderStatsHandler();
            showSuccess('SBA entry restored');
          }
        },
        6000
      );
    } catch (error) {
      showError('Failed to delete SBA schedule entry: ' + error.message);
      showLoading(false);
    }
  });
}

export async function deleteTelegramQuestionConfirm(id) {
  showConfirm('Are you sure you want to delete this telegram question?', async () => {
    try {
      showLoading(true);
      
      // Store question data before deletion for undo
      const { data: question, error: fetchError } = await supabase
        .from('telegram_questions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      await deleteTelegramQuestion(id);
      await loadTasksForDateHandler(getViewingDate());
      renderDailyView();
      await updateTelegramHeaderStatsHandler();
      showLoading(false);
      
      // Show undo toast
      showToastWithAction(
        'Telegram question deleted',
        'Undo',
        async () => {
          // Re-insert the question
          const { error: insertError } = await supabase
            .from('telegram_questions')
            .insert([question]);
          
          if (insertError) {
            showError('Failed to undo: ' + insertError.message);
          } else {
            await loadTasksForDateHandler(getViewingDate());
            renderDailyView();
            await updateTelegramHeaderStatsHandler();
            showSuccess('Telegram question restored');
          }
        },
        6000
      );
    } catch (error) {
      showError('Failed to delete telegram question: ' + error.message);
      showLoading(false);
    }
  });
}

export async function editSBAScheduleEntry(id) {
  showInfo('SBA editing not yet fully implemented - coming soon!');
}

export async function editTelegramQuestionFromDaily(id) {
  await editTelegramQuestion(id);
}

// Load all user data helper
export async function loadAllUserData() {
  const currentUser = getCurrentUser();
  await loadTasksForDateHandler(getViewingDate());
  
  // Load SBA and Telegram data for current date
  const dateStr = formatDateISO(getViewingDate());
  
  const { data: sbaEntries } = await supabase
    .from('sba_schedule')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('date', dateStr);
  
  const { data: telegramQuestions } = await supabase
    .from('telegram_questions')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('date', dateStr);
  
  appState.sbaSchedule[dateStr] = sbaEntries || [];
  appState.telegramQuestions[dateStr] = telegramQuestions || [];
}

// ==========================================================
// RESCHEDULE TASK MODAL
// ==========================================================

export async function showRescheduleTaskModal(taskId, taskName, currentDate) {
  const currentUser = getCurrentUser();
  
  try {
    showLoading(true);
    
    // Find next available day
    const suggestion = await findNextAvailableDay(currentUser.id, currentDate);
    
    showLoading(false);
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'rescheduleTaskModal';
    modal.style.display = 'flex';
    
    const suggestedDate = new Date(suggestion.date);
    const formattedSuggestion = suggestedDate.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    const dayTypeLabel = {
      'off': 'Off Day',
      'revision': 'Revision Day',
      'light': 'Light Study Day'
    }[suggestion.dayType] || 'Study Day';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Reschedule Task</h2>
          <button class="modal-close" onclick="document.getElementById('rescheduleTaskModal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="reschedule-info">
            <h3>Task: ${taskName}</h3>
            <p class="text-secondary">Currently scheduled for: ${new Date(currentDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          
          <div class="suggested-date-card">
            <h4>📅 Suggested Date</h4>
            <div class="suggested-date-details">
              <div class="suggested-date-main">${formattedSuggestion}</div>
              <div class="suggested-date-meta">
                <span class="day-type-badge ${suggestion.dayType}-day">${dayTypeLabel}</span>
                <span class="capacity-info">Current load: ${suggestion.currentLoad}min • Available: ${suggestion.availableCapacity}min</span>
                ${suggestion.isFallback ? '<span class="fallback-warning">⚠️ No ideal day found within 60 days</span>' : ''}
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Or choose a different date:</label>
            <input type="date" id="rescheduleNewDate" class="form-control" value="${suggestion.date}">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn--outline" onclick="document.getElementById('rescheduleTaskModal').remove()">Cancel</button>
          <button class="btn btn--primary" onclick="window.confirmRescheduleTask('${taskId}', '${currentDate}')">Confirm Reschedule</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
  } catch (error) {
    showLoading(false);
    showError('Failed to find available date: ' + error.message);
  }
}

export async function confirmRescheduleTask(taskId, originalDate) {
  const newDate = document.getElementById('rescheduleNewDate').value;
  
  if (!newDate) {
    showError('Please select a date');
    return;
  }
  
  const currentUser = getCurrentUser();
  
  try {
    showLoading(true);
    document.getElementById('rescheduleTaskModal').remove();
    
    await rescheduleTask(currentUser.id, taskId, newDate, originalDate);
    
    // Reload tasks for both dates
    await loadTasksForDateHandler(new Date(originalDate));
    await loadTasksForDateHandler(new Date(newDate));
    
    // Update catch-up queue
    const catchUpQueue = await loadCatchUpQueue(currentUser.id);
    setCatchUpQueue(catchUpQueue);
    updateCatchUpQueue();
    
    // Re-render current view
    renderDailyView();
    
    showSuccess(`Task rescheduled to ${new Date(newDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`);
    showLoading(false);
  } catch (error) {
    showLoading(false);
    showError('Failed to reschedule task: ' + error.message);
  }
}

// ==========================================================
// AUTO-RESCHEDULE MODAL (Bulk Missed Tasks)
// ==========================================================

export async function showAutoRescheduleModal() {
  const currentUser = getCurrentUser();
  
  try {
    showLoading(true);
    
    // Find all missed tasks and generate reschedule plan
    const result = await autoRescheduleMissedTasks(currentUser.id);
    
    showLoading(false);
    
    if (result.tasks.length === 0) {
      showInfo('No missed tasks found! You\'re all caught up! 🎉');
      return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'autoRescheduleModal';
    modal.style.display = 'flex';
    
    // Group plan by new date for better display
    const planByDate = {};
    result.plan.forEach(item => {
      if (!planByDate[item.newDate]) {
        planByDate[item.newDate] = [];
      }
      planByDate[item.newDate].push(item);
    });
    
    modal.innerHTML = `
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>Auto-Reschedule Missed Tasks</h2>
          <button class="modal-close" onclick="document.getElementById('autoRescheduleModal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="auto-reschedule-summary">
            <h3>📊 Summary</h3>
            <p><strong>${result.tasks.length} missed tasks</strong> will be rescheduled across <strong>${Object.keys(planByDate).length} days</strong></p>
            <p class="text-secondary">Tasks will be placed on OFF/REVISION/LIGHT days with available capacity.</p>
          </div>
          
          <div class="reschedule-plan-preview">
            <h4>📅 Reschedule Plan Preview</h4>
            ${Object.keys(planByDate).sort().map(date => {
              const items = planByDate[date];
              const formattedDate = new Date(date).toLocaleDateString('en-GB', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              });
              return `
                <div class="plan-date-group">
                  <div class="plan-date-header">${formattedDate}</div>
                  <ul class="plan-task-list">
                    ${items.map(item => `
                      <li class="plan-task-item">
                        <span class="plan-task-name">${item.task.task_name}</span>
                        <span class="plan-task-meta">
                          <span class="plan-task-category">${item.categoryName}</span>
                          <span class="plan-task-time">⏱ ${item.timeEstimate}</span>
                          <span class="plan-task-original">from ${new Date(item.originalDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        </span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn--outline" onclick="document.getElementById('autoRescheduleModal').remove()">Cancel</button>
          <button class="btn btn--primary" onclick="window.executeAutoReschedule()">✓ Confirm &amp; Reschedule All</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store plan in modal for later use
    modal.dataset.plan = JSON.stringify(result.plan);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
  } catch (error) {
    showLoading(false);
    showError('Failed to generate reschedule plan: ' + error.message);
  }
}

export async function executeAutoReschedule() {
  const modal = document.getElementById('autoRescheduleModal');
  const plan = JSON.parse(modal.dataset.plan);
  const currentUser = getCurrentUser();
  
  try {
    showLoading(true);
    modal.remove();
    
    const result = await executeReschedulePlan(currentUser.id, plan);
    
    if (result.errors.length > 0) {
      console.error('Some tasks failed to reschedule:', result.errors);
    }
    
    // Reload catch-up queue and current view
    const catchUpQueue = await loadCatchUpQueue(currentUser.id);
    setCatchUpQueue(catchUpQueue);
    updateCatchUpQueue();
    
    // Reload current viewing date tasks
    await loadTasksForDateHandler(getViewingDate());
    renderDailyView();
    updateHeaderStats();
    
    showSuccess(`Successfully rescheduled ${result.successCount} tasks!`);
    showLoading(false);
  } catch (error) {
    showLoading(false);
    showError('Failed to execute reschedule plan: ' + error.message);
  }
}

