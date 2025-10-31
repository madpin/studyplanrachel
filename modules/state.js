/**
 * State Management Module
 * Handles application state and state updates
 */

// Application State
export const appState = {
  userSettings: null,
  modules: [],
  dailySchedule: {},
  tasks: {},
  sbaSchedule: {},
  telegramQuestions: {},
  dailyNotes: {},
  catchUpQueue: [],
  viewingDate: new Date(),
  viewingWeekStart: null,
  viewingMonth: new Date(),
  motivationalMessages: [
    "One day at a time - you're doing great!",
    "Small steps lead to big wins!",
    "You've got this!",
    "Every question practiced is one step closer to success!",
    "Progress, not perfection!",
    "You're stronger than you think!",
    "Keep going - you're making it happen!"
  ]
};

/**
 * Initialize application state with user data
 * @param {Object} userData - User data from Supabase
 */
export function initializeState(userData) {
  if (userData.settings) {
    appState.userSettings = userData.settings;
  }
  if (userData.modules) {
    appState.modules = userData.modules;
  }
  if (userData.dailySchedule) {
    appState.dailySchedule = userData.dailySchedule;
  }
  if (userData.tasks) {
    appState.tasks = userData.tasks;
  }
  if (userData.sbaSchedule) {
    appState.sbaSchedule = userData.sbaSchedule;
  }
  if (userData.telegramQuestions) {
    appState.telegramQuestions = userData.telegramQuestions;
  }
  if (userData.dailyNotes) {
    appState.dailyNotes = userData.dailyNotes;
  }
  if (userData.catchUpQueue) {
    appState.catchUpQueue = userData.catchUpQueue;
  }
}

/**
 * Get current viewing date
 * @returns {Date}
 */
export function getViewingDate() {
  return appState.viewingDate;
}

/**
 * Set viewing date
 * @param {Date} date
 */
export function setViewingDate(date) {
  appState.viewingDate = new Date(date);
}

/**
 * Get current viewing week start
 * @returns {Date|null}
 */
export function getViewingWeekStart() {
  return appState.viewingWeekStart;
}

/**
 * Set viewing week start
 * @param {Date} date
 */
export function setViewingWeekStart(date) {
  appState.viewingWeekStart = new Date(date);
}

/**
 * Get current viewing month
 * @returns {Date}
 */
export function getViewingMonth() {
  return appState.viewingMonth;
}

/**
 * Set viewing month
 * @param {Date} date
 */
export function setViewingMonth(date) {
  appState.viewingMonth = new Date(date);
}

/**
 * Get random motivational message
 * @returns {string}
 */
export function getRandomMotivationalMessage() {
  const messages = appState.motivationalMessages;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Add item to catch-up queue
 * @param {Object} item
 */
export function addToCatchUpQueue(item) {
  appState.catchUpQueue.push(item);
}

/**
 * Remove item from catch-up queue
 * @param {number} itemId
 */
export function removeFromCatchUpQueue(itemId) {
  appState.catchUpQueue = appState.catchUpQueue.filter(item => item.id !== itemId);
}

/**
 * Get catch-up queue
 * @returns {Array}
 */
export function getCatchUpQueue() {
  return appState.catchUpQueue;
}

/**
 * Update catch-up queue item
 * @param {number} itemId
 * @param {Object} updates
 */
export function updateCatchUpQueueItem(itemId, updates) {
  const item = appState.catchUpQueue.find(i => i.id === itemId);
  if (item) {
    Object.assign(item, updates);
  }
}

