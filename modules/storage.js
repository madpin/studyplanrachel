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

export async function seedDailySchedule(userId, templateDetailedSchedule) {
  try {
    const scheduleEntries = Object.keys(templateDetailedSchedule).map(date => ({
      user_id: userId,
      date: date,
      topics: templateDetailedSchedule[date].topics,
      type: templateDetailedSchedule[date].type,
      resources: templateDetailedSchedule[date].resources
    }));
    
    const { error } = await supabase
      .from('daily_schedule')
      .upsert(scheduleEntries);
    
    if (error) throw error;
    
    console.log(`Seeded ${scheduleEntries.length} days of schedule`);
  } catch (error) {
    console.error('Error seeding daily schedule:', error);
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
        topics: currentSchedule.topics,
        type: newType,
        resources: currentSchedule.resources
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

export async function loadTasksForDate(userId, date) {
  const dateStr = typeof date === 'string' ? date : formatDateISO(date);
  
  const { data: categories, error } = await supabase
    .from('task_categories')
    .select('*, tasks(*)')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .order('sort_order');

  if (error) throw error;
  return categories || [];
}

export async function toggleTaskCompletion(taskId, completed) {
  const { error } = await supabase
    .from('tasks')
    .update({ completed })
    .eq('id', taskId);

  if (error) throw error;
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

export async function completeOnboarding(userId, examDate, tripStart, tripEnd, selectedModules, useTemplate = false) {
  try {
    // Use template dates if using template
    if (useTemplate) {
      examDate = '2026-01-14';
      tripStart = '2025-12-19';
      tripEnd = '2025-12-29';
    }

    // 1. Create user_settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        exam_date: examDate,
        brazil_trip_start: tripStart,
        brazil_trip_end: tripEnd
      });

    if (settingsError) throw settingsError;

    // 2. Create modules
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

