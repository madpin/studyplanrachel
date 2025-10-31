/**
 * Storage Module
 * Handles all Supabase database operations
 * Note: supabase client is initialized globally in config.js
 */

/**
 * Load user settings from Supabase
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export async function loadUserSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error loading user settings:', error);
    throw error;
  }
  
  return data;
}

/**
 * Save user settings to Supabase
 * @param {string} userId
 * @param {Object} settings
 * @returns {Promise<void>}
 */
export async function saveUserSettings(userId, settings) {
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      ...settings
    });
  
  if (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
}

/**
 * Load modules for a user
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function loadModules(userId) {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order');
  
  if (error) {
    console.error('Error loading modules:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Update module in Supabase
 * @param {string} moduleId
 * @param {Object} updates
 * @returns {Promise<void>}
 */
export async function updateModule(moduleId, updates) {
  const { error } = await supabase
    .from('modules')
    .update(updates)
    .eq('id', moduleId);
  
  if (error) {
    console.error('Error updating module:', error);
    throw error;
  }
}

/**
 * Load daily schedule from Supabase
 * @param {string} userId
 * @param {string} startDate - ISO format YYYY-MM-DD
 * @param {string} endDate - ISO format YYYY-MM-DD
 * @returns {Promise<Object>} Object with dates as keys
 */
export async function loadDailySchedule(userId, startDate, endDate) {
  const { data, error} = await supabase
    .from('daily_schedule')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate);
  
  if (error) {
    console.error('Error loading daily schedule:', error);
    throw error;
  }
  
  // Convert array to object with dates as keys
  const scheduleMap = {};
  (data || []).forEach(entry => {
    scheduleMap[entry.date] = {
      topics: entry.topics,
      type: entry.type,
      resources: entry.resources
    };
  });
  
  return scheduleMap;
}

/**
 * Save daily schedule entry to Supabase
 * @param {string} userId
 * @param {string} date - ISO format YYYY-MM-DD
 * @param {Object} scheduleData - { topics, type, resources }
 * @returns {Promise<void>}
 */
export async function saveDailyScheduleEntry(userId, date, scheduleData) {
  const { error } = await supabase
    .from('daily_schedule')
    .upsert({
      user_id: userId,
      date: date,
      topics: scheduleData.topics,
      type: scheduleData.type,
      resources: scheduleData.resources
    });
  
  if (error) {
    console.error('Error saving daily schedule:', error);
    throw error;
  }
}

/**
 * Bulk upsert daily schedule
 * @param {string} userId
 * @param {Object} scheduleMap - Object with dates as keys
 * @returns {Promise<void>}
 */
export async function bulkUpsertDailySchedule(userId, scheduleMap) {
  const entries = Object.keys(scheduleMap).map(date => ({
    user_id: userId,
    date: date,
    topics: scheduleMap[date].topics,
    type: scheduleMap[date].type,
    resources: scheduleMap[date].resources
  }));
  
  const { error } = await supabase
    .from('daily_schedule')
    .upsert(entries);
  
  if (error) {
    console.error('Error bulk upserting daily schedule:', error);
    throw error;
  }
}

/**
 * Load tasks for a specific date
 * @param {string} userId
 * @param {string} date - ISO format YYYY-MM-DD
 * @returns {Promise<Array>}
 */
export async function loadTasksForDate(userId, date) {
  const { data, error } = await supabase
    .from('task_categories')
    .select('*, tasks(*)')
    .eq('user_id', userId)
    .eq('date', date)
    .order('sort_order');
  
  if (error) {
    console.error('Error loading tasks:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Toggle task completion
 * @param {string} taskId
 * @param {boolean} completed
 * @returns {Promise<void>}
 */
export async function updateTaskCompletion(taskId, completed) {
  const { error } = await supabase
    .from('tasks')
    .update({ completed })
    .eq('id', taskId);
  
  if (error) {
    console.error('Error updating task completion:', error);
    throw error;
  }
}

/**
 * Load daily note
 * @param {string} userId
 * @param {string} date - ISO format YYYY-MM-DD
 * @returns {Promise<string>}
 */
export async function loadDailyNote(userId, date) {
  const { data, error } = await supabase
    .from('daily_notes')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error loading daily note:', error);
    throw error;
  }
  
  return data ? data.notes : '';
}

/**
 * Save daily note
 * @param {string} userId
 * @param {string} date - ISO format YYYY-MM-DD
 * @param {string} notes
 * @returns {Promise<void>}
 */
export async function saveDailyNote(userId, date, notes) {
  const { error } = await supabase
    .from('daily_notes')
    .upsert({
      user_id: userId,
      date: date,
      notes: notes
    });
  
  if (error) {
    console.error('Error saving daily note:', error);
    throw error;
  }
}

/**
 * Load catch-up queue
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function loadCatchUpQueue(userId) {
  const { data, error } = await supabase
    .from('catch_up_queue')
    .select('*')
    .eq('user_id', userId)
    .order('new_date');
  
  if (error) {
    console.error('Error loading catch-up queue:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Remove catch-up queue item
 * @param {string} itemId
 * @returns {Promise<void>}
 */
export async function removeCatchUpItem(itemId) {
  const { error } = await supabase
    .from('catch_up_queue')
    .delete()
    .eq('id', itemId);
  
  if (error) {
    console.error('Error removing catch-up item:', error);
    throw error;
  }
}

/**
 * Load SBA schedule for a date range
 * @param {string} userId
 * @param {string} startDate - ISO format YYYY-MM-DD
 * @param {string} endDate - ISO format YYYY-MM-DD
 * @returns {Promise<Object>} Object with dates as keys
 */
export async function loadSBASchedule(userId, startDate, endDate) {
  const { data, error } = await supabase
    .from('sba_schedule')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate);
  
  if (error) {
    console.error('Error loading SBA schedule:', error);
    throw error;
  }
  
  // Group by date
  const scheduleMap = {};
  (data || []).forEach(entry => {
    if (!scheduleMap[entry.date]) {
      scheduleMap[entry.date] = [];
    }
    scheduleMap[entry.date].push(entry);
  });
  
  return scheduleMap;
}

/**
 * Update SBA schedule entry completion
 * @param {string} entryId
 * @param {boolean} completed
 * @returns {Promise<void>}
 */
export async function updateSBACompletion(entryId, completed) {
  const { error } = await supabase
    .from('sba_schedule')
    .update({ completed })
    .eq('id', entryId);
  
  if (error) {
    console.error('Error updating SBA completion:', error);
    throw error;
  }
}

/**
 * Load all tasks for a user (for progress calculation)
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function loadAllTasks(userId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error loading all tasks:', error);
    throw error;
  }
  
  return data || [];
}

