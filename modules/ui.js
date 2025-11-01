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
  createTaskCategory
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
  showConfirm
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

    content.innerHTML = catchUpQueue.map(item => `
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
    `).join('');
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

  document.getElementById('currentDate').textContent = formatDate(date);

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
    
    dayTypeBadge.className = badgeClasses[dayType] || 'day-type-badge clickable';
    dayTypeBadge.textContent = badgeLabels[dayType] || 'Study Day';
    dayTypeBadge.onclick = () => window.showDayTypeEditor(dateStr, dayType);
    
    workInfoElement.textContent = getWorkInfo(date);
  } else {
    dayTypeBadge.textContent = 'Study Day';
    dayTypeBadge.className = 'day-type-badge';
    workInfoElement.textContent = 'Regular study day';
  }

  // Render tasks
  const categories = getTasksForDate(dateStr);
  const sbaEntries = getSBAForDate(dateStr);
  const telegramQuestions = getTelegramQuestionsForDate(dateStr);
  const dailyContent = document.getElementById('dailyContent');
  
  console.log('[renderDailyView] Tasks:', categories);
  console.log('[renderDailyView] SBA:', sbaEntries);
  console.log('[renderDailyView] Telegram:', telegramQuestions);
  
  // Calculate total time for the day
  const totalMinutes = calculateTotalTimeForDay(categories);
  const timeDisplay = totalMinutes > 0 ? 
    `<div class="daily-time-total">⏱ Total time today: ${formatMinutesToHours(totalMinutes)}</div>` : '';

  let html = timeDisplay;

  // Render task categories
  if (categories.length > 0) {
    html += categories.map((category, catIndex) => `
      <div class="task-category">
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
              <li class="task-item ${task.completed ? 'completed' : ''} ${task.is_placeholder ? 'placeholder' : ''}">
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
    const sbaIndex = categories.length;
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
    const telegramIndex = categories.length + (sbaEntries.length > 0 ? 1 : 0);
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
        <p>Use the SBA Tests and Telegram Q tabs to add items, or use the settings to customize your study schedule.</p>
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

    // Extract topics from tasks
    const topics = [];
    categories.forEach(cat => {
      cat.tasks.forEach(task => {
        if (task.title) {
          topics.push(task.title);
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
        <div class="week-day-header">${dayName}</div>
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

    html += `
      <div class="${dayClass} ${hasItems ? 'has-items' : ''}" onclick="window.viewDayFromCalendar('${dateStr}')">
        <div class="calendar-day-number">${day}</div>
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
    return { ...module, ...progress };
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
          <strong>Subtopics:</strong><br/>
          ${module.subtopics_list.slice(0, 5).join(', ')}${module.subtopics_list.length > 5 ? `, +${module.subtopics_list.length - 5} more` : ''}
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
  
  modal.style.display = 'flex';
  
  // Setup form submission if not already set
  const form = document.getElementById('sbaForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    await saveSBATest();
  };
}

// Close SBA Modal
export function closeSBAModal() {
  document.getElementById('addSBAModal').style.display = 'none';
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
  
  modal.style.display = 'flex';
  
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
                <tr style="border-bottom: 1px solid #eee; ${row.valid ? '' : 'background: #fff3f3;'}">
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
                <tr style="border-bottom: 1px solid #eee; ${row.valid ? '' : 'background: #fff3f3;'}">
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
  showInfo('SBA placeholder creation feature coming soon!');
  // This will be implemented later
}

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
  
  modal.style.display = 'flex';
  
  // Setup form submission if not already set
  const form = document.getElementById('telegramForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    await saveTelegramQuestion();
  };
}

// Close Telegram Modal
export function closeTelegramModal() {
  document.getElementById('addTelegramModal').style.display = 'none';
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
    
    modal.style.display = 'flex';
    
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

  document.getElementById('settingsModal').style.display = 'flex';
}

export function closeSettingsModal() {
  document.getElementById('settingsModal').style.display = 'none';
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
  
  modal.style.display = 'flex';
  
  // Setup form submission
  const form = document.getElementById('taskForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    await saveTask();
  };
}

// Close Task Modal
export function closeTaskModal() {
  document.getElementById('addTaskModal').style.display = 'none';
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
    
    modal.style.display = 'flex';
    
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
      await deleteTask(taskId);
      await loadTasksForDateHandler(getViewingDate());
      renderDailyView();
      updateHeaderStats();
      showSuccess('Task deleted successfully!');
      showLoading(false);
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
    await toggleTaskCompletion(taskId);
    await loadTasksForDateHandler(getViewingDate());
    renderDailyView();
    updateHeaderStats();
  } catch (error) {
    console.error('Error toggling task:', error);
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
  document.getElementById('sbaProgress').textContent = `${stats.percentage}%`;
}

export async function updateTelegramHeaderStatsHandler() {
  const currentUser = getCurrentUser();
  const completed = await updateTelegramHeaderStats(currentUser.id);
  document.getElementById('telegramProgress').textContent = completed;
}

export async function handleSBAScheduleToggle(id) {
  try {
    await toggleSBAScheduleCompletion(id);
    await loadTasksForDateHandler(getViewingDate());
    renderDailyView();
    await updateSBAHeaderStatsHandler();
  } catch (error) {
    console.error('Error toggling SBA schedule:', error);
  }
}

export async function handleTelegramToggle(id) {
  try {
    await toggleTelegramQuestionCompletion(id);
    await loadTasksForDateHandler(getViewingDate());
    renderDailyView();
    await updateTelegramHeaderStatsHandler();
  } catch (error) {
    console.error('Error toggling telegram question:', error);
  }
}

export async function deleteSBAScheduleEntryConfirm(id) {
  showConfirm('Are you sure you want to delete this SBA schedule entry?', async () => {
    try {
      await deleteSBAScheduleEntry(id);
      await loadTasksForDateHandler(getViewingDate());
      renderDailyView();
      await updateSBAHeaderStatsHandler();
      showSuccess('SBA schedule entry deleted successfully!');
    } catch (error) {
      showError('Failed to delete SBA schedule entry: ' + error.message);
    }
  });
}

export async function deleteTelegramQuestionConfirm(id) {
  showConfirm('Are you sure you want to delete this telegram question?', async () => {
    try {
      await deleteTelegramQuestion(id);
      await loadTasksForDateHandler(getViewingDate());
      renderDailyView();
      await updateTelegramHeaderStatsHandler();
      showSuccess('Telegram question deleted successfully!');
    } catch (error) {
      showError('Failed to delete telegram question: ' + error.message);
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

