/**
 * Storage Module
 * Handles all Supabase database operations
 */

import { supabase } from '../config.js';
import { formatDateISO } from './schedule.js';

// ============================================
// User Settings
// ============================================

export async function loadUserSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function saveUserSettings(userId, settings) {
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      exam_date: settings.exam_date,
      brazil_trip_start: settings.brazil_trip_start,
      brazil_trip_end: settings.brazil_trip_end
    });
  
  if (error) throw error;
}

// ============================================
// Daily Schedule
// ============================================

// Clear all seeded data for a user (useful for re-seeding)
export async function clearUserData(userId) {
  try {
    console.log('Clearing existing user data...');
    
    // Delete in order to respect foreign key constraints
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId);
    
    if (tasksError) console.error('Error deleting tasks:', tasksError);
    
    const { error: categoriesError } = await supabase
      .from('task_categories')
      .delete()
      .eq('user_id', userId);
    
    if (categoriesError) console.error('Error deleting task categories:', categoriesError);
    
    const { error: sbaError } = await supabase
      .from('sba_schedule')
      .delete()
      .eq('user_id', userId);
    
    if (sbaError) console.error('Error deleting SBA schedule:', sbaError);
    
    const { error: telegramError } = await supabase
      .from('telegram_questions')
      .delete()
      .eq('user_id', userId);
    
    if (telegramError) console.error('Error deleting Telegram questions:', telegramError);
    
    const { error: scheduleError } = await supabase
      .from('daily_schedule')
      .delete()
      .eq('user_id', userId);
    
    if (scheduleError) console.error('Error deleting daily schedule:', scheduleError);
    
    console.log('User data cleared successfully');
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
}

export async function seedDailySchedule(userId, templateDetailedSchedule) {
  try {
    const scheduleEntries = Object.keys(templateDetailedSchedule).map(date => ({
      user_id: userId,
      date: date,
      topics: templateDetailedSchedule[date].topics || [],
      type: templateDetailedSchedule[date].type || 'off',
      resources: templateDetailedSchedule[date].resources || []
    }));
    
    const { error } = await supabase
      .from('daily_schedule')
      .upsert(scheduleEntries, { 
        onConflict: 'user_id,date',
        ignoreDuplicates: false // Update existing entries
      });
    
    if (error) throw error;
    
    console.log(`Seeded ${scheduleEntries.length} days of schedule`);
  } catch (error) {
    console.error('Error seeding daily schedule:', error);
    throw error;
  }
}

// Seed tasks and categories from template with detailed task generation (from legacy data.js)
export async function seedTasksFromTemplate(userId, templateDetailedSchedule, modules) {
  try {
    let totalTasks = 0;
    let skippedDays = 0;
    
    // Get module lookup by name
    const modulesByName = {};
    modules.forEach(mod => {
      modulesByName[mod.name] = mod.id;
    });
    
    for (const [date, dayData] of Object.entries(templateDetailedSchedule)) {
      const topics = dayData.topics || [];
      const resources = dayData.resources || [];
      const dayType = dayData.type;
      
      if (topics.length === 0) continue; // Skip days with no topics
      
      // Check if tasks already exist for this date - PRESERVE EXISTING
      const { data: existingCategories, error: checkError } = await supabase
        .from('task_categories')
        .select('id')
        .eq('user_id', userId)
        .eq('date', date)
        .limit(1);
      
      if (checkError) {
        console.error(`Error checking existing tasks for ${date}:`, checkError);
        continue;
      }
      
      if (existingCategories && existingCategories.length > 0) {
        console.log(`Skipping ${date} - tasks already exist (preserving your data)`);
        skippedDays++;
        continue; // Skip this date if tasks already exist
      }
      
      const isBrazil = dayType === 'trip' || dayType === 'trip-end';
      const isWork = dayType === 'work';
      const isRest = dayType === 'rest' || dayType === 'exam-eve';
      const isRevision = dayType === 'revision';
      const isIntensive = dayType === 'off' || dayType === 'intensive' || dayType === 'intensive-post';
      
      let sortOrder = 0;
      
      // Generate tasks for each topic based on day type (matching legacy getDailyTasks logic)
      for (const topic of topics) {
        // Extract module name (part before colon)
        const colonIndex = topic.indexOf(':');
        const moduleName = colonIndex > 0 ? topic.substring(0, colonIndex).trim() : topic;
        const topicName = colonIndex > 0 ? topic.substring(colonIndex + 1).trim() : topic;
        
        // Determine category time estimate
        let categoryTime = '2h';
        if (isBrazil && resources.length === 0) categoryTime = '0 min';
        else if (isBrazil) categoryTime = '0-30 min (optional)';
        else if (isRest) categoryTime = '30-60 min total';
        else if (isWork) categoryTime = '50-60 min';
        else if (isRevision) categoryTime = '2-3 hours';
        else if (isIntensive) categoryTime = '2-3 hours';
        
        // Create category
        const { data: category, error: catError } = await supabase
          .from('task_categories')
          .insert({
            user_id: userId,
            date: date,
            category_name: topic,
            time_estimate: categoryTime,
            sort_order: sortOrder++
          })
          .select()
          .single();
        
        if (catError) {
          console.error(`Error creating category for ${date}:`, catError);
          continue;
        }
        
        // Generate tasks based on day type and resources
        const categoryTasks = [];
        
        if (isBrazil && resources.length === 0) {
          // Rest day during trip
          categoryTasks.push({
            task_name: 'Enjoy your trip! No study required today.',
            time_estimate: '0 min',
            work_suitable: true
          });
        } else if (isBrazil) {
          // Optional light study during trip
          resources.forEach(r => {
            categoryTasks.push({
              task_name: r,
              time_estimate: '10-15 min',
              work_suitable: true
            });
          });
        } else if (isRest) {
          // Rest or exam-eve day
          resources.forEach(r => {
            categoryTasks.push({
              task_name: r,
              time_estimate: '15-30 min',
              work_suitable: true
            });
          });
        } else if (isWork) {
          // Work day - minimal resources only
          if (resources.includes('Lecture Summary')) {
            categoryTasks.push({
              task_name: 'Lecture Summary',
              time_estimate: '20-30 min',
              work_suitable: true
            });
          }
          if (resources.includes('Podcast')) {
            categoryTasks.push({
              task_name: 'Podcast',
              time_estimate: '20-30 min',
              work_suitable: true
            });
          }
          if (resources.includes('Telegram Q')) {
            categoryTasks.push({
              task_name: 'Telegram Q',
              time_estimate: '20 min',
              work_suitable: true
            });
          }
        } else if (isRevision) {
          // Revision day - mock exam focus
          if (resources.includes('Full Mock Exam')) {
            categoryTasks.push({
              task_name: 'Full Mock Exam',
              time_estimate: '90-120 min',
              work_suitable: false
            });
          }
          if (resources.includes('Mock Exam option')) {
            categoryTasks.push({
              task_name: 'Mock Exam (optional)',
              time_estimate: '90 min',
              work_suitable: false
            });
          }
          categoryTasks.push({
            task_name: 'Review incorrect answers',
            time_estimate: '30-45 min',
            work_suitable: true
          });
          if (resources.includes('Lecture Summary') || resources.includes('Lecture Summary review')) {
            categoryTasks.push({
              task_name: 'Lecture Summary review',
              time_estimate: '20-30 min',
              work_suitable: true
            });
          }
          if (resources.includes('Podcast')) {
            categoryTasks.push({
              task_name: 'Podcast',
              time_estimate: '20-30 min',
              work_suitable: true
            });
          }
        } else if (isIntensive) {
          // Full study day - comprehensive approach
          if (resources.includes('Lecture Summary')) {
            categoryTasks.push({
              task_name: 'Lecture Summary/Notes',
              time_estimate: '30-45 min',
              work_suitable: false
            });
          }
          if (resources.includes('Video')) {
            categoryTasks.push({
              task_name: 'Video Lecture',
              time_estimate: '45-60 min',
              work_suitable: false
            });
          }
          if (resources.includes('Podcast')) {
            categoryTasks.push({
              task_name: 'Podcast',
              time_estimate: '30-45 min',
              work_suitable: true
            });
          }
          if (resources.includes('Course Questions')) {
            categoryTasks.push({
              task_name: 'Practice Questions',
              time_estimate: '30-45 min',
              work_suitable: true
            });
          }
          categoryTasks.push({
            task_name: 'Create Summary/Flashcards',
            time_estimate: '20-30 min',
            work_suitable: false
          });
        }
        
        // Insert tasks for this category
        if (categoryTasks.length > 0) {
          const tasksToInsert = categoryTasks.map((task, idx) => ({
            user_id: userId,
            category_id: category.id,
            module_id: modulesByName[moduleName] || null,
            date: date,
            task_name: task.task_name,
            time_estimate: task.time_estimate,
            work_suitable: task.work_suitable,
            completed: false,
            sort_order: idx
          }));
          
          const { error: taskError } = await supabase
            .from('tasks')
            .insert(tasksToInsert);
          
          if (taskError) {
            console.error(`Error creating tasks for ${date}:`, taskError);
            continue;
          }
          
          totalTasks += tasksToInsert.length;
        }
      }
    }
    
    const totalDays = Object.keys(templateDetailedSchedule).length;
    const addedDays = totalDays - skippedDays;
    console.log(`Seeded ${totalTasks} tasks across ${addedDays} days (skipped ${skippedDays} existing days to preserve your data)`);
    return totalTasks;
  } catch (error) {
    console.error('Error seeding tasks from template:', error);
    throw error;
  }
}

// Seed SBA schedule from template
export async function seedSBASchedule(userId, templateSBASchedule) {
  try {
    let totalSBA = 0;
    let skipped = 0;
    
    // Collect all dates to check in one query
    const allDates = Object.keys(templateSBASchedule);
    
    // Batch check for existing SBA entries for all dates
    const { data: existingEntries, error: checkError } = await supabase
      .from('sba_schedule')
      .select('date, sba_name')
      .eq('user_id', userId)
      .in('date', allDates);
    
    if (checkError) {
      console.error('Error checking existing SBA entries:', checkError);
      throw checkError;
    }
    
    // Create a Set of existing entries for quick lookup: "date|sba_name"
    const existingSet = new Set(
      (existingEntries || []).map(entry => `${entry.date}|${entry.sba_name}`)
    );
    
    // Prepare SBA entries to insert
    const entriesToInsert = [];
    for (const [date, tests] of Object.entries(templateSBASchedule)) {
      for (const testName of tests) {
        const key = `${date}|${testName}`;
        if (existingSet.has(key)) {
          skipped++;
          continue; // Skip if already exists
        }
        
        entriesToInsert.push({
          user_id: userId,
          date: date,
          sba_name: testName,
          completed: false,
          is_placeholder: false
        });
        totalSBA++;
      }
    }
    
    // Batch insert all new SBA entries
    if (entriesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('sba_schedule')
        .insert(entriesToInsert);
      
      if (insertError) {
        console.error('Error batch inserting SBA entries:', insertError);
        throw insertError;
      }
    }
    
    console.log(`Seeded ${totalSBA} SBA test entries (skipped ${skipped} existing entries)`);
    return totalSBA;
  } catch (error) {
    console.error('Error seeding SBA schedule:', error);
    throw error;
  }
}

// Seed Telegram questions from template schedule
export async function seedTelegramQuestions(userId, templateDetailedSchedule) {
  try {
    let totalQuestions = 0;
    let skipped = 0;
    
    // Collect all dates that have Telegram questions
    const datesToProcess = [];
    for (const [date, dayData] of Object.entries(templateDetailedSchedule)) {
      const resources = dayData.resources || [];
      if (resources.includes('Telegram Q') || resources.includes('Optional Telegram Q')) {
        datesToProcess.push(date);
      }
    }
    
    // Batch check for existing Telegram questions for all dates
    const { data: existingQuestions, error: checkError } = await supabase
      .from('telegram_questions')
      .select('date')
      .eq('user_id', userId)
      .in('date', datesToProcess);
    
    if (checkError) {
      console.error('Error checking existing Telegram questions:', checkError);
      throw checkError;
    }
    
    // Create a Set of dates that already have questions
    const existingDates = new Set(
      (existingQuestions || []).map(q => q.date)
    );
    
    // Prepare entries to insert
    const entriesToInsert = [];
    
    for (const [date, dayData] of Object.entries(templateDetailedSchedule)) {
      const resources = dayData.resources || [];
      const dayType = dayData.type;
      const isBrazil = dayType === 'trip' || dayType === 'trip-end';
      const isRest = dayType === 'rest' || dayType === 'exam-eve';
      
      // Skip days with no Telegram resources or full rest Brazil days
      if (!resources.includes('Telegram Q') && !resources.includes('Optional Telegram Q')) {
        continue;
      }
      
      // Skip if already exists for this date
      if (existingDates.has(date)) {
        skipped++;
        continue;
      }
      
      // Determine entries based on day type
      if (isBrazil && resources.length > 0) {
        // Optional light questions during trip
        entriesToInsert.push({
          user_id: userId,
          date: date,
          question_text: 'Optional Telegram Q (10-20 questions)',
          source: 'Both Groups',
          completed: false,
          is_placeholder: true
        });
        totalQuestions++;
      } else if (isRest) {
        // Rest or exam-eve - optional questions
        entriesToInsert.push({
          user_id: userId,
          date: date,
          question_text: 'MRCOG Study Group Questions (5-10 questions)',
          source: 'MRCOG Study Group',
          completed: false,
          is_placeholder: true
        });
        entriesToInsert.push({
          user_id: userId,
          date: date,
          question_text: 'MRCOG Intensive Hour Study Group Questions (5-10 questions)',
          source: 'MRCOG Intensive Hour Study Group',
          completed: false,
          is_placeholder: true
        });
        totalQuestions += 2;
      } else {
        // Regular study days (work, off, intensive, revision)
        entriesToInsert.push({
          user_id: userId,
          date: date,
          question_text: 'MRCOG Study Group Questions (~10 questions)',
          source: 'MRCOG Study Group',
          completed: false,
          is_placeholder: true
        });
        entriesToInsert.push({
          user_id: userId,
          date: date,
          question_text: 'MRCOG Intensive Hour Study Group Questions (~10 questions)',
          source: 'MRCOG Intensive Hour Study Group',
          completed: false,
          is_placeholder: true
        });
        totalQuestions += 2;
      }
    }
    
    // Batch insert all new Telegram entries
    if (entriesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('telegram_questions')
        .insert(entriesToInsert);
      
      if (insertError) {
        console.error('Error batch inserting Telegram questions:', insertError);
        throw insertError;
      }
    }
    
    console.log(`Seeded ${totalQuestions} Telegram question placeholders (skipped ${skipped} existing dates)`);
    return totalQuestions;
  } catch (error) {
    console.error('Error seeding Telegram questions:', error);
    throw error;
  }
}

export async function loadDailySchedule(userId) {
  try {
    const { data: schedule, error } = await supabase
      .from('daily_schedule')
      .select('*')
      .eq('user_id', userId)
      .gte('date', '2025-11-01')
      .lte('date', '2026-01-13');

    if (error) throw error;

    const scheduleMap = {};
    if (schedule && schedule.length > 0) {
      schedule.forEach(entry => {
        scheduleMap[entry.date] = {
          topics: entry.topics,
          type: entry.type,
          resources: entry.resources
        };
      });
      console.log(`Loaded ${schedule.length} days of schedule from database`);
    }
    
    return scheduleMap;
  } catch (error) {
    console.error('Error loading daily schedule:', error);
    return {};
  }
}

export async function updateDayScheduleType(userId, date, newType, currentSchedule) {
  try {
    if (!currentSchedule) {
      console.warn('No schedule found for date:', date);
      return;
    }

    const { error } = await supabase
      .from('daily_schedule')
      .upsert({
        user_id: userId,
        date: date,
        topics: currentSchedule.topics || [],
        type: newType,
        resources: currentSchedule.resources || []
      });

    if (error) throw error;

    console.log(`Updated day ${date} to type: ${newType}`);
  } catch (error) {
    console.error('Error updating day schedule type:', error);
    throw error;
  }
}

// ============================================
// Modules
// ============================================

export async function loadModules(userId) {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order');

  if (error) throw error;
  return data || [];
}

export async function updateModule(moduleId, updates) {
  const { error } = await supabase
    .from('modules')
    .update(updates)
    .eq('id', moduleId);

  if (error) throw error;
}

// ============================================
// Tasks
// ============================================

// Load all tasks up to today for accurate progress calculation
export async function loadAllTasksToToday(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateISO(today);
  
  // Get start date (e.g., from user settings or default to 3 months ago)
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);
  const startStr = formatDateISO(startDate);
  
  try {
    const { data: categories, error } = await supabase
      .from('task_categories')
      .select('*, tasks(*)')
      .eq('user_id', userId)
      .gte('date', startStr)
      .lte('date', todayStr)
      .order('date', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('sort_order', { foreignTable: 'tasks', ascending: true });

    if (error) throw error;
    
    // Group by date for easier access
    const byDate = {};
    (categories || []).forEach(cat => {
      if (!byDate[cat.date]) {
        byDate[cat.date] = [];
      }
      byDate[cat.date].push(cat);
    });
    
    return byDate;
  } catch (error) {
    console.error('Error loading all tasks to today:', error);
    return {};
  }
}

export async function loadTasksForDate(userId, date) {
  const dateStr = typeof date === 'string' ? date : formatDateISO(date);
  
  const { data: categories, error } = await supabase
    .from('task_categories')
    .select('*, tasks(*)')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .order('sort_order', { ascending: true })
    .order('sort_order', { foreignTable: 'tasks', ascending: true });

  if (error) throw error;
  return categories || [];
}

// Load tasks for a date range (optimized for weekly/calendar views)
export async function loadTasksForDateRange(userId, startDate, endDate) {
  const startStr = typeof startDate === 'string' ? startDate : formatDateISO(startDate);
  const endStr = typeof endDate === 'string' ? endDate : formatDateISO(endDate);
  
  const { data: categories, error } = await supabase
    .from('task_categories')
    .select('*, tasks(*)')
    .eq('user_id', userId)
    .gte('date', startStr)
    .lte('date', endStr)
    .order('date', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('sort_order', { foreignTable: 'tasks', ascending: true });

  if (error) throw error;
  
  // Group by date for easier access
  const byDate = {};
  (categories || []).forEach(cat => {
    if (!byDate[cat.date]) {
      byDate[cat.date] = [];
    }
    byDate[cat.date].push(cat);
  });
  
  return byDate;
}

export async function toggleTaskCompletion(taskId) {
  try {
    // Fetch current completion state
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', taskId)
      .single();

    if (fetchError) throw fetchError;

    // Invert the completion state
    const newCompleted = !task.completed;
    
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ completed: newCompleted })
      .eq('id', taskId);

    if (updateError) throw updateError;
    
    return newCompleted;
  } catch (error) {
    console.error('Error toggling task completion:', error);
    throw error;
  }
}

export async function getModuleProgressStats(userId, moduleId) {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId);

    if (error) throw error;

    const totalTasks = tasks.filter(t => !t.is_placeholder).length;
    const completedTasks = tasks.filter(t => !t.is_placeholder && t.completed).length;
    const placeholders = tasks.filter(t => t.is_placeholder).length;

    return {
      totalTasks,
      completedTasks,
      placeholders,
      percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  } catch (error) {
    console.error('Error getting module progress stats:', error);
    return { totalTasks: 0, completedTasks: 0, placeholders: 0, percentage: 0 };
  }
}

// Create a new task
export async function createTask(userId, data) {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        category_id: data.category_id,
        module_id: data.module_id || null,
        date: data.date,
        task_name: data.task_name,
        time_estimate: data.time_estimate,
        work_suitable: data.work_suitable || false,
        is_placeholder: data.is_placeholder || false,
        completed: false,
        sort_order: data.sort_order || 0
      })
      .select()
      .single();

    if (error) throw error;
    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

// Update a task
export async function updateTask(taskId, data) {
  try {
    const { error } = await supabase
      .from('tasks')
      .update(data)
      .eq('id', taskId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

// Delete a task
export async function deleteTask(taskId) {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

// Create a new task category
export async function createTaskCategory(userId, data) {
  try {
    const { data: category, error } = await supabase
      .from('task_categories')
      .insert({
        user_id: userId,
        date: data.date,
        category_name: data.category_name,
        time_estimate: data.time_estimate,
        sort_order: data.sort_order || 0,
        is_catch_up: data.is_catch_up || false,
        original_date: data.original_date || null
      })
      .select()
      .single();

    if (error) throw error;
    return category;
  } catch (error) {
    console.error('Error creating task category:', error);
    throw error;
  }
}

// ============================================
// Daily Notes
// ============================================

export async function loadDailyNote(userId, date) {
  const dateStr = typeof date === 'string' ? date : formatDateISO(date);
  
  const { data, error } = await supabase
    .from('daily_notes')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? data.notes : '';
}

export async function saveDailyNote(userId, date, notes) {
  const dateStr = typeof date === 'string' ? date : formatDateISO(date);
  
  const { error } = await supabase
    .from('daily_notes')
    .upsert({
      user_id: userId,
      date: dateStr,
      notes: notes
    }, {
      onConflict: 'user_id,date'
    });

  if (error) throw error;
}

// ============================================
// Catch-up Queue
// ============================================

export async function loadCatchUpQueue(userId) {
  const { data, error } = await supabase
    .from('catch_up_queue')
    .select('*')
    .eq('user_id', userId)
    .order('new_date');

  if (error) throw error;
  return data || [];
}

export async function addToCatchUpQueue(userId, item) {
  const { error } = await supabase
    .from('catch_up_queue')
    .insert({
      user_id: userId,
      original_date: item.original_date,
      original_topic: item.original_topic,
      new_date: item.new_date
    });

  if (error) throw error;
}

export async function removeCatchUpItem(itemId) {
  const { error } = await supabase
    .from('catch_up_queue')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

// ============================================
// SBA Tests
// ============================================

export async function loadSBATests(userId) {
  try {
    const { data: tests, error } = await supabase
      .from('sba_tests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');

    if (error) throw error;
    return tests || [];
  } catch (error) {
    console.error('Error loading SBA tests:', error);
    return [];
  }
}

export async function loadSBASchedule(userId, startDate, endDate) {
  try {
    const { data: schedule, error } = await supabase
      .from('sba_schedule')
      .select('*')
      .eq('user_id', userId)
      .gte('date', formatDateISO(startDate))
      .lte('date', formatDateISO(endDate))
      .order('date');

    if (error) throw error;
    return schedule || [];
  } catch (error) {
    console.error('Error loading SBA schedule:', error);
    return [];
  }
}

// Load SBA schedule for date range and group by date
export async function loadSBAScheduleByDate(userId, startDate, endDate) {
  const schedule = await loadSBASchedule(userId, startDate, endDate);
  const byDate = {};
  schedule.forEach(entry => {
    if (!byDate[entry.date]) {
      byDate[entry.date] = [];
    }
    byDate[entry.date].push(entry);
  });
  return byDate;
}

export async function createSBATest(userId, data) {
  try {
    const { data: test, error } = await supabase
      .from('sba_tests')
      .insert({
        user_id: userId,
        test_key: data.test_key,
        name: data.name,
        total_days: data.total_days,
        reading_time: data.reading_time,
        avg_time: data.avg_time,
        completed: 0
      })
      .select()
      .single();

    if (error) throw error;
    return test;
  } catch (error) {
    console.error('Error creating SBA test:', error);
    throw error;
  }
}

export async function updateSBATest(id, data) {
  try {
    const { error } = await supabase
      .from('sba_tests')
      .update(data)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating SBA test:', error);
    throw error;
  }
}

export async function deleteSBATest(id) {
  try {
    const { error } = await supabase
      .from('sba_tests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting SBA test:', error);
    throw error;
  }
}

export async function createSBAScheduleEntry(userId, date, sbaName, isPlaceholder = false) {
  try {
    const dateStr = typeof date === 'string' ? date : formatDateISO(date);
    
    const { data, error } = await supabase
      .from('sba_schedule')
      .insert({
        user_id: userId,
        date: dateStr,
        sba_name: sbaName,
        completed: false,
        is_placeholder: isPlaceholder
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating SBA schedule entry:', error);
    throw error;
  }
}

export async function toggleSBAScheduleCompletion(id) {
  try {
    const { data: entry, error: fetchError } = await supabase
      .from('sba_schedule')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newCompleted = !entry.completed;
    
    const { error: updateError } = await supabase
      .from('sba_schedule')
      .update({ completed: newCompleted })
      .eq('id', id);

    if (updateError) throw updateError;
    
    return newCompleted;
  } catch (error) {
    console.error('Error toggling SBA completion:', error);
    throw error;
  }
}

export async function updateSBATestProgress(userId) {
  try {
    const tests = await loadSBATests(userId);
    
    for (const test of tests) {
      const { count, error } = await supabase
        .from('sba_schedule')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true)
        .ilike('sba_name', `%${test.name}%`);

      if (error) throw error;

      await supabase
        .from('sba_tests')
        .update({ completed: count || 0 })
        .eq('id', test.id);
    }
  } catch (error) {
    console.error('Error updating SBA test progress:', error);
  }
}

export async function deleteSBAScheduleEntry(id) {
  try {
    const { error } = await supabase
      .from('sba_schedule')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting SBA schedule entry:', error);
    throw error;
  }
}

export async function bulkUploadSBA(userId, jsonData) {
  try {
    const entries = jsonData.map(item => ({
      user_id: userId,
      date: item.date,
      sba_name: item.sba_name,
      completed: item.completed || false,
      is_placeholder: item.is_placeholder || false
    }));

    const { error } = await supabase
      .from('sba_schedule')
      .insert(entries);

    if (error) throw error;
    
    return entries.length;
  } catch (error) {
    console.error('Error bulk uploading SBA:', error);
    throw error;
  }
}

// ============================================
// Telegram Questions
// ============================================

export async function loadTelegramQuestions(userId, startDate, endDate) {
  try {
    const { data: questions, error } = await supabase
      .from('telegram_questions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', formatDateISO(startDate))
      .lte('date', formatDateISO(endDate))
      .order('date', { ascending: true });

    if (error) throw error;
    return questions || [];
  } catch (error) {
    console.error('Error loading telegram questions:', error);
    return [];
  }
}

// Load telegram questions for date range and group by date
export async function loadTelegramQuestionsByDate(userId, startDate, endDate) {
  const questions = await loadTelegramQuestions(userId, startDate, endDate);
  const byDate = {};
  questions.forEach(q => {
    if (!byDate[q.date]) {
      byDate[q.date] = [];
    }
    byDate[q.date].push(q);
  });
  return byDate;
}

export async function createTelegramQuestion(userId, data) {
  try {
    const dateStr = typeof data.date === 'string' ? data.date : formatDateISO(data.date);
    
    const { data: question, error } = await supabase
      .from('telegram_questions')
      .insert({
        user_id: userId,
        date: dateStr,
        question_text: data.question_text,
        source: data.source,
        completed: data.completed || false,
        is_placeholder: data.is_placeholder || false
      })
      .select()
      .single();

    if (error) throw error;
    return question;
  } catch (error) {
    console.error('Error creating telegram question:', error);
    throw error;
  }
}

export async function updateTelegramQuestion(id, data) {
  try {
    const { error } = await supabase
      .from('telegram_questions')
      .update(data)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating telegram question:', error);
    throw error;
  }
}

export async function toggleTelegramQuestionCompletion(id) {
  try {
    const { data: question, error: fetchError } = await supabase
      .from('telegram_questions')
      .select('completed')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newCompleted = !question.completed;
    
    const { error: updateError } = await supabase
      .from('telegram_questions')
      .update({ completed: newCompleted })
      .eq('id', id);

    if (updateError) throw updateError;
    
    return newCompleted;
  } catch (error) {
    console.error('Error toggling telegram question:', error);
    throw error;
  }
}

export async function deleteTelegramQuestion(id) {
  try {
    const { error } = await supabase
      .from('telegram_questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting telegram question:', error);
    throw error;
  }
}

export async function bulkUploadTelegramQuestions(userId, jsonData) {
  try {
    const questions = jsonData.map(item => ({
      user_id: userId,
      date: item.date,
      question_text: item.question_text,
      source: item.source || null,
      completed: item.completed || false,
      is_placeholder: item.is_placeholder || false
    }));

    const { error } = await supabase
      .from('telegram_questions')
      .insert(questions);

    if (error) throw error;
    
    return questions.length;
  } catch (error) {
    console.error('Error bulk uploading telegram questions:', error);
    throw error;
  }
}

// ============================================
// Onboarding
// ============================================

export async function completeOnboarding(userId, examDate, tripStart, tripEnd, selectedModules, useTemplate = false, maxStudyMinutes = 480, workDaysPattern = null) {
  try {
    // Use template dates if using template
    if (useTemplate) {
      examDate = '2026-01-14';
      tripStart = '2025-12-19';
      tripEnd = '2025-12-29';
    }

    // Default work days pattern if not provided
    if (!workDaysPattern) {
      workDaysPattern = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      };
    }

    // 1. Create or update user_settings (upsert to handle re-runs)
    const { error: settingsError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        exam_date: examDate,
        brazil_trip_start: tripStart,
        brazil_trip_end: tripEnd,
        max_study_minutes: maxStudyMinutes,
        work_days_pattern: workDaysPattern
      }, {
        onConflict: 'user_id'
      });

    if (settingsError) throw settingsError;

    // 2. Check if modules already exist
    const { data: existingModules, error: checkError } = await supabase
      .from('modules')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (checkError) throw checkError;

    // Only insert modules if they don't exist
    if (!existingModules || existingModules.length === 0) {
      const modulesWithUserId = selectedModules.map((module, index) => ({
        user_id: userId,
        name: module.name,
        exam_weight: module.exam_weight,
        subtopics: module.subtopics,
        completed: 0,
        color: module.color,
        subtopics_list: module.subtopics_list,
        sort_order: index
      }));

      const { error: modulesError } = await supabase
        .from('modules')
        .insert(modulesWithUserId);

      if (modulesError) throw modulesError;
      console.log('Created modules');
    } else {
      console.log('Modules already exist, skipping creation');
    }

    console.log('Onboarding completed successfully');
    return true;

  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
}

// ============================================
// Placeholders
// ============================================

export async function createPlaceholders(userId, dates, type, data = {}) {
  try {
    const results = [];
    
    for (const date of dates) {
      const dateStr = typeof date === 'string' ? date : formatDateISO(new Date(date));
      
      if (type === 'sba') {
        const entry = await createSBAScheduleEntry(
          userId,
          dateStr,
          data.sba_name || 'TBD',
          true
        );
        results.push(entry);
      } else if (type === 'telegram') {
        const question = await createTelegramQuestion(userId, {
          date: dateStr,
          question_text: data.question_text || 'Placeholder - to be added',
          source: data.source || null,
          completed: false,
          is_placeholder: true
        });
        results.push(question);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error creating placeholders:', error);
    throw error;
  }
}

// ============================================
// Reschedule Functions
// ============================================

// Parse time estimate string to minutes
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  
  let minutes = 0;
  const hourMatch = timeStr.match(/(\d+)\s*h/i);
  const minMatch = timeStr.match(/(\d+)\s*m/i);
  
  if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
  if (minMatch) minutes += parseInt(minMatch[1]);
  
  return minutes;
}

// Calculate total time load for a day
async function calculateDayTimeLoad(userId, dateStr) {
  try {
    const categories = await loadTasksForDate(userId, dateStr);
    let totalMinutes = 0;
    
    categories.forEach(cat => {
      totalMinutes += parseTimeToMinutes(cat.time_estimate);
    });
    
    return totalMinutes;
  } catch (error) {
    console.error('Error calculating day time load:', error);
    return 0;
  }
}

// Find next available day for rescheduling
export async function findNextAvailableDay(userId, startDate, maxCapacityMinutes = 180) {
  try {
    const start = new Date(startDate);
    start.setDate(start.getDate() + 1); // Start from tomorrow
    
    // Look up to 60 days ahead
    const maxDays = 60;
    
    for (let i = 0; i < maxDays; i++) {
      const checkDate = new Date(start);
      checkDate.setDate(start.getDate() + i);
      const dateStr = formatDateISO(checkDate);
      
      // Load schedule for this day
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('daily_schedule')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateStr)
        .maybeSingle();
      
      if (scheduleError) continue;
      
      // Check if day type is suitable (off, revision, light)
      if (scheduleData && ['off', 'revision', 'light'].includes(scheduleData.type)) {
        // Check current load
        const currentLoad = await calculateDayTimeLoad(userId, dateStr);
        
        if (currentLoad < maxCapacityMinutes) {
          return {
            date: dateStr,
            currentLoad,
            availableCapacity: maxCapacityMinutes - currentLoad,
            dayType: scheduleData.type
          };
        }
      }
    }
    
    // If no suitable day found, return tomorrow as fallback
    const tomorrow = new Date(start);
    const tomorrowStr = formatDateISO(tomorrow);
    const tomorrowLoad = await calculateDayTimeLoad(userId, tomorrowStr);
    
    return {
      date: tomorrowStr,
      currentLoad: tomorrowLoad,
      availableCapacity: Math.max(0, maxCapacityMinutes - tomorrowLoad),
      dayType: 'off',
      isFallback: true
    };
  } catch (error) {
    console.error('Error finding next available day:', error);
    throw error;
  }
}

// Reschedule a task to a new date
export async function rescheduleTask(userId, taskId, newDate, originalDate) {
  try {
    const newDateStr = typeof newDate === 'string' ? newDate : formatDateISO(newDate);
    const originalDateStr = typeof originalDate === 'string' ? originalDate : formatDateISO(originalDate);
    
    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*, task_categories!inner(category_name)')
      .eq('id', taskId)
      .single();
    
    if (taskError) throw taskError;
    
    // Update task date
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ date: newDateStr })
      .eq('id', taskId);
    
    if (updateError) throw updateError;
    
    // Add to catch-up queue for tracking
    const categoryName = task.task_categories?.category_name || 'Task';
    const { error: queueError } = await supabase
      .from('catch_up_queue')
      .insert({
        user_id: userId,
        original_date: originalDateStr,
        original_topic: `${categoryName}: ${task.task_name}`,
        new_date: newDateStr,
        time_estimate: task.time_estimate,
        items: [{ task_id: taskId, task_name: task.task_name }]
      });
    
    if (queueError) console.warn('Failed to add to catch-up queue:', queueError);
    
    return { success: true, newDate: newDateStr };
  } catch (error) {
    console.error('Error rescheduling task:', error);
    throw error;
  }
}

// Find all missed (incomplete) tasks before today
export async function findMissedTasks(userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDateISO(today);
    
    // Get all incomplete tasks before today
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*, task_categories!inner(category_name, time_estimate)')
      .eq('user_id', userId)
      .eq('completed', false)
      .lt('date', todayStr)
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    return tasks || [];
  } catch (error) {
    console.error('Error finding missed tasks:', error);
    return [];
  }
}

// Auto-reschedule all missed tasks
export async function autoRescheduleMissedTasks(userId, maxCapacityMinutes = 180) {
  try {
    const today = new Date();
    const missedTasks = await findMissedTasks(userId);
    
    if (missedTasks.length === 0) {
      return { rescheduled: 0, tasks: [] };
    }
    
    const reschedulePlan = [];
    let currentScanDate = new Date(today);
    
    // Group tasks by original date
    const tasksByDate = {};
    missedTasks.forEach(task => {
      if (!tasksByDate[task.date]) {
        tasksByDate[task.date] = [];
      }
      tasksByDate[task.date].push(task);
    });
    
    // For each date's tasks, find suitable reschedule dates
    for (const [originalDate, tasks] of Object.entries(tasksByDate)) {
      for (const task of tasks) {
        const taskTime = parseTimeToMinutes(task.time_estimate);
        
        // Find next available day starting from current scan date
        const availableDay = await findNextAvailableDay(userId, formatDateISO(currentScanDate), maxCapacityMinutes);
        
        // Check if this day has enough capacity for this specific task
        if (availableDay.availableCapacity >= taskTime) {
          reschedulePlan.push({
            task,
            originalDate,
            newDate: availableDay.date,
            categoryName: task.task_categories?.category_name || 'Unknown',
            timeEstimate: task.time_estimate
          });
          
          // Update available capacity for this day (for next iteration)
          availableDay.availableCapacity -= taskTime;
        } else {
          // Move scan date forward if current day doesn't have capacity
          currentScanDate = new Date(availableDay.date);
          currentScanDate.setDate(currentScanDate.getDate() + 1);
          
          // Retry finding a day for this task
          const nextDay = await findNextAvailableDay(userId, formatDateISO(currentScanDate), maxCapacityMinutes);
          reschedulePlan.push({
            task,
            originalDate,
            newDate: nextDay.date,
            categoryName: task.task_categories?.category_name || 'Unknown',
            timeEstimate: task.time_estimate
          });
        }
      }
    }
    
    return { rescheduled: 0, plan: reschedulePlan, tasks: missedTasks };
  } catch (error) {
    console.error('Error auto-rescheduling missed tasks:', error);
    throw error;
  }
}

// Execute the reschedule plan
export async function executeReschedulePlan(userId, plan) {
  try {
    let successCount = 0;
    const errors = [];
    
    for (const item of plan) {
      try {
        await rescheduleTask(userId, item.task.id, item.newDate, item.originalDate);
        successCount++;
      } catch (error) {
        errors.push({ task: item.task.task_name, error: error.message });
      }
    }
    
    return { successCount, errors };
  } catch (error) {
    console.error('Error executing reschedule plan:', error);
    throw error;
  }
}


