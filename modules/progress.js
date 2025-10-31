/**
 * Progress Module
 * Handles progress calculations for tasks, modules, SBA, and Telegram questions
 */

import { appState, getTasksForDate } from './state.js';
import { formatDateISO } from './schedule.js';
import { loadSBATests, loadTelegramQuestions } from './storage.js';

// ============================================
// Overall Progress
// ============================================

/**
 * Calculate overall progress (only counts tasks up to today)
 * @returns {Object} { completed, total, percentage }
 */
export function calculateOverallProgress() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let totalTasks = 0;
  let completedTasks = 0;
  
  Object.keys(appState.tasks).forEach(dateStr => {
    const taskDate = new Date(dateStr);
    taskDate.setHours(0, 0, 0, 0);
    
    // Only count tasks up to and including today
    if (taskDate <= today) {
      const categories = appState.tasks[dateStr] || [];
      categories.forEach(cat => {
        const tasksInCategory = cat.tasks || [];
        totalTasks += tasksInCategory.length;
        completedTasks += tasksInCategory.filter(t => t.completed).length;
      });
    }
  });

  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return { completed: completedTasks, total: totalTasks, percentage };
}

// ============================================
// Module Progress
// ============================================

/**
 * Get module progress stats (combines task completion + manual subtopics)
 * @param {Object} module - Module object with id, subtopics, completed
 * @param {Object} stats - Task stats for the module
 * @returns {Object} Combined progress info
 */
export function calculateModuleProgress(module, stats) {
  // Calculate manual subtopic progress
  const manualProgress = module.subtopics > 0 ?
    Math.round((module.completed / module.subtopics) * 100) : 0;
  
  // Calculate task-based progress
  const taskProgress = stats.totalTasks > 0 ?
    Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  
  // Combined progress: average of both if tasks exist, otherwise use manual only
  const combinedProgress = stats.totalTasks > 0 ?
    Math.round((manualProgress + taskProgress) / 2) : manualProgress;

  return {
    manualProgress,
    taskProgress,
    combinedProgress,
    ...stats
  };
}

// ============================================
// SBA Progress
// ============================================

/**
 * Calculate SBA progress
 * @returns {Object} { completed, total, percentage }
 */
export function calculateSBAProgress() {
  let completed = 0;
  let total = 0;
  
  // Count all SBA schedule entries
  Object.keys(appState.sbaSchedule).forEach(dateKey => {
    const sbaItems = appState.sbaSchedule[dateKey];
    if (Array.isArray(sbaItems)) {
      sbaItems.forEach(item => {
        total++;
        if (item.completed) {
          completed++;
        }
      });
    }
  });
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
}

/**
 * Update SBA header stats
 * @param {string} userId - User ID
 * @returns {Promise<Object>} SBA stats
 */
export async function updateSBAHeaderStats(userId) {
  try {
    const tests = await loadSBATests(userId);
    const totalCompleted = tests.reduce((sum, test) => sum + test.completed, 0);
    const totalDays = tests.reduce((sum, test) => sum + test.total_days, 0);
    const percentage = totalDays > 0 ? Math.round((totalCompleted / totalDays) * 100) : 0;
    
    return { completed: totalCompleted, total: totalDays, percentage };
  } catch (error) {
    console.error('Error updating SBA header stats:', error);
    return { completed: 0, total: 0, percentage: 0 };
  }
}

// ============================================
// Telegram Progress
// ============================================

/**
 * Calculate Telegram questions progress
 * @returns {number} Number of completed questions
 */
export function calculateTelegramProgress() {
  let completed = 0;
  
  // Count all telegram questions
  Object.keys(appState.telegramQuestions).forEach(dateKey => {
    const questions = appState.telegramQuestions[dateKey];
    if (Array.isArray(questions)) {
      completed += questions.filter(q => q.completed && !q.is_placeholder).length;
    }
  });
  
  return completed;
}

/**
 * Update Telegram header stats
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of completed questions
 */
export async function updateTelegramHeaderStats(userId) {
  try {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2026-12-31');
    const questions = await loadTelegramQuestions(userId, startDate, endDate);
    const completed = questions.filter(q => q.completed && !q.is_placeholder).length;
    
    return completed;
  } catch (error) {
    console.error('Error updating Telegram header stats:', error);
    return 0;
  }
}

// ============================================
// Catch-up Queue Stats
// ============================================

/**
 * Calculate catch-up queue stats
 * @returns {Object} { total, overdue }
 */
export function calculateCatchUpStats() {
  const total = appState.catchUpQueue.length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdue = appState.catchUpQueue.filter(item => {
    const itemDate = new Date(item.new_date);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate < today;
  }).length;
  
  return { total, overdue };
}

