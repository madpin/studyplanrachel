/**
 * Tasks Module
 * Handles task-related utility functions
 */

import { appState } from './state.js';
import { formatDateISO } from './schedule.js';

/**
 * Get task statistics for a date range
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Object} { completed, total, percentage }
 */
export function getTaskStatsForDateRange(startDate, endDate) {
  let completed = 0;
  let total = 0;
  
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = formatDateISO(currentDate);
    const categories = appState.tasks[dateStr] || [];
    
    categories.forEach(cat => {
      const tasksInCategory = cat.tasks || [];
      total += tasksInCategory.length;
      completed += tasksInCategory.filter(t => t.completed).length;
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
}

/**
 * Get tasks completed today
 * @returns {number}
 */
export function getTasksCompletedToday() {
  const today = formatDateISO(new Date());
  const categories = appState.tasks[today] || [];
  
  let completed = 0;
  categories.forEach(cat => {
    const tasksInCategory = cat.tasks || [];
    completed += tasksInCategory.filter(t => t.completed).length;
  });
  
  return completed;
}

/**
 * Get total tasks for today
 * @returns {number}
 */
export function getTotalTasksToday() {
  const today = formatDateISO(new Date());
  const categories = appState.tasks[today] || [];
  
  let total = 0;
  categories.forEach(cat => {
    const tasksInCategory = cat.tasks || [];
    total += tasksInCategory.length;
  });
  
  return total;
}

