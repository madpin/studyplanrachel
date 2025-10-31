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
  toggleTaskCompletion,
  saveDailyNote,
  updateDayScheduleType,
  removeCatchUpItem,
  getModuleProgressStats,
  loadSBATests,
  loadSBASchedule,
  toggleSBAScheduleCompletion,
  deleteSBAScheduleEntry,
  createSBATest,
  updateSBATest,
  deleteSBATest,
  createSBAScheduleEntry,
  loadTelegramQuestions,
  toggleTelegramQuestionCompletion,
  deleteTelegramQuestion,
  createTelegramQuestion,
  updateTelegramQuestion,
  bulkUploadSBA,
  bulkUploadTelegramQuestions,
  createPlaceholders,
  updateSBATestProgress
} from './storage.js';
import {
  calculateOverallProgress,
  calculateModuleProgress,
  updateSBAHeaderStats,
  updateTelegramHeaderStats
} from './progress.js';

// ==========================================================
// HELPER FUNCTIONS
// ==========================================================

export function showLoading(show) {
  document.getElementById('loadingIndicator').style.display = show ? 'flex' : 'none';
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

  let html = '';

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

  dailyContent.innerHTML = html;

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

  // Load data for all days in the week
  const weekData = await Promise.all(weekDays.map(async day => {
    const dateStr = formatDateISO(day);
    const currentUser = getCurrentUser();
    
    // Load tasks
    const { data: categories } = await supabase
      .from('task_categories')
      .select('*, tasks(*)')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr);
    
    // Load SBA schedule
    const { data: sbaEntries } = await supabase
      .from('sba_schedule')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr);
    
    // Load telegram questions
    const { data: telegramQuestions } = await supabase
      .from('telegram_questions')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr);
    
    return {
      date: day,
      dateStr,
      categories: categories || [],
      sbaEntries: sbaEntries || [],
      telegramQuestions: telegramQuestions || []
    };
  }));

  const weeklyContent = document.getElementById('weeklyContent');
  weeklyContent.innerHTML = weekData.map(dayData => {
    const dayName = dayData.date.toLocaleDateString('en-GB', { weekday: 'long' });
    const totalTasks = dayData.categories.reduce((sum, cat) => sum + cat.tasks.length, 0);
    const completedTasks = dayData.categories.reduce((sum, cat) => 
      sum + cat.tasks.filter(t => t.completed).length, 0);
    const sbaCount = dayData.sbaEntries.length;
    const completedSBA = dayData.sbaEntries.filter(s => s.completed).length;
    const telegramCount = dayData.telegramQuestions.length;
    const completedTelegram = dayData.telegramQuestions.filter(q => q.completed).length;

    return `
      <div class="week-day-card" onclick="window.viewDayFromWeek('${dayData.dateStr}')">
        <div class="week-day-header">${dayName}</div>
        <div class="week-day-date">${formatDateShort(dayData.date)}</div>
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

  // Load data for all days in the month
  const monthDates = [];
  for (let day = 1; day <= daysInMonth; day++) {
    monthDates.push(new Date(year, month, day));
  }

  const currentUser = getCurrentUser();
  const monthData = await Promise.all(monthDates.map(async date => {
    const dateStr = formatDateISO(date);
    
    // Load tasks
    const { data: categories } = await supabase
      .from('task_categories')
      .select('*, tasks(*)')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr);
    
    // Load SBA schedule
    const { data: sbaEntries } = await supabase
      .from('sba_schedule')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr);
    
    // Load telegram questions
    const { data: telegramQuestions } = await supabase
      .from('telegram_questions')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr);
    
    const totalTasks = (categories || []).reduce((sum, cat) => sum + cat.tasks.length, 0);
    const completedTasks = (categories || []).reduce((sum, cat) => 
      sum + cat.tasks.filter(t => t.completed).length, 0);
    const sbaCount = (sbaEntries || []).length;
    const completedSBA = (sbaEntries || []).filter(s => s.completed).length;
    const telegramCount = (telegramQuestions || []).length;
    const completedTelegram = (telegramQuestions || []).filter(q => q.completed).length;
    
    return {
      dateStr,
      totalTasks,
      completedTasks,
      sbaCount,
      completedSBA,
      telegramCount,
      completedTelegram
    };
  }));

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
    const dayData = monthData[day - 1];
    let dayClass = 'calendar-day';

    if (date.toDateString() === today.toDateString()) {
      dayClass += ' today';
    }

    const hasItems = dayData.totalTasks > 0 || dayData.sbaCount > 0 || dayData.telegramCount > 0;

    html += `
      <div class="${dayClass} ${hasItems ? 'has-items' : ''}" onclick="window.viewDayFromCalendar('${formatDateISO(date)}')">
        <div class="calendar-day-number">${day}</div>
        ${hasItems ? `
          <div class="calendar-day-items">
            ${dayData.totalTasks > 0 ? `<div class="calendar-indicator">📚 ${dayData.completedTasks}/${dayData.totalTasks}</div>` : ''}
            ${dayData.sbaCount > 0 ? `<div class="calendar-indicator">📋 ${dayData.completedSBA}/${dayData.sbaCount}</div>` : ''}
            ${dayData.telegramCount > 0 ? `<div class="calendar-indicator">💬 ${dayData.completedTelegram}/${dayData.telegramCount}</div>` : ''}
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
  // This is a placeholder - the full SBA view would be much longer
  // In the actual implementation, this would include full SBA test management
  const sbaTestsList = document.getElementById('sbaTestsList');
  const currentUser = getCurrentUser();
  const tests = await loadSBATests(currentUser.id);
  
  if (tests.length === 0) {
    sbaTestsList.innerHTML = '<p class="empty-state">No SBA tests defined yet.</p>';
  } else {
    sbaTestsList.innerHTML = tests.map(test => `
      <div class="sba-test-card">
        <div class="sba-test-header">
          <div class="sba-test-name">${test.name}</div>
        </div>
        <div class="sba-test-progress">
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${Math.round((test.completed / test.total_days) * 100)}%;"></div>
          </div>
          <div class="progress-text">
            <span>${test.completed}/${test.total_days} completed</span>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  await updateSBAHeaderStatsHandler();
}

// ==========================================================
// TELEGRAM VIEW (simplified)
// ==========================================================

export async function renderTelegramView() {
  // Simplified placeholder
  const contentEl = document.getElementById('telegramQuestionsContent');
  contentEl.innerHTML = '<p>Telegram questions view</p>';
  await updateTelegramHeaderStatsHandler();
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
  alert('Add module functionality coming soon!');
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
    alert('Day type updated successfully!');
  } catch (error) {
    console.error('Error saving day type:', error);
    alert('Failed to save day type: ' + error.message);
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
  if (confirm('Are you sure you want to delete this SBA schedule entry?')) {
    try {
      await deleteSBAScheduleEntry(id);
      await loadTasksForDateHandler(getViewingDate());
      renderDailyView();
      await updateSBAHeaderStatsHandler();
      alert('SBA schedule entry deleted successfully!');
    } catch (error) {
      alert('Failed to delete SBA schedule entry: ' + error.message);
    }
  }
}

export async function deleteTelegramQuestionConfirm(id) {
  if (confirm('Are you sure you want to delete this telegram question?')) {
    try {
      await deleteTelegramQuestion(id);
      await loadTasksForDateHandler(getViewingDate());
      renderDailyView();
      await updateTelegramHeaderStatsHandler();
      alert('Telegram question deleted successfully!');
    } catch (error) {
      alert('Failed to delete telegram question: ' + error.message);
    }
  }
}

export async function editSBAScheduleEntry(id) {
  const newName = prompt('Edit SBA test name:');
  if (newName) {
    // Implementation would update the entry
    alert('SBA editing not yet fully implemented in modular version');
  }
}

export async function editTelegramQuestionFromDaily(id) {
  alert('Telegram question editing not yet fully implemented in modular version');
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

