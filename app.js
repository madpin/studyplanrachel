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
  formatDateISO
} from './modules/schedule.js';

// Import storage operations
import {
  loadUserSettings,
  loadModules,
  loadDailySchedule,
  seedDailySchedule,
  loadTasksForDate,
  loadDailyNote,
  saveDailyNote,
  loadCatchUpQueue,
  completeOnboarding
} from './modules/storage.js';

// Import UI functions
import * as UI from './modules/ui.js';

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
    alert('Failed to initialize app: ' + error.message);
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

    // Load tasks for current date
    const viewingDate = new Date();
    const categories = await loadTasksForDate(currentUser.id, viewingDate);
    const dateStr = formatDateISO(viewingDate);
    console.log('Loaded tasks for', dateStr, ':', categories);
    setTasks({ ...appState.tasks, [dateStr]: categories });

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

// Save daily note
async function saveDailyNoteHandler() {
  const currentUser = getCurrentUser();
  const viewingDate = appState.viewingDate;
  const notes = document.getElementById('dailyNotes').value;
  
  try {
    await saveDailyNote(currentUser.id, viewingDate, notes);
    const dateStr = formatDateISO(viewingDate);
    setDailyNoteForDate(dateStr, notes);
    
    // Show save confirmation
    const saveBtn = document.getElementById('saveNotesBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saved ✓';
    setTimeout(() => {
      saveBtn.textContent = originalText;
    }, 2000);
  } catch (error) {
    console.error('Error saving daily note:', error);
    alert('Failed to save notes: ' + error.message);
  }
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
  const modulesContainer = document.getElementById('onboardingModules');
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
  document.querySelectorAll('#onboardingModules input[type="checkbox"]').forEach(cb => {
    cb.checked = true;
  });
}

function deselectAllModules() {
  document.querySelectorAll('#onboardingModules input[type="checkbox"]').forEach(cb => {
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
      const checkboxes = document.querySelectorAll('#onboardingModules input[type="checkbox"]:checked');
      selectedModules = Array.from(checkboxes).map(cb => defaultModules[parseInt(cb.value)]);

      if (selectedModules.length === 0) {
        alert('Please select at least one module');
        return;
      }
    }

    UI.showLoading(true);
    closeOnboardingModal();

    // Complete onboarding
    await completeOnboarding(currentUser.id, examDate, tripStart, tripEnd, selectedModules, useTemplate);

    // Seed daily schedule if using template
    if (useTemplate) {
      await seedDailySchedule(currentUser.id, templateDetailedSchedule);
    }

    // Reload app with new data
    await initializeApp();

    UI.showLoading(false);
    alert('Welcome! Your study plan has been set up successfully!');

  } catch (error) {
    console.error('Error completing onboarding:', error);
    UI.showLoading(false);
    alert('Failed to complete setup: ' + error.message);
  }
}

// ==========================================================
// EVENT LISTENERS SETUP
// ==========================================================

function setupEventListeners() {
  // Save notes button
  const saveNotesBtn = document.getElementById('saveNotesBtn');
  if (saveNotesBtn) {
    saveNotesBtn.addEventListener('click', saveDailyNoteHandler);
  }

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

// Expose onboarding functions
window.closeOnboardingModal = closeOnboardingModal;
window.submitOnboarding = submitOnboarding;
window.selectAllModules = selectAllModules;
window.deselectAllModules = deselectAllModules;

// Expose auth functions for HTML onclick handlers
window.switchAuthTab = switchAuthTab;
window.handleLogout = handleLogout;

// Placeholder functions for features not yet fully implemented in modular version
window.showAddSBAModal = () => alert('Add SBA modal coming soon in modular version!');
window.showSBABulkUploadModal = () => alert('SBA bulk upload coming soon in modular version!');
window.showSBAPlaceholderModal = () => alert('SBA placeholder modal coming soon in modular version!');
window.loadSBAScheduleView = () => UI.renderSBAView();
window.showAddTelegramModal = () => alert('Add Telegram modal coming soon in modular version!');
window.showTelegramBulkUploadModal = () => alert('Telegram bulk upload coming soon in modular version!');
window.showTelegramPlaceholderModal = () => alert('Telegram placeholder modal coming soon in modular version!');
window.loadTelegramQuestionsView = () => UI.renderTelegramView();

// ==========================================================
// APP INITIALIZATION
// ==========================================================

// Set the initialization callback for auth module
setInitializeAppCallback(initializeApp);

// Initialize auth system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Setting up app...');
  setupEventListeners();
  initializeAuth();
});

console.log('App module loaded successfully');
