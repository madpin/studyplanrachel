// Import configuration and authentication
import { supabase } from './config.js';
import {
  getCurrentUser,
  setCurrentUser,
  setInitializeAppCallback,
  initializeAuth,
  handleLogout,
  switchAuthTab
} from './auth.js';

// Import state management
import {
  appState,
  setUserSettings,
  setModules,
  setDailySchedule,
  setTasks,
  setSBASchedule,
  setTelegramQuestions,
  setCatchUpQueue,
  setViewingDate,
  setDailyNoteForDate
} from './modules/state.js';

// Import schedule data and functions
import {
  defaultModules,
  templateDetailedSchedule,
  templateSBASchedule,
  formatDateISO
} from './modules/schedule.js';

// Import storage operations
import {
  loadUserSettings,
  loadModules,
  loadDailySchedule,
  clearUserData,
  seedDailySchedule,
  seedTasksFromTemplate,
  seedSBASchedule,
  seedTelegramQuestions,
  loadTasksForDate,
  loadAllTasksToToday,
  loadDailyNote,
  saveDailyNote,
  loadCatchUpQueue,
  completeOnboarding
} from './modules/storage.js';

// Import UI functions
import * as UI from './modules/ui.js';

// Import toast notifications
import { showToast, showSuccess, showError, showWarning, showConfirm } from './modules/toast.js';

let hasInitialized = false;

function initializeTheme() {
  const savedTheme = localStorage.getItem('studyplan-theme') || 'ocean';
  applyTheme(savedTheme);
  
  const themeToggle = document.getElementById('themeToggle');
  const themeMenu = document.getElementById('themeMenu');
  
  if (themeToggle && themeMenu) {
    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.style.display = themeMenu.style.display === 'none' ? 'block' : 'none';
    });
    
    document.addEventListener('click', (e) => {
      if (!themeToggle.contains(e.target) && !themeMenu.contains(e.target)) {
        themeMenu.style.display = 'none';
      }
    });
    
    document.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        applyTheme(theme);
        localStorage.setItem('studyplan-theme', theme);
        themeMenu.style.display = 'none';
      });
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  
  document.querySelectorAll('.theme-option').forEach(option => {
    option.classList.toggle('active', option.dataset.theme === theme);
  });
}

async function initializeApp() {
  try {
    UI.showLoading(true);
    const currentUser = getCurrentUser();
    const settings = await loadUserSettings(currentUser.id);

    if (!settings) {
      UI.showLoading(false);
      showOnboardingModal();
      return;
    }

    setUserSettings(settings);
    await loadAllData();
    UI.updateHeaderStats();
    UI.updateMotivationalBanner();
    UI.updateCatchUpQueue();
    
    const lastView = localStorage.getItem('studyplan-last-view') || 'daily';
    const lastDate = localStorage.getItem('studyplan-last-date');
    
    if (lastDate) {
      const restoredDate = new Date(lastDate);
      if (!isNaN(restoredDate.getTime())) {
        setViewingDate(restoredDate);
        await loadTasksForDateHandler(restoredDate);
      }
    }
    
    await UI.switchView(lastView);
    await loadDailyNoteHandler();
    UI.showLoading(false);

  } catch (error) {
    console.error('Error initializing app:', error);
    UI.showLoading(false);
    showError('Failed to initialize app: ' + error.message);
  }
}

async function loadAllData() {
  const currentUser = getCurrentUser();
  
  try {
    const modules = await loadModules(currentUser.id);
    setModules(modules);

    const scheduleMap = await loadDailySchedule(currentUser.id);
    
    if (Object.keys(scheduleMap).length === 0) {
      Object.keys(templateDetailedSchedule).forEach(date => {
        setDailySchedule({ ...appState.dailySchedule, [date]: templateDetailedSchedule[date] });
      });
    } else {
      setDailySchedule(scheduleMap);
    }

    const allTasksToToday = await loadAllTasksToToday(currentUser.id);
    Object.keys(allTasksToToday).forEach(dateStr => {
      setTasks({ ...appState.tasks, [dateStr]: allTasksToToday[dateStr] });
    });

    const viewingDate = new Date();
    const dateStr = formatDateISO(viewingDate);
    if (!appState.tasks[dateStr]) {
      const categories = await loadTasksForDate(currentUser.id, viewingDate);
      setTasks({ ...appState.tasks, [dateStr]: categories });
    }

    const catchUpQueue = await loadCatchUpQueue(currentUser.id);
    setCatchUpQueue(catchUpQueue);

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

    setSBASchedule({ ...appState.sbaSchedule, [dateStr]: sbaEntries || [] });
    setTelegramQuestions({ ...appState.telegramQuestions, [dateStr]: telegramQuestions || [] });

  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

async function loadDailyNoteHandler() {
  const currentUser = getCurrentUser();
  const viewingDate = appState.viewingDate;
  const dateStr = formatDateISO(viewingDate);
  
  try {
    const note = await loadDailyNote(currentUser.id, viewingDate);
    setDailyNoteForDate(dateStr, note);
    document.getElementById('dailyNotes').value = note;
  } catch (error) {
    console.error('Error loading daily note:', error);
  }
}

let notesAutosaveTimer = null;
async function saveDailyNoteHandler(showFeedback = true) {
  const currentUser = getCurrentUser();
  const viewingDate = appState.viewingDate;
  const notes = document.getElementById('dailyNotes').value;
  
  try {
    await saveDailyNote(currentUser.id, viewingDate, notes);
    const dateStr = formatDateISO(viewingDate);
    setDailyNoteForDate(dateStr, notes);
    
    if (showFeedback) {
      const saveBtn = document.getElementById('saveNotesBtn');
      const saveStatus = document.getElementById('notesSaveStatus');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saved ✓';
      saveStatus.textContent = 'Saved ✓';
      
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveStatus.textContent = '';
      }, 2000);
    }
  } catch (error) {
    console.error('Error saving daily note:', error);
    const saveStatus = document.getElementById('notesSaveStatus');
    saveStatus.textContent = 'Error saving';
    saveStatus.style.color = 'var(--color-error)';
    setTimeout(() => {
      saveStatus.textContent = '';
      saveStatus.style.color = '';
    }, 3000);
  }
}

function setupNotesAutosave() {
  const notesTextarea = document.getElementById('dailyNotes');
  const charCounter = document.getElementById('notesCharCounter');
  if (!notesTextarea) return;
  
  // Character counter
  const updateCharCounter = () => {
    if (charCounter) {
      const count = notesTextarea.value.length;
      charCounter.textContent = `${count} chars`;
    }
  };
  
  // Update counter on input
  notesTextarea.addEventListener('input', () => {
    updateCharCounter();
    
    if (notesAutosaveTimer) {
      clearTimeout(notesAutosaveTimer);
    }
    
    notesAutosaveTimer = setTimeout(() => {
      saveDailyNoteHandler(false);
    }, 800);
  });
  
  // Initial counter update
  updateCharCounter();
}

// Add note tag helper
window.addNoteTag = (tag) => {
  const notesTextarea = document.getElementById('dailyNotes');
  if (notesTextarea) {
    const cursorPos = notesTextarea.selectionStart;
    const textBefore = notesTextarea.value.substring(0, cursorPos);
    const textAfter = notesTextarea.value.substring(cursorPos);
    
    // Add a space before the tag if needed
    const prefix = textBefore && !textBefore.endsWith(' ') && !textBefore.endsWith('\n') ? ' ' : '';
    
    notesTextarea.value = textBefore + prefix + tag + ' ' + textAfter;
    notesTextarea.focus();
    notesTextarea.selectionStart = notesTextarea.selectionEnd = cursorPos + prefix.length + tag.length + 1;
    
    // Trigger autosave
    const event = new Event('input', { bubbles: true });
    notesTextarea.dispatchEvent(event);
  }
};

function showOnboardingModal() {
  const modal = document.getElementById('onboardingModal');
  if (!modal) {
    console.error('Onboarding modal not found!');
    return;
  }

  document.getElementById('onboardingExamDate').value = '2026-01-14';
  document.getElementById('onboardingTripStart').value = '2025-12-19';
  document.getElementById('onboardingTripEnd').value = '2025-12-29';

  const modulesContainer = document.getElementById('moduleCheckboxes');
  modulesContainer.innerHTML = defaultModules.map((module, index) => `
    <label class="module-checkbox">
      <input type="checkbox" value="${index}" checked>
      <span>${module.name}</span>
    </label>
  `).join('');

  modal.style.display = 'flex';
}

function closeOnboardingModal() {
  document.getElementById('onboardingModal').style.display = 'none';
}

function selectAllModules() {
  document.querySelectorAll('#moduleCheckboxes input[type="checkbox"]').forEach(cb => {
    cb.checked = true;
  });
}

function deselectAllModules() {
  document.querySelectorAll('#moduleCheckboxes input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
}

async function submitOnboarding(useTemplate) {
  const currentUser = getCurrentUser();
  
  try {
    let examDate, tripStart, tripEnd, selectedModules, maxStudyMinutes, workDaysPattern;

    // Get capacity configuration
    const maxStudyHours = parseFloat(document.getElementById('onboardingMaxStudyHours').value) || 8;
    maxStudyMinutes = Math.round(maxStudyHours * 60);
    
    const workDayCheckboxes = document.querySelectorAll('input[name="workDay"]:checked');
    workDaysPattern = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    };
    workDayCheckboxes.forEach(cb => {
      workDaysPattern[cb.value] = true;
    });

    if (useTemplate) {
      examDate = '2026-01-14';
      tripStart = '2025-12-19';
      tripEnd = '2025-12-29';
      selectedModules = defaultModules;
    } else {
      examDate = document.getElementById('onboardingExamDate').value;
      tripStart = document.getElementById('onboardingTripStart').value || null;
      tripEnd = document.getElementById('onboardingTripEnd').value || null;

      const checkboxes = document.querySelectorAll('#moduleCheckboxes input[type="checkbox"]:checked');
      selectedModules = Array.from(checkboxes).map(cb => defaultModules[parseInt(cb.value)]);

      if (selectedModules.length === 0) {
        showWarning('Please select at least one module');
        return;
      }
    }

    UI.showLoading(true);
    closeOnboardingModal();

    await completeOnboarding(currentUser.id, examDate, tripStart, tripEnd, selectedModules, useTemplate, maxStudyMinutes, workDaysPattern);

    if (useTemplate) {
      await seedDailySchedule(currentUser.id, templateDetailedSchedule);
      const sbaCount = await seedSBASchedule(currentUser.id, templateSBASchedule);
      const telegramCount = await seedTelegramQuestions(currentUser.id, templateDetailedSchedule);
      const modules = await loadModules(currentUser.id);
      const taskCount = await seedTasksFromTemplate(currentUser.id, templateDetailedSchedule, modules);
    }

    await initializeApp();
    UI.showLoading(false);
    showSuccess('Welcome! Your study plan has been set up successfully!');

  } catch (error) {
    console.error('Error completing onboarding:', error);
    UI.showLoading(false);
    showError('Failed to complete setup: ' + error.message);
  }
}

function showOnboardingManually() {
  showOnboardingModal();
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    
    if (isTyping && e.key !== 'Escape') {
      return;
    }
    
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.modal[style*="display: flex"]');
      openModals.forEach(modal => {
        modal.style.display = 'none';
      });
      return;
    }
    
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    
    switch(e.key) {
      case 'n':
      case 'ArrowRight':
        e.preventDefault();
        UI.changeDay(1);
        break;
        
      case 'p':
      case 'ArrowLeft':
        e.preventDefault();
        UI.changeDay(-1);
        break;
        
      case '1':
        e.preventDefault();
        UI.switchView('daily');
        break;
        
      case '2':
        e.preventDefault();
        UI.switchView('weekly');
        break;
        
      case '3':
        e.preventDefault();
        UI.switchView('calendar');
        break;
        
      case '4':
        e.preventDefault();
        UI.switchView('modules');
        break;
        
      case '5':
        e.preventDefault();
        UI.switchView('sba');
        break;
        
      case '6':
        e.preventDefault();
        UI.switchView('telegram');
        break;
        
      case '?':
        e.preventDefault();
        showKeyboardShortcutsHelp();
        break;
        
      case 'a':
        if (document.getElementById('dailyView').style.display !== 'none') {
          e.preventDefault();
          UI.showAddTaskModal();
        }
        break;
        
      case 'c':
        if (document.getElementById('dailyView').style.display !== 'none') {
          e.preventDefault();
          UI.showAddTaskModal();
        }
        break;
    }
  });
}

function showKeyboardShortcutsHelp() {
  const shortcuts = [
    { keys: '←/p', description: 'Previous day' },
    { keys: '→/n', description: 'Next day' },
    { keys: '1-6', description: 'Switch between views' },
    { keys: 'a', description: 'Add task (in daily view)' },
    { keys: '?', description: 'Show this help' },
    { keys: 'Esc', description: 'Close modals' }
  ];
  
  const helpHtml = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;" onclick="if(event.target === this) this.remove()">
      <div style="background: white; padding: 32px; border-radius: 12px; max-width: 500px; width: 90%;" onclick="event.stopPropagation()">
        <h2 style="margin-top: 0;">Keyboard Shortcuts</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            ${shortcuts.map(s => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px 16px; font-family: monospace; font-weight: 600; color: var(--color-primary);">${s.keys}</td>
                <td style="padding: 12px 16px;">${s.description}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 24px; text-align: right;">
          <button onclick="this.closest('[style*=\\'position: fixed\\']').remove()" class="btn btn--primary">Got it!</button>
        </div>
      </div>
    </div>
  `;
  
  const modal = document.createElement('div');
  modal.innerHTML = helpHtml;
  document.body.appendChild(modal);
}

// Setup swipe gestures for mobile navigation
function setupSwipeGestures() {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  
  const minSwipeDistance = 50; // Minimum distance for a swipe
  const maxVerticalDistance = 100; // Maximum vertical movement to still count as horizontal swipe
  
  const dailyView = document.getElementById('dailyView');
  const weeklyView = document.getElementById('weeklyView');
  
  if (dailyView) {
    dailyView.addEventListener('touchstart', (e) => {
      // Don't interfere with scrolling or form inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    dailyView.addEventListener('touchend', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe('daily');
    }, { passive: true });
  }
  
  if (weeklyView) {
    weeklyView.addEventListener('touchstart', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    weeklyView.addEventListener('touchend', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe('weekly');
    }, { passive: true });
  }
  
  function handleSwipe(viewType) {
    const horizontalDistance = touchEndX - touchStartX;
    const verticalDistance = Math.abs(touchEndY - touchStartY);
    
    // Only process if horizontal swipe with minimal vertical movement
    if (Math.abs(horizontalDistance) < minSwipeDistance || verticalDistance > maxVerticalDistance) {
      return;
    }
    
    if (viewType === 'daily') {
      if (horizontalDistance > 0) {
        // Swipe right - previous day
        UI.changeDay(-1);
      } else {
        // Swipe left - next day
        UI.changeDay(1);
      }
    } else if (viewType === 'weekly') {
      if (horizontalDistance > 0) {
        // Swipe right - previous week
        UI.changeWeek(-1);
      } else {
        // Swipe left - next week
        UI.changeWeek(1);
      }
    }
  }
}

// Generate template preview for onboarding
window.generateTemplatePreview = function() {
  const templateRadio = document.getElementById('templateMrcog');
  const previewContent = document.getElementById('templatePreviewContent');
  const previewBtn = document.getElementById('previewBtn');
  
  if (!templateRadio.checked) {
    showInfo('Template preview is only available for the MRCOG Jan 2026 template');
    return;
  }
  
  if (previewContent.style.display === 'none') {
    // Generate preview
    const startDate = new Date('2025-11-01');
    const previewDays = 7; // Show first week
    
    let html = '<div class="preview-week">';
    
    for (let i = 0; i < previewDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = formatDateISO(date);
      const dayData = templateDetailedSchedule[dateStr];
      
      if (!dayData) continue;
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const topics = dayData.topics || [];
      const resources = dayData.resources || [];
      const type = dayData.type || 'off';
      
      // Get SBA for this date
      const sbaTests = templateSBASchedule[dateStr] || [];
      
      html += `
        <div class="preview-day">
          <div class="preview-day-header">
            <strong>${dayName}</strong>
            <span class="day-type-badge ${type}">${type}</span>
          </div>
          <div class="preview-day-content">
            ${topics.length > 0 ? `
              <div class="preview-section">
                <strong>Topics:</strong>
                <ul>
                  ${topics.slice(0, 3).map(t => `<li>${t}</li>`).join('')}
                  ${topics.length > 3 ? `<li><em>...and ${topics.length - 3} more</em></li>` : ''}
                </ul>
              </div>
            ` : ''}
            ${resources.length > 0 ? `
              <div class="preview-section">
                <strong>Resources:</strong> ${resources.join(', ')}
              </div>
            ` : ''}
            ${sbaTests.length > 0 ? `
              <div class="preview-section">
                <strong>SBA:</strong> ${sbaTests.join(', ')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }
    
    html += '</div>';
    html += `
      <div class="preview-summary">
        <p><strong>Summary:</strong></p>
        <ul>
          <li>Total study days: ${Object.keys(templateDetailedSchedule).length}</li>
          <li>Total SBA tests: ${Object.values(templateSBASchedule).flat().length}</li>
          <li>Study period: Nov 1, 2025 - Jan 14, 2026</li>
        </ul>
      </div>
    `;
    
    previewContent.innerHTML = html;
    previewContent.style.display = 'block';
    previewBtn.textContent = '🔼 Hide Preview';
  } else {
    // Hide preview
    previewContent.style.display = 'none';
    previewBtn.textContent = '👁️ Show Preview';
  }
};

// Show/hide template preview section based on template selection
function toggleTemplatePreviewSection() {
  const templateMrcog = document.getElementById('templateMrcog');
  const previewSection = document.getElementById('templatePreviewSection');
  
  if (templateMrcog && previewSection) {
    if (templateMrcog.checked) {
      previewSection.style.display = 'block';
    } else {
      previewSection.style.display = 'none';
    }
  }
}

// Initialize drag-and-drop for task categories and tasks
function initializeDragAndDrop() {
  // Wait for Sortable.js to load
  if (typeof Sortable === 'undefined') {
    setTimeout(initializeDragAndDrop, 100);
    return;
  }
  
  // Observer to reinitialize drag-and-drop when daily view is re-rendered
  const dailyContent = document.getElementById('dailyContent');
  if (!dailyContent) return;
  
  const observer = new MutationObserver(() => {
    setupCategoriesSortable();
    setupTasksSortable();
  });
  
  observer.observe(dailyContent, { childList: true, subtree: true });
  
  // Initial setup
  setupCategoriesSortable();
  setupTasksSortable();
}

// Setup sortable for task categories
function setupCategoriesSortable() {
  const dailyContent = document.getElementById('dailyContent');
  if (!dailyContent) return;
  
  const categories = dailyContent.querySelectorAll('.task-category');
  if (categories.length === 0) return;
  
  // Make the container sortable
  new Sortable(dailyContent, {
    handle: '.task-category-header',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onEnd: async function(evt) {
      // Update sort order in database
      await updateCategorySortOrder(evt.oldIndex, evt.newIndex);
    }
  });
}

// Setup sortable for tasks within categories
function setupTasksSortable() {
  const taskLists = document.querySelectorAll('.task-list');
  
  taskLists.forEach((taskList, categoryIndex) => {
    new Sortable(taskList, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd: async function(evt) {
        // Update task sort order in database
        await updateTaskSortOrder(taskList, evt.oldIndex, evt.newIndex);
      }
    });
  });
}

// Update category sort order in database
async function updateCategorySortOrder(oldIndex, newIndex) {
  try {
    const dateStr = formatDateISO(getViewingDate());
    const categories = getTasksForDate(dateStr);
    
    // Reorder categories array
    const [movedCategory] = categories.splice(oldIndex, 1);
    categories.splice(newIndex, 0, movedCategory);
    
    // Update sort_order for all categories
    const updates = categories.map((category, index) => ({
      id: category.id,
      sort_order: index
    }));
    
    // Batch update
    for (const update of updates) {
      await supabase
        .from('task_categories')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id);
    }
    
    // Refresh the view
    await loadTasksForDateHandler(dateStr);
    UI.renderDailyView();
  } catch (error) {
    console.error('Error updating category sort order:', error);
    showError('Failed to reorder categories');
  }
}

// Update task sort order in database
async function updateTaskSortOrder(taskList, oldIndex, newIndex) {
  try {
    const taskItems = Array.from(taskList.querySelectorAll('.task-item'));
    const taskIds = taskItems.map(item => item.dataset.taskId);
    
    // Update sort_order for all tasks in this category
    const updates = taskIds.map((taskId, index) => ({
      id: taskId,
      sort_order: index
    }));
    
    // Batch update
    for (const update of updates) {
      await supabase
        .from('tasks')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id);
    }
    
    // Refresh the view
    const dateStr = formatDateISO(getViewingDate());
    await loadTasksForDateHandler(dateStr);
    UI.renderDailyView();
  } catch (error) {
    console.error('Error updating task sort order:', error);
    showError('Failed to reorder tasks');
  }
}

function setupEventListeners() {
  const saveNotesBtn = document.getElementById('saveNotesBtn');
  if (saveNotesBtn) {
    saveNotesBtn.addEventListener('click', () => saveDailyNoteHandler(true));
  }
  
  setupNotesAutosave();
  
  // Template selection toggle for preview
  const templateRadios = document.querySelectorAll('input[name="planTemplate"]');
  templateRadios.forEach(radio => {
    radio.addEventListener('change', toggleTemplatePreviewSection);
  });
  
  // Initialize drag-and-drop for daily view
  initializeDragAndDrop();
  
  // Work-suitable filter
  const workSuitableFilter = document.getElementById('workSuitableFilter');
  if (workSuitableFilter) {
    workSuitableFilter.addEventListener('change', (e) => {
      localStorage.setItem('work-suitable-filter', e.target.checked);
      UI.renderDailyView();
    });
  }
  
  // FAB menu toggle
  const fabMain = document.getElementById('fabMain');
  const fabMenu = document.getElementById('fabMenu');
  if (fabMain && fabMenu) {
    fabMain.addEventListener('click', () => {
      const isOpen = fabMenu.style.display === 'flex';
      fabMenu.style.display = isOpen ? 'none' : 'flex';
      fabMain.classList.toggle('open');
    });
    
    // Close FAB menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.fab-container')) {
        fabMenu.style.display = 'none';
        fabMain.classList.remove('open');
      }
    });
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      UI.switchView(btn.dataset.view);
    });
  });

  const prevDayBtn = document.getElementById('prevDay');
  const nextDayBtn = document.getElementById('nextDay');
  if (prevDayBtn) prevDayBtn.addEventListener('click', () => UI.changeDay(-1));
  if (nextDayBtn) nextDayBtn.addEventListener('click', () => UI.changeDay(1));

  const prevWeekBtn = document.getElementById('prevWeek');
  const nextWeekBtn = document.getElementById('nextWeek');
  if (prevWeekBtn) prevWeekBtn.addEventListener('click', () => UI.changeWeek(-1));
  if (nextWeekBtn) nextWeekBtn.addEventListener('click', () => UI.changeWeek(1));

  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => UI.changeMonth(-1));
  if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => UI.changeMonth(1));

  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) settingsBtn.addEventListener('click', UI.showSettingsModal);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  const toggleCatchUpBtn = document.getElementById('toggleCatchUpBtn');
  if (toggleCatchUpBtn) toggleCatchUpBtn.addEventListener('click', UI.toggleCatchUpQueue);

  const addModuleBtn = document.getElementById('addModuleBtn');
  if (addModuleBtn) addModuleBtn.addEventListener('click', UI.showAddModuleModal);

  const useTemplateBtn = document.getElementById('useTemplateBtn');
  const customizeBtn = document.getElementById('customizeBtn');
  if (useTemplateBtn) useTemplateBtn.addEventListener('click', () => submitOnboarding(true));
  if (customizeBtn) customizeBtn.addEventListener('click', () => submitOnboarding(false));
}

// Expose UI functions to window for onclick handlers
window.switchView = UI.switchView;
window.changeDay = UI.changeDay;
window.changeWeek = UI.changeWeek;
window.changeMonth = UI.changeMonth;
window.toggleCategory = UI.toggleCategory;
window.toggleTaskCompletionHandler = UI.toggleTaskCompletionHandler;
window.showSettingsModal = UI.showSettingsModal;
window.closeSettingsModal = UI.closeSettingsModal;
window.showAddModuleModal = UI.showAddModuleModal;
window.showDayTypeEditor = UI.showDayTypeEditor;
window.closeDayTypeEditor = UI.closeDayTypeEditor;
window.saveDayType = UI.saveDayType;
window.viewDayFromWeek = UI.viewDayFromWeek;
window.viewDayFromCalendar = UI.viewDayFromCalendar;
window.removeCatchUpItem = UI.removeCatchUpItemHandler;
window.toggleCatchUpQueue = UI.toggleCatchUpQueue;
window.handleSBAScheduleToggle = UI.handleSBAScheduleToggle;
window.handleTelegramToggle = UI.handleTelegramToggle;
window.deleteSBAScheduleEntryConfirm = UI.deleteSBAScheduleEntryConfirm;
window.deleteTelegramQuestionConfirm = UI.deleteTelegramQuestionConfirm;
window.showSBAPlaceholderModal = UI.showSBAPlaceholderModal;
window.showTelegramPlaceholderModal = UI.showTelegramPlaceholderModal;
window.closePlaceholderModal = UI.closePlaceholderModal;
window.editSBAScheduleEntry = UI.editSBAScheduleEntry;

// Toggle upload format (JSON/CSV)
window.toggleUploadFormat = function() {
  const formatRadios = document.querySelectorAll('input[name="uploadFormat"]');
  let selectedFormat = 'json';
  formatRadios.forEach(radio => {
    if (radio.checked) selectedFormat = radio.value;
  });
  
  const jsonSection = document.getElementById('jsonUploadSection');
  const csvSection = document.getElementById('csvUploadSection');
  const jsonGuide = document.getElementById('jsonFormatGuide');
  const csvGuide = document.getElementById('csvFormatGuide');
  
  if (selectedFormat === 'csv') {
    jsonSection.style.display = 'none';
    csvSection.style.display = 'block';
    jsonGuide.style.display = 'none';
    csvGuide.style.display = 'block';
  } else {
    jsonSection.style.display = 'block';
    csvSection.style.display = 'none';
    jsonGuide.style.display = 'block';
    csvGuide.style.display = 'none';
  }
};

// Parse CSV to JSON
window.parseCSVtoJSON = function(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }
  
  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Parse data rows
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) {
      console.warn(`Row ${i+1} has ${values.length} columns, expected ${headers.length}. Skipping.`);
      continue;
    }
    
    const obj = {};
    headers.forEach((header, index) => {
      let value = values[index];
      
      // Convert boolean strings
      if (value.toLowerCase() === 'true') value = true;
      else if (value.toLowerCase() === 'false') value = false;
      // Remove quotes if present
      else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      obj[header] = value;
    });
    
    result.push(obj);
  }
  
  return result;
};

window.editTelegramQuestionFromDaily = UI.editTelegramQuestionFromDaily;

// Toggle subtopic list visibility
window.toggleSubtopicList = function(moduleId) {
  const listEl = document.getElementById(`subtopics-${moduleId}`);
  const toggleEl = document.getElementById(`toggle-subtopics-${moduleId}`);
  
  if (listEl.classList.contains('collapsed')) {
    listEl.classList.remove('collapsed');
    toggleEl.textContent = '▲ Hide All';
  } else {
    listEl.classList.add('collapsed');
    toggleEl.textContent = '▼ Show All';
  }
};

// Toggle subtopic completion
window.toggleSubtopicCompletion = async function(moduleId, subtopicName, completed) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  try {
    UI.showLoading(true);
    
    // Upsert the subtopic progress
    const { error } = await supabase
      .from('subtopic_progress')
      .upsert({
        user_id: currentUser.id,
        module_id: moduleId,
        subtopic_name: subtopicName,
        completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,module_id,subtopic_name'
      });
    
    if (error) throw error;
    
    // Update the module's completed count
    const { data: progressData, error: countError } = await supabase
      .from('subtopic_progress')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('module_id', moduleId)
      .eq('completed', true);
    
    if (countError) throw countError;
    
    const completedCount = progressData ? progressData.length : 0;
    
    // Update module completed count
    const { error: updateError } = await supabase
      .from('modules')
      .update({ completed: completedCount, updated_at: new Date().toISOString() })
      .eq('id', moduleId)
      .eq('user_id', currentUser.id);
    
    if (updateError) throw updateError;
    
    // Refresh the modules view
    await UI.renderModulesView();
    UI.showLoading(false);
    
    if (completed) {
      showSuccess(`Subtopic marked as complete!`);
    }
  } catch (error) {
    console.error('Error updating subtopic progress:', error);
    showError('Failed to update subtopic: ' + error.message);
    UI.showLoading(false);
  }
};

window.closeSBAModal = UI.closeSBAModal;
window.saveSBATest = UI.saveSBATest;
window.editSBATest = UI.editSBATest;
window.deleteSBATestConfirm = UI.deleteSBATestConfirm;
window.showAddTaskModal = UI.showAddTaskModal;
window.closeTaskModal = UI.closeTaskModal;
window.editTask = UI.editTask;
window.deleteTaskConfirm = UI.deleteTaskConfirm;
window.showRescheduleTaskModal = UI.showRescheduleTaskModal;
window.confirmRescheduleTask = UI.confirmRescheduleTask;
window.showAutoRescheduleModal = UI.showAutoRescheduleModal;
window.executeAutoReschedule = UI.executeAutoReschedule;

// Expose onboarding functions
window.closeOnboardingModal = closeOnboardingModal;
window.submitOnboarding = submitOnboarding;
window.selectAllModules = selectAllModules;
window.deselectAllModules = deselectAllModules;
window.showOnboardingManually = showOnboardingManually;

// Expose auth functions for HTML onclick handlers
window.switchAuthTab = switchAuthTab;
window.handleLogout = handleLogout;

// Expose debug function for troubleshooting
window.debugData = async function(dateStr) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.log('No user logged in');
    return;
  }
  
  const date = dateStr || formatDateISO(new Date());
  console.log('Checking data for date:', date);
  
  try {
    const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', currentUser.id).eq('date', date);
    console.log('✅ Tasks:', tasks?.length || 0, tasks);
    
    const { data: categories } = await supabase.from('task_categories').select('*').eq('user_id', currentUser.id).eq('date', date);
    console.log('✅ Categories:', categories?.length || 0, categories);
    
    const { data: sba } = await supabase.from('sba_schedule').select('*').eq('user_id', currentUser.id).eq('date', date);
    console.log('✅ SBA:', sba?.length || 0, sba);
    
    const { data: telegram } = await supabase.from('telegram_questions').select('*').eq('user_id', currentUser.id).eq('date', date);
    console.log('✅ Telegram:', telegram?.length || 0, telegram);
    
    // Also check app state
    console.log('📦 App state tasks:', appState.tasks[date]);
    console.log('📦 App state SBA:', appState.sbaSchedule[date]);
    console.log('📦 App state Telegram:', appState.telegramQuestions[date]);
  } catch (error) {
    console.error('Error checking data:', error);
  }
};

// Helper to load tasks for a date
async function loadTasksForDateHandler(date) {
  return await UI.loadTasksForDateHandler(date);
}

// Placeholder functions for features
window.showAddSBAModal = () => UI.showAddSBAModal();
window.showAddSBAScheduleEntry = (date) => UI.showAddSBAScheduleEntry(date);
window.showSBABulkUploadModal = () => UI.showSBABulkUploadModal();
window.showSBAPlaceholderModal = () => UI.showSBAPlaceholderModal();
window.loadSBAScheduleView = () => UI.loadSBAScheduleView();
window.showAddTelegramModal = () => UI.showAddTelegramModal();
window.showTelegramBulkUploadModal = () => UI.showTelegramBulkUploadModal();
window.showTelegramPlaceholderModal = () => alert('Telegram placeholder modal coming soon in modular version!');
window.loadTelegramQuestionsView = () => UI.loadTelegramQuestionsView();
window.closeTelegramModal = UI.closeTelegramModal;
window.saveTelegramQuestion = UI.saveTelegramQuestion;
window.editTelegramQuestion = UI.editTelegramQuestion;

// Set the initialization callback for auth module
setInitializeAppCallback(initializeApp);

// Initialize auth system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  setupEventListeners();
  setupKeyboardShortcuts();
  setupSwipeGestures();
  initializeAuth();
});
