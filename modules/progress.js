/**
 * Progress Calculation Module
 * Handles all progress calculations for tasks and modules
 */

import { appState } from './state.js';

/**
 * Calculate overall progress (tasks completed vs total tasks)
 * Only counts tasks up to and including today
 * @returns {Object} { completed, total, percentage }
 */
export function calculateOverallProgress() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let completed = 0;
  let total = 0;
  
  // Iterate through all tasks
  Object.keys(appState.tasks).forEach(dateKey => {
    const taskDate = new Date(dateKey);
    taskDate.setHours(0, 0, 0, 0);
    
    // Only count tasks up to today
    if (taskDate <= today) {
      const tasksForDate = appState.tasks[dateKey];
      
      if (tasksForDate && typeof tasksForDate === 'object') {
        Object.keys(tasksForDate).forEach(taskKey => {
          total++;
          if (tasksForDate[taskKey] === true) {
            completed++;
          }
        });
      }
    }
  });
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
}

/**
 * Extract module name from topic/task text
 * E.g., "Anatomy: Kidneys" -> "Anatomy"
 * @param {string} text
 * @returns {string|null}
 */
function extractModuleName(text) {
  if (!text) return null;
  
  // Check if text contains a colon (module: topic format)
  if (text.includes(':')) {
    const parts = text.split(':');
    return parts[0].trim();
  }
  
  // Check if text matches a known module name
  const knownModules = [
    'Anatomy', 'Genetics', 'Physiology', 'Endocrinology', 'Biochemistry',
    'Embryology', 'Microbiology', 'Immunology', 'Pathology', 'Pharmacology',
    'Clinical Management', 'Biostatistics', 'Data Interpretation'
  ];
  
  for (const moduleName of knownModules) {
    if (text.includes(moduleName)) {
      return moduleName === 'Microbiology' || text.includes('Immunology') 
        ? 'Microbiology & Immunology' 
        : moduleName;
    }
  }
  
  return null;
}

/**
 * Calculate progress for a specific module
 * Based on completed tasks that belong to this module
 * @param {string} moduleName
 * @returns {Object} { completed, total, percentage }
 */
export function calculateModuleProgress(moduleName) {
  let completed = 0;
  let total = 0;
  
  // Iterate through all tasks
  Object.keys(appState.tasks).forEach(dateKey => {
    const tasksForDate = appState.tasks[dateKey];
    
    if (tasksForDate && typeof tasksForDate === 'object') {
      // Get schedule for this date to find topics
      const schedule = appState.dailySchedule[dateKey];
      
      if (schedule && schedule.topics) {
        // Check if any topic in this date belongs to this module
        const hasModuleTopics = schedule.topics.some(topic => {
          const extracted = extractModuleName(topic);
          return extracted === moduleName || 
                 (moduleName === 'Microbiology & Immunology' && 
                  (extracted === 'Microbiology' || extracted === 'Immunology'));
        });
        
        if (hasModuleTopics) {
          // Count tasks for this date
          Object.keys(tasksForDate).forEach(taskKey => {
            total++;
            if (tasksForDate[taskKey] === true) {
              completed++;
            }
          });
        }
      }
    }
  });
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
}

/**
 * Update all module progress in the state
 * This updates the completed count for each module based on task completion
 */
export function updateAllModuleProgress() {
  if (!appState.modules || appState.modules.length === 0) {
    return;
  }
  
  appState.modules.forEach(module => {
    const progress = calculateModuleProgress(module.name);
    
    // Update the module's completed count based on percentage of subtopics
    if (module.subtopics) {
      module.completed = Math.round((progress.percentage / 100) * module.subtopics);
    }
  });
}

/**
 * Get module by name
 * @param {string} moduleName
 * @returns {Object|null}
 */
export function getModuleByName(moduleName) {
  return appState.modules.find(m => m.name === moduleName) || null;
}

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
 * Calculate catch-up queue stats
 * @returns {Object} { total, overdue }
 */
export function calculateCatchUpStats() {
  const total = appState.catchUpQueue.length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdue = appState.catchUpQueue.filter(item => {
    const itemDate = new Date(item.newDate);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate < today;
  }).length;
  
  return { total, overdue };
}

/**
 * Get completion status for all modules
 * @returns {Array} Array of modules with their completion stats
 */
export function getAllModulesProgress() {
  return appState.modules.map(module => {
    const progress = calculateModuleProgress(module.name);
    return {
      name: module.name,
      color: module.color,
      examWeight: module.exam_weight,
      subtopics: module.subtopics,
      completed: module.completed,
      progress: progress.percentage,
      tasksCompleted: progress.completed,
      tasksTotal: progress.total
    };
  });
}

