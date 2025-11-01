/**
 * Application State Module
 * Centralized state management for the study plan tracker
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
  statsCache: {
    sba: { data: null, timestamp: null },
    telegram: { data: null, timestamp: null },
    overall: { data: null, timestamp: null }
  },
  selectedTasks: new Set(), // For multi-select
  lastSelectedTaskIndex: null, // For shift-click range selection
  multiSelectMode: false,
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

// User Settings
export function getUserSettings() {
  return appState.userSettings;
}

export function setUserSettings(settings) {
  appState.userSettings = settings;
}

// Modules
export function getModules() {
  return appState.modules;
}

export function setModules(modules) {
  appState.modules = modules;
}

export function getModuleById(id) {
  return appState.modules.find(m => m.id === id);
}

export function updateModuleInState(id, updates) {
  const module = appState.modules.find(m => m.id === id);
  if (module) {
    Object.assign(module, updates);
  }
}

// Daily Schedule
export function getDailySchedule() {
  return appState.dailySchedule;
}

export function setDailySchedule(schedule) {
  appState.dailySchedule = schedule;
}

export function getScheduleForDate(dateStr) {
  return appState.dailySchedule[dateStr];
}

export function setScheduleForDate(dateStr, scheduleData) {
  appState.dailySchedule[dateStr] = scheduleData;
}

// Tasks
export function getTasks() {
  return appState.tasks;
}

export function setTasks(tasks) {
  appState.tasks = tasks;
}

export function getTasksForDate(dateStr) {
  return appState.tasks[dateStr] || [];
}

export function setTasksForDate(dateStr, tasks) {
  appState.tasks[dateStr] = tasks;
}

// SBA Schedule
export function getSBASchedule() {
  return appState.sbaSchedule;
}

export function setSBASchedule(schedule) {
  appState.sbaSchedule = schedule;
}

export function getSBAForDate(dateStr) {
  return appState.sbaSchedule[dateStr] || [];
}

export function setSBAForDate(dateStr, sbaEntries) {
  appState.sbaSchedule[dateStr] = sbaEntries;
}

// Telegram Questions
export function getTelegramQuestions() {
  return appState.telegramQuestions;
}

export function setTelegramQuestions(questions) {
  appState.telegramQuestions = questions;
}

export function getTelegramQuestionsForDate(dateStr) {
  return appState.telegramQuestions[dateStr] || [];
}

export function setTelegramQuestionsForDate(dateStr, questions) {
  appState.telegramQuestions[dateStr] = questions;
}

// Daily Notes
export function getDailyNotes() {
  return appState.dailyNotes;
}

export function setDailyNotes(notes) {
  appState.dailyNotes = notes;
}

export function getDailyNoteForDate(dateStr) {
  return appState.dailyNotes[dateStr] || '';
}

export function setDailyNoteForDate(dateStr, note) {
  appState.dailyNotes[dateStr] = note;
}

// Catch-up Queue
export function getCatchUpQueue() {
  return appState.catchUpQueue;
}

export function setCatchUpQueue(queue) {
  appState.catchUpQueue = queue;
}

export function addToCatchUpQueue(item) {
  appState.catchUpQueue.push(item);
}

export function removeFromCatchUpQueue(itemId) {
  appState.catchUpQueue = appState.catchUpQueue.filter(item => item.id !== itemId);
}

// Viewing Date
export function getViewingDate() {
  return appState.viewingDate;
}

export function setViewingDate(date) {
  appState.viewingDate = new Date(date);
}

// Viewing Week Start
export function getViewingWeekStart() {
  return appState.viewingWeekStart;
}

export function setViewingWeekStart(date) {
  appState.viewingWeekStart = date ? new Date(date) : null;
}

// Viewing Month
export function getViewingMonth() {
  return appState.viewingMonth;
}

export function setViewingMonth(date) {
  appState.viewingMonth = new Date(date);
}

// Motivational Messages
export function getRandomMotivationalMessage() {
  const messages = appState.motivationalMessages;
  return messages[Math.floor(Math.random() * messages.length)];
}

// Multi-select state management
export function getSelectedTasks() {
  return appState.selectedTasks;
}

export function toggleTaskSelection(taskId) {
  if (appState.selectedTasks.has(taskId)) {
    appState.selectedTasks.delete(taskId);
  } else {
    appState.selectedTasks.add(taskId);
  }
}

export function clearSelectedTasks() {
  appState.selectedTasks.clear();
  appState.lastSelectedTaskIndex = null;
}

export function setLastSelectedTaskIndex(index) {
  appState.lastSelectedTaskIndex = index;
}

export function getLastSelectedTaskIndex() {
  return appState.lastSelectedTaskIndex;
}

export function setMultiSelectMode(enabled) {
  appState.multiSelectMode = enabled;
  if (!enabled) {
    clearSelectedTasks();
  }
}

export function isMultiSelectMode() {
  return appState.multiSelectMode;
}

