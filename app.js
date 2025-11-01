/**
 * Main Application Entry Point
 * Coordinates all modules and manages application lifecycle
 */

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

// ==========================================================
// GLOBAL STATE
// ==========================================================

let hasInitialized = false;

// ==========================================================
// INITIALIZATION
// ==========================================================

async function initializeApp() {
  try {
    console.log('Step 1: Showing loading indicator');
    UI.showLoading(true);

    console.log('Step 2: Checking for user settings...');
    const currentUser = getCurrentUser();
    console.log('Current user ID:', currentUser.id);

    // Check if user has settings (first-time user check)
    const settings = await loadUserSettings(currentUser.id);

    if (!settings) {
      // First-time user - show onboarding
      console.log('Step 3: First-time user detected, showing onboarding...');
      UI.showLoading(false);
      showOnboardingModal();
      return;
    }

    console.log('Step 3: Existing user, loading settings');
    setUserSettings(settings);

    console.log('Step 4: Loading all user data...');
    await loadAllData();

    console.log('Step 5: Updating UI...');
    UI.updateHeaderStats();
    UI.updateMotivationalBanner();
    UI.updateCatchUpQueue();
    
    // Switch to daily view (this will render it and make it visible)
    await UI.switchView('daily');
    
    console.log('Step 6: Loading daily note...');
    await loadDailyNoteHandler();

    UI.showLoading(false);
    console.log('App initialization complete!');

  } catch (error) {
    console.error('Error initializing app:', error);
    UI.showLoading(false);
    showError('Failed to initialize app: ' + error.message);
  }
}

// Load all user data
async function loadAllData() {
  const currentUser = getCurrentUser();
  
  try {
    // Load modules
    const modules = await loadModules(currentUser.id);
    setModules(modules);

    // Load daily schedule
    const scheduleMap = await loadDailySchedule(currentUser.id);
    
    // If no schedule in database, use template
    if (Object.keys(scheduleMap).length === 0) {
      console.log('No schedule in database, using template');
      Object.keys(templateDetailedSchedule).forEach(date => {
        setDailySchedule({ ...appState.dailySchedule, [date]: templateDetailedSchedule[date] });
      });
    } else {
      setDailySchedule(scheduleMap);
    }

    // Load ALL tasks up to today for accurate progress calculation
    const allTasksToToday = await loadAllTasksToToday(currentUser.id);
    // Store in appState for progress calculation
    Object.keys(allTasksToToday).forEach(dateStr => {
      setTasks({ ...appState.tasks, [dateStr]: allTasksToToday[dateStr] });
    });

    // Load tasks for current date (may already be loaded above)
    const viewingDate = new Date();
    const dateStr = formatDateISO(viewingDate);
    if (!appState.tasks[dateStr]) {
      const categories = await loadTasksForDate(currentUser.id, viewingDate);
      console.log('Loaded tasks for', dateStr, ':', categories);
      setTasks({ ...appState.tasks, [dateStr]: categories });
    }

    // Load catch-up queue
    const catchUpQueue = await loadCatchUpQueue(currentUser.id);
    setCatchUpQueue(catchUpQueue);

    // Load SBA and Telegram for current date
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

// Load daily note
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

// Debounce timer for autosave
let notesAutosaveTimer = null;

// Save daily note
async function saveDailyNoteHandler(showFeedback = true) {
  const currentUser = getCurrentUser();
  const viewingDate = appState.viewingDate;
  const notes = document.getElementById('dailyNotes').value;
  
  try {
    await saveDailyNote(currentUser.id, viewingDate, notes);
    const dateStr = formatDateISO(viewingDate);
    setDailyNoteForDate(dateStr, notes);
    
    if (showFeedback) {
      // Show save confirmation
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

// Autosave notes with debounce
function setupNotesAutosave() {
  const notesTextarea = document.getElementById('dailyNotes');
  if (!notesTextarea) return;
  
  notesTextarea.addEventListener('input', () => {
    // Clear existing timer
    if (notesAutosaveTimer) {
      clearTimeout(notesAutosaveTimer);
    }
    
    // Set new timer for 800ms
    notesAutosaveTimer = setTimeout(() => {
      saveDailyNoteHandler(false); // false = no visual feedback for autosave
    }, 800);
  });
}

// ==========================================================
// ONBOARDING
// ==========================================================

function showOnboardingModal() {
  const modal = document.getElementById('onboardingModal');
  if (!modal) {
    console.error('Onboarding modal not found!');
    return;
  }

  // Set default values
  document.getElementById('onboardingExamDate').value = '2026-01-14';
  document.getElementById('onboardingTripStart').value = '2025-12-19';
  document.getElementById('onboardingTripEnd').value = '2025-12-29';

  // Select all modules by default
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
    let examDate, tripStart, tripEnd, selectedModules;

    if (useTemplate) {
      examDate = '2026-01-14';
      tripStart = '2025-12-19';
      tripEnd = '2025-12-29';
      selectedModules = defaultModules;
    } else {
      examDate = document.getElementById('onboardingExamDate').value;
      tripStart = document.getElementById('onboardingTripStart').value || null;
      tripEnd = document.getElementById('onboardingTripEnd').value || null;

      // Get selected modules
      const checkboxes = document.querySelectorAll('#moduleCheckboxes input[type="checkbox"]:checked');
      selectedModules = Array.from(checkboxes).map(cb => defaultModules[parseInt(cb.value)]);

      if (selectedModules.length === 0) {
        showWarning('Please select at least one module');
        return;
      }
    }

    UI.showLoading(true);
    closeOnboardingModal();

    // Complete onboarding (will skip if already exists)
    await completeOnboarding(currentUser.id, examDate, tripStart, tripEnd, selectedModules, useTemplate);

    // Seed daily schedule if using template
    if (useTemplate) {
      console.log('🎯 useTemplate is TRUE - starting seeding process...');
      
      console.log('Seeding daily schedule...');
      await seedDailySchedule(currentUser.id, templateDetailedSchedule);
      console.log('Daily schedule seeded');
      
      // Seed SBA schedule from template
      console.log('Seeding SBA schedule from template...');
      const sbaCount = await seedSBASchedule(currentUser.id, templateSBASchedule);
      console.log(`SBA schedule seeded successfully: ${sbaCount} entries`);
      
      // Seed Telegram questions from template
      console.log('Seeding Telegram questions from template...');
      const telegramCount = await seedTelegramQuestions(currentUser.id, templateDetailedSchedule);
      console.log(`Telegram questions seeded successfully: ${telegramCount} entries`);
      
      // Seed tasks from template schedule (will skip existing days)
      console.log('Seeding tasks from template...');
      const modules = await loadModules(currentUser.id);
      const taskCount = await seedTasksFromTemplate(currentUser.id, templateDetailedSchedule, modules);
      console.log(`Tasks seeded successfully: ${taskCount} tasks`);
    } else {
      console.log('⚠️ useTemplate is FALSE - skipping seeding');
    }

    // Reload app with new data
    await initializeApp();

    UI.showLoading(false);
    showSuccess('Welcome! Your study plan has been set up successfully!');

  } catch (error) {
    console.error('Error completing onboarding:', error);
    UI.showLoading(false);
    showError('Failed to complete setup: ' + error.message);
  }
}

// Function to manually trigger onboarding (useful for re-seeding)
function showOnboardingManually() {
  showOnboardingModal();
}

// ==========================================================
// KEYBOARD SHORTCUTS
// ==========================================================

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in input fields
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    
    if (isTyping && e.key !== 'Escape') {
      return;
    }
    
    // Escape key - close any open modals
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.modal[style*="display: flex"]');
      openModals.forEach(modal => {
        modal.style.display = 'none';
      });
      return;
    }
    
    // Don't proceed if modifier keys are pressed (except for shortcuts that use them)
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    
    // Navigation shortcuts
    switch(e.key) {
      case 'n': // Next day
      case 'ArrowRight':
        e.preventDefault();
        UI.changeDay(1);
        break;
        
      case 'p': // Previous day
      case 'ArrowLeft':
        e.preventDefault();
        UI.changeDay(-1);
        break;
        
      case '1': // Daily view
        e.preventDefault();
        UI.switchView('daily');
        break;
        
      case '2': // Weekly view
        e.preventDefault();
        UI.switchView('weekly');
        break;
        
      case '3': // Calendar view
        e.preventDefault();
        UI.switchView('calendar');
        break;
        
      case '4': // Modules view
        e.preventDefault();
        UI.switchView('modules');
        break;
        
      case '5': // SBA view
        e.preventDefault();
        UI.switchView('sba');
        break;
        
      case '6': // Telegram view
        e.preventDefault();
        UI.switchView('telegram');
        break;
        
      case '?': // Show shortcuts help
        e.preventDefault();
        showKeyboardShortcutsHelp();
        break;
        
      case 'a': // Add task (only in daily view)
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

// ==========================================================
// EVENT LISTENERS SETUP
// ==========================================================

function setupEventListeners() {
  // Save notes button
  const saveNotesBtn = document.getElementById('saveNotesBtn');
  if (saveNotesBtn) {
    saveNotesBtn.addEventListener('click', () => saveDailyNoteHandler(true));
  }
  
  // Setup notes autosave
  setupNotesAutosave();

  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      UI.switchView(btn.dataset.view);
    });
  });

  // Daily view navigation
  const prevDayBtn = document.getElementById('prevDay');
  const nextDayBtn = document.getElementById('nextDay');
  if (prevDayBtn) prevDayBtn.addEventListener('click', () => UI.changeDay(-1));
  if (nextDayBtn) nextDayBtn.addEventListener('click', () => UI.changeDay(1));

  // Weekly view navigation
  const prevWeekBtn = document.getElementById('prevWeek');
  const nextWeekBtn = document.getElementById('nextWeek');
  if (prevWeekBtn) prevWeekBtn.addEventListener('click', () => UI.changeWeek(-1));
  if (nextWeekBtn) nextWeekBtn.addEventListener('click', () => UI.changeWeek(1));

  // Calendar view navigation
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => UI.changeMonth(-1));
  if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => UI.changeMonth(1));

  // Settings button
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) settingsBtn.addEventListener('click', UI.showSettingsModal);

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // Catch-up queue toggle
  const toggleCatchUpBtn = document.getElementById('toggleCatchUpBtn');
  if (toggleCatchUpBtn) toggleCatchUpBtn.addEventListener('click', UI.toggleCatchUpQueue);

  // Add module button
  const addModuleBtn = document.getElementById('addModuleBtn');
  if (addModuleBtn) addModuleBtn.addEventListener('click', UI.showAddModuleModal);

  // Onboarding buttons
  const useTemplateBtn = document.getElementById('useTemplateBtn');
  const customizeBtn = document.getElementById('customizeBtn');
  if (useTemplateBtn) useTemplateBtn.addEventListener('click', () => submitOnboarding(true));
  if (customizeBtn) customizeBtn.addEventListener('click', () => submitOnboarding(false));

  console.log('Event listeners setup complete');
}

// ==========================================================
// EXPOSE FUNCTIONS TO WINDOW FOR ONCLICK HANDLERS
// ==========================================================

// Expose UI functions to window for onclick handlers in HTML
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
window.editSBAScheduleEntry = UI.editSBAScheduleEntry;
window.editTelegramQuestionFromDaily = UI.editTelegramQuestionFromDaily;
window.closeSBAModal = UI.closeSBAModal;
window.saveSBATest = UI.saveSBATest;
window.editSBATest = UI.editSBATest;
window.deleteSBATestConfirm = UI.deleteSBATestConfirm;
window.showAddTaskModal = UI.showAddTaskModal;
window.closeTaskModal = UI.closeTaskModal;
window.editTask = UI.editTask;
window.deleteTaskConfirm = UI.deleteTaskConfirm;

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

// Placeholder functions for features not yet fully implemented in modular version
window.showAddSBAModal = () => UI.showAddSBAModal();
window.showSBABulkUploadModal = () => UI.showSBABulkUploadModal();
window.showSBAPlaceholderModal = () => UI.showSBAPlaceholderModal();
window.loadSBAScheduleView = () => UI.loadSBAScheduleView();
window.showAddTelegramModal = () => UI.showAddTelegramModal();
window.showTelegramBulkUploadModal = () => UI.showTelegramBulkUploadModal();
window.showTelegramPlaceholderModal = () => alert('Telegram placeholder modal coming soon in modular version!');
window.loadTelegramQuestionsView = () => UI.renderTelegramView();
window.closeTelegramModal = UI.closeTelegramModal;
window.saveTelegramQuestion = UI.saveTelegramQuestion;
window.editTelegramQuestion = UI.editTelegramQuestion;

// ==========================================================
// APP INITIALIZATION
// ==========================================================

// Set the initialization callback for auth module
setInitializeAppCallback(initializeApp);

// Initialize auth system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Setting up app...');
  setupEventListeners();
  setupKeyboardShortcuts();
  initializeAuth();
});

console.log('App module loaded successfully');
