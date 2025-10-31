/**
 * Tasks Module
 * Handles task generation, completion tracking, and task-related operations
 */

import { appState } from './state.js';
import { getScheduleForDate, getDayType } from './schedule.js';
import { getCatchUpQueue } from './state.js';

/**
 * Generate task key for storage
 * @param {string} dateStr - Date in ISO format (YYYY-MM-DD)
 * @param {number} categoryIndex
 * @param {number} itemIndex
 * @returns {string}
 */
export function getTaskKey(dateStr, categoryIndex, itemIndex) {
  return `${dateStr}-${categoryIndex}-${itemIndex}`;
}

/**
 * Check if a task is completed
 * @param {string} dateStr
 * @param {number} categoryIndex
 * @param {number} itemIndex
 * @returns {boolean}
 */
export function isTaskCompleted(dateStr, categoryIndex, itemIndex) {
  const key = getTaskKey(dateStr, categoryIndex, itemIndex);
  const tasksForDate = appState.tasks[dateStr] || {};
  return tasksForDate[key] === true;
}

/**
 * Toggle task completion status
 * @param {string} dateStr
 * @param {number} categoryIndex
 * @param {number} itemIndex
 * @returns {boolean} - New completion status
 */
export function toggleTaskCompletion(dateStr, categoryIndex, itemIndex) {
  const key = getTaskKey(dateStr, categoryIndex, itemIndex);
  
  if (!appState.tasks[dateStr]) {
    appState.tasks[dateStr] = {};
  }
  
  const currentStatus = appState.tasks[dateStr][key] || false;
  appState.tasks[dateStr][key] = !currentStatus;
  
  return appState.tasks[dateStr][key];
}

/**
 * Get all tasks for a specific date
 * @param {Date} date
 * @returns {Array} Array of task categories
 */
export function getDailyTasks(date) {
  const dateStr = date.toISOString().split('T')[0];
  const dayData = getScheduleForDate(date);
  const dayType = getDayType(date);
  
  if (!dayData) {
    return [{
      category: 'No specific schedule available',
      time: 'N/A',
      items: []
    }];
  }
  
  const specificTopics = dayData.topics || [];
  const resources = dayData.resources || [];
  const isBrazil = dayType === 'trip' || dayType === 'trip-end';
  const isWork = dayType === 'work';
  
  const tasks = [];
  
  // Check for catch-up tasks
  const catchUpTasks = getCatchUpQueue().filter(item => item.newDate === dateStr);
  if (catchUpTasks.length > 0) {
    catchUpTasks.forEach(catchUp => {
      tasks.push({
        category: `⚠️ CATCH-UP: ${catchUp.originalTopic}`,
        time: catchUp.time,
        isCatchUp: true,
        originalDate: catchUp.originalDate,
        items: catchUp.items || []
      });
    });
  }
  
  // Generate tasks based on day type
  if (isBrazil) {
    if (resources.length === 0) {
      tasks.push({
        category: '🌴 Brazil Trip - Rest Day',
        time: 'No study scheduled',
        items: [
          { name: 'Enjoy your trip! No study required today.', time: '0 min', workSuitable: true }
        ]
      });
    } else {
      specificTopics.forEach(topic => {
        tasks.push({
          category: topic,
          time: '0-30 min (optional)',
          items: resources.map(r => ({
            name: r,
            time: '10-15 min',
            workSuitable: true
          }))
        });
      });
    }
  } else if (dayType === 'rest' || dayType === 'exam-eve') {
    specificTopics.forEach(topic => {
      tasks.push({
        category: topic,
        time: '30-60 min total',
        items: resources.map(r => ({
          name: r,
          time: '15-30 min',
          workSuitable: true
        }))
      });
    });
  } else {
    specificTopics.forEach(topic => {
      const categoryTasks = [];
      
      if (isWork) {
        // Work day - ONE specific topic only, minimal resources
        if (resources.includes('Lecture Summary')) {
          categoryTasks.push({ name: 'Lecture Summary', time: '20-30 min', workSuitable: true });
        }
        if (resources.includes('Podcast')) {
          categoryTasks.push({ name: 'Podcast', time: '20-30 min', workSuitable: true });
        }
        if (resources.includes('Telegram Q')) {
          categoryTasks.push({ name: 'Telegram Questions', time: '15-20 min', workSuitable: true });
        }
      } else if (dayType === 'off' || dayType === 'intensive' || dayType === 'intensive-post') {
        // Full study day - comprehensive approach
        if (resources.includes('Lecture Summary')) {
          categoryTasks.push({ name: 'Lecture Summary/Notes', time: '30-45 min', workSuitable: false });
        }
        if (resources.includes('Video')) {
          categoryTasks.push({ name: 'Video Lecture', time: '45-60 min', workSuitable: false });
        }
        if (resources.includes('Podcast')) {
          categoryTasks.push({ name: 'Podcast', time: '30-45 min', workSuitable: true });
        }
        if (resources.includes('Course Questions')) {
          categoryTasks.push({ name: 'Practice Questions', time: '30-45 min', workSuitable: true });
        }
        if (resources.includes('Telegram Q')) {
          categoryTasks.push({ name: 'Telegram Questions', time: '30-45 min', workSuitable: true });
        }
        categoryTasks.push({ name: 'Create Summary/Flashcards', time: '20-30 min', workSuitable: false });
      } else if (dayType === 'revision') {
        // Revision day - mock exam focus
        if (resources.includes('Full Mock Exam')) {
          categoryTasks.push({ name: 'Full Mock Exam', time: '90-120 min', workSuitable: false });
        }
        if (resources.includes('Mock Exam option')) {
          categoryTasks.push({ name: 'Mock Exam (optional)', time: '90 min', workSuitable: false });
        }
        categoryTasks.push({ name: 'Review incorrect answers', time: '30-45 min', workSuitable: true });
        if (resources.includes('Lecture Summary')) {
          categoryTasks.push({ name: 'Lecture Summary review', time: '20-30 min', workSuitable: true });
        }
        if (resources.includes('Telegram Q')) {
          categoryTasks.push({ name: 'Telegram Questions', time: '20-30 min', workSuitable: true });
        }
      }
      
      if (categoryTasks.length > 0) {
        tasks.push({
          category: topic,
          time: isWork ? '50-60 min' : (dayType === 'revision' ? '2-3 hours' : '2-3 hours'),
          items: categoryTasks
        });
      }
    });
  }
  
  // Add Telegram groups section (unless it's a complete rest day)
  if (!isBrazil || resources.length > 0) {
    if (dayType === 'rest' || dayType === 'exam-eve') {
      tasks.push({
        category: '📱 Telegram Questions (Optional)',
        time: '20-30 min',
        items: [
          { name: 'MRCOG Study Group Questions (5-10 questions)', time: '10-15 min', workSuitable: true },
          { name: 'MRCOG Intensive Hour Study Group Questions (5-10 questions)', time: '10-15 min', workSuitable: true }
        ]
      });
    } else if (dayType !== 'trip') {
      tasks.push({
        category: '📱 Daily Telegram Questions',
        time: isWork ? '40-60 min' : '60-90 min',
        items: [
          { name: 'MRCOG Study Group Questions (~10 questions)', time: '30-45 min', workSuitable: true },
          { name: 'MRCOG Intensive Hour Study Group Questions (~10 questions)', time: '30-45 min', workSuitable: true }
        ]
      });
    }
  }
  
  // Add SBA tests if scheduled for this day
  const sbaTests = getSBATestsForDate(date);
  if (sbaTests.length > 0) {
    const sbaItems = sbaTests.map(test => ({
      name: test,
      time: '15-20 min',
      workSuitable: true,
      isSBA: true,
      sbaKey: `${dateStr}-${test}`
    }));
    
    tasks.push({
      category: '📋 Daily SBA Test',
      time: '15-20 min',
      items: sbaItems,
      isSBA: true
    });
  }
  
  return tasks;
}

/**
 * Get SBA tests for a specific date
 * @param {Date} date
 * @returns {Array<string>}
 */
function getSBATestsForDate(date) {
  const dateStr = date.toISOString().split('T')[0];
  const sbaData = appState.sbaSchedule[dateStr];
  
  if (!sbaData) return [];
  
  // If it's an array of strings (old format)
  if (Array.isArray(sbaData)) {
    return sbaData.filter(item => typeof item === 'string');
  }
  
  return [];
}

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
    const dateStr = currentDate.toISOString().split('T')[0];
    const tasksForDate = appState.tasks[dateStr];
    
    if (tasksForDate && typeof tasksForDate === 'object') {
      Object.keys(tasksForDate).forEach(taskKey => {
        total++;
        if (tasksForDate[taskKey] === true) {
          completed++;
        }
      });
    }
    
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
  const today = new Date().toISOString().split('T')[0];
  const tasksForDate = appState.tasks[today] || {};
  
  return Object.values(tasksForDate).filter(v => v === true).length;
}

/**
 * Get total tasks for today
 * @returns {number}
 */
export function getTotalTasksToday() {
  const today = new Date();
  const tasks = getDailyTasks(today);
  
  let total = 0;
  tasks.forEach(category => {
    total += category.items.length;
  });
  
  return total;
}

/**
 * Clear all task completions for a specific date
 * @param {string} dateStr
 */
export function clearTasksForDate(dateStr) {
  delete appState.tasks[dateStr];
}

/**
 * Get all completed task keys for a date
 * @param {string} dateStr
 * @returns {Array<string>}
 */
export function getCompletedTaskKeys(dateStr) {
  const tasksForDate = appState.tasks[dateStr] || {};
  return Object.keys(tasksForDate).filter(key => tasksForDate[key] === true);
}

