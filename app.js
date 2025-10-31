// Main Application Logic with Supabase Integration

// Application State
const appState = {
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

// Default data for first-time users (from draft/app.js)
const defaultModules = [
  { name: 'Anatomy', exam_weight: 10, subtopics: 13, color: '#3498db', completed: 0,
    subtopics_list: ['Kidneys, Ureters & Bladder', 'Nerve Injuries', 'Anterior Abdominal Wall', 'Pelvis & Foetal Skull', 'Vagina & Ovaries', 'Vulva', 'Intra-abdominal Organs', 'Perineum, Inguinal & Femoral Canal', 'Inguinal Region', 'Thigh', 'Wisdom Shots', 'Beginners Blueprint Videos', 'Concept Based Videos'] },
  { name: 'Genetics', exam_weight: 5, subtopics: 10, color: '#e74c3c', completed: 0,
    subtopics_list: ['Structure of Chromosome', 'Genetic Disorders', 'Cell Division', 'Genetic Syndrome', 'Gene Abnormalities & Inheritance Patterns', 'How to Interpret Pedigree Charts', 'Chromosomal Abnormalities', 'Genetic Tests and Interpretation of Results', 'Questions', 'Wisdom Shots'] },
  { name: 'Physiology', exam_weight: 8, subtopics: 9, color: '#2ecc71', completed: 0,
    subtopics_list: ['Urinary System & Acid Base Balance', 'Male & Female Reproductive System', 'Cardiac & Respiratory System', 'Physiological Changes in Pregnancy', 'GIT & Nutrition', 'Foetal and Placental', 'Questions', 'Wisdom Shots', 'Beginners Blueprint Video'] },
  { name: 'Endocrinology', exam_weight: 6, subtopics: 10, color: '#f39c12', completed: 0,
    subtopics_list: ['RAAS', 'Placental and Foetal Hormones', 'Thyroid & Parathyroid Hormones', 'Adrenal Hormones', 'Pancreatic Hormones', 'Sex Hormones & Related Conditions', 'Hypothalamic & Pituitary Hormones', 'Wisdom Shots', 'Beginners Blueprint Video', 'Questions'] },
  { name: 'Biochemistry', exam_weight: 8, subtopics: 10, color: '#9b59b6', completed: 0,
    subtopics_list: ['Lipid', 'Nucleic Acids, Hormones and Prostaglandins', 'Vitamins & Minerals', 'Fats', 'Proteins', 'Starvation', 'Carbohydrates', 'Questions', 'General Biochemistry – Cell', 'Wisdom Shots'] },
  { name: 'Embryology', exam_weight: 8, subtopics: 8, color: '#1abc9c', completed: 0,
    subtopics_list: ['Development of Urogenital System', 'Development of Cardiac System', 'Foetal Circulation', 'Early Development of Embryo', 'Development of GIT', 'Development of CNS', 'Wisdom Shots', 'Questions'] },
  { name: 'Microbiology & Immunology', exam_weight: 10, subtopics: 15, color: '#34495e', completed: 0,
    subtopics_list: ['Bacteria', 'Fungi', 'General Immunology & Mediators', 'Immunology of Pregnancy', 'Viruses', 'Protozoa', 'Adaptive/Innate Immunity', 'Perinatal Infections', 'Bacterial Sepsis', 'Vaccines and Immune Response', 'Clinical Application Questions', 'Wisdom Shots', 'Questions'] },
  { name: 'Pathology', exam_weight: 7, subtopics: 8, color: '#c0392b', completed: 0,
    subtopics_list: ['Inflammation', 'Benign Gynae Conditions', 'Cellular Adaptations', 'Coagulation', 'Sepsis & Shock', 'Oncology', 'Wisdom Shots', 'Questions'] },
  { name: 'Pharmacology', exam_weight: 7, subtopics: 9, color: '#16a085', completed: 0,
    subtopics_list: ['NSAIDs', 'Anti-epileptics', 'Antibiotics', 'Antihypertensives', 'Pharmacokinetics in Pregnancy', 'Contraceptives', 'Drugs used in Gynae', 'Wisdom Shots', 'Questions'] },
  { name: 'Clinical Management', exam_weight: 20, subtopics: 19, color: '#2980b9', completed: 0,
    subtopics_list: ['Frase & Guillick', 'Valid Consent', 'Abortion, Ectopic and Mole', 'Management of Labour', 'Management of Women with Rh Antibodies', 'Hypertension in Pregnancy', 'Diabetes in Pregnancy', 'Instruments', 'OASIS', 'CTG New Guideline', 'CTG Interpretation', 'Endometrial Hyperplasia & Endometriosis', 'Ovarian Cysts', 'Heavy Menstrual Bleeding', 'PCOS', 'PID', 'Blueprint Video', 'Wisdom Shots', 'Questions'] },
  { name: 'Biostatistics', exam_weight: 7, subtopics: 14, color: '#8e44ad', completed: 0,
    subtopics_list: ['Variable & Types', 'Study Design', 'Hypothesis Testing', 'Graphs', 'Definition of Biostatistics', 'Inferential Statistics', 'Measures of Central Tendency', 'Probability', 'Odds Ratio, Relative Risk, ARR and NNT', 'Normal Distribution & CI', 'Effect Estimation', 'Diagnostic Accuracy Tests', 'Wisdom Shots', 'Questions'] },
  { name: 'Data Interpretation', exam_weight: 4, subtopics: 8, color: '#d35400', completed: 0,
    subtopics_list: ['ABG Analysis', 'Clinical Governance', 'Haem Abnormalities', 'Urogynaecology', 'Biophysics', 'Spirometry', 'Wisdom Shots', 'Questions'] }
];

// Initialize app (called after authentication)
async function initializeApp() {
  try {
    console.log('Step 1: Showing loading indicator');
    showLoading(true);

    console.log('Step 2: Checking for user settings...');
    console.log('Current user ID:', currentUser.id);

    // Check if user has settings (first-time user check) - with timeout for debugging
    console.log('About to execute settings query...');

    const settingsPromise = supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Settings query timeout after 5 seconds')), 5000)
    );

    const { data: settings, error: settingsError } = await Promise.race([
      settingsPromise,
      timeoutPromise
    ]);

    console.log('Settings query completed!');
    console.log('Settings query result:', { settings, error: settingsError });

    // Check if this is a first-time user (no settings found)
    if (settingsError && (settingsError.code === 'PGRST116' || settingsError.message?.includes('Not Acceptable'))) {
      // First-time user - initialize with default data
      console.log('Step 3: First-time user detected, initializing...');
      await initializeFirstTimeUser();
    } else if (!settings && !settingsError) {
      // No settings but no error - first time user
      console.log('Step 3: First-time user detected (no data), initializing...');
      await initializeFirstTimeUser();
    } else if (settingsError) {
      console.error('Settings error:', settingsError);
      throw settingsError;
    } else {
      console.log('Step 3: Existing user, loading settings');
      appState.userSettings = settings;
    }

    console.log('Step 4: Loading all user data...');
    // Load all user data
    await loadAllData();

    console.log('Step 5: Rendering views...');
    // Render initial view
    updateHeaderStats();
    updateMotivationalBanner();
    renderDailyView();
    updateCatchUpQueue();

    console.log('Step 6: Showing daily view');
    showLoading(false);
    document.getElementById('dailyView').style.display = 'block';

    console.log('App initialization complete!');

  } catch (error) {
    console.error('Error initializing app:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    showLoading(false);
    throw error; // Re-throw so the auth handler can catch it
  }
}

// Initialize first-time user - show onboarding
async function initializeFirstTimeUser() {
  console.log('First-time user detected - showing onboarding...');

  try {
    // Check if settings already exist (edge case)
    const { data: existingSettings, error: fetchError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (existingSettings && !fetchError) {
      console.log('Settings already exist, loading data...');
      appState.userSettings = existingSettings;
      return; // Skip onboarding if settings already exist
    }

    // Show onboarding modal
    showOnboardingModal();

  } catch (error) {
    console.error('Error checking first-time user status:', error);
    throw error;
  }
}

// Generate initial tasks for a user based on their exam date and modules
async function generateInitialTasks(examDate, tripStart, tripEnd, selectedModules) {
  console.log('Generating initial tasks...');
  
  const startDate = new Date(); // Start from today
  const endDate = new Date(examDate);
  const tripStartDate = tripStart ? new Date(tripStart) : null;
  const tripEndDate = tripEnd ? new Date(tripEnd) : null;
  
  // Generate tasks for each day from now until exam
  let currentDate = new Date(startDate);
  let totalCategories = 0;
  let totalTasks = 0;
  
  // Process day by day to properly link categories and tasks
  while (currentDate <= endDate) {
    const dateStr = formatDateISO(currentDate);
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const isTripDay = tripStartDate && tripEndDate && currentDate >= tripStartDate && currentDate <= tripEndDate;
    
    // Determine day type
    let dayType = 'study';
    let timeAllocation = '2-3 hours';
    if (isTripDay) {
      dayType = 'trip';
      timeAllocation = '30-60 min';
    } else if (isWeekend) {
      dayType = 'intensive';
      timeAllocation = '4-5 hours';
    }
    
    // Select modules to study this day (rotate through selected modules)
    const daysFromStart = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
    const moduleIndex = daysFromStart % selectedModules.length;
    const todayModule = selectedModules[moduleIndex];
    
    if (!todayModule) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    // Create category for today's module topics
    const { data: mainCategory, error: mainCatError } = await supabase
      .from('task_categories')
      .insert({
        user_id: currentUser.id,
        date: dateStr,
        category_name: `📚 ${todayModule.name} Study`,
        time_estimate: timeAllocation,
        sort_order: 0
      })
      .select()
      .single();
    
    if (mainCatError) throw mainCatError;
    totalCategories++;
    
    // Generate tasks for this category
    const mainCategoryTasks = [];
    if (isTripDay) {
      // Light tasks during trip
      mainCategoryTasks.push({
        user_id: currentUser.id,
        date: dateStr,
        category_id: mainCategory.id,
        task_name: `${todayModule.name} - Light review`,
        time_estimate: '20-30 min',
        work_suitable: true,
        completed: false,
        sort_order: 0
      });
      mainCategoryTasks.push({
        user_id: currentUser.id,
        date: dateStr,
        category_id: mainCategory.id,
        task_name: 'Practice questions (optional)',
        time_estimate: '10-20 min',
        work_suitable: true,
        completed: false,
        sort_order: 1
      });
    } else {
      // Regular study tasks
      const subtopicsToStudy = todayModule.subtopics_list.slice(0, isWeekend ? 3 : 2);
      subtopicsToStudy.forEach((subtopic, idx) => {
        mainCategoryTasks.push({
          user_id: currentUser.id,
          date: dateStr,
          category_id: mainCategory.id,
          task_name: `${todayModule.name}: ${subtopic}`,
          time_estimate: isWeekend ? '45-60 min' : '30-45 min',
          work_suitable: !isWeekend,
          completed: false,
          sort_order: idx
        });
      });
      
      // Add practice questions
      mainCategoryTasks.push({
        user_id: currentUser.id,
        date: dateStr,
        category_id: mainCategory.id,
        task_name: `${todayModule.name} - Practice questions`,
        time_estimate: '30-45 min',
        work_suitable: true,
        completed: false,
        sort_order: subtopicsToStudy.length
      });
    }
    
    // Insert main category tasks
    if (mainCategoryTasks.length > 0) {
      const { error: mainTasksError } = await supabase
        .from('tasks')
        .insert(mainCategoryTasks);
      
      if (mainTasksError) throw mainTasksError;
      totalTasks += mainCategoryTasks.length;
    }
    
    // Add daily review category
    const { data: reviewCategory, error: reviewCatError } = await supabase
      .from('task_categories')
      .insert({
        user_id: currentUser.id,
        date: dateStr,
        category_name: '🔄 Daily Review',
        time_estimate: '30-45 min',
        sort_order: 1
      })
      .select()
      .single();
    
    if (reviewCatError) throw reviewCatError;
    totalCategories++;
    
    // Insert review tasks
    const reviewTasks = [
      {
        user_id: currentUser.id,
        date: dateStr,
        category_id: reviewCategory.id,
        task_name: 'Review previous day topics',
        time_estimate: '15-20 min',
        work_suitable: true,
        completed: false,
        sort_order: 0
      },
      {
        user_id: currentUser.id,
        date: dateStr,
        category_id: reviewCategory.id,
        task_name: 'Flashcard review',
        time_estimate: '15-20 min',
        work_suitable: true,
        completed: false,
        sort_order: 1
      }
    ];
    
    const { error: reviewTasksError } = await supabase
      .from('tasks')
      .insert(reviewTasks);
    
    if (reviewTasksError) throw reviewTasksError;
    totalTasks += reviewTasks.length;
    
    // Progress logging (every 10 days)
    if (totalCategories % 20 === 0) {
      console.log(`Progress: ${totalCategories} categories, ${totalTasks} tasks created...`);
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log(`Initial tasks generated successfully: ${totalCategories} categories, ${totalTasks} tasks`);
}

// Complete first-time user setup with selected options
async function completeOnboarding(examDate, tripStart, tripEnd, selectedModules) {
  console.log('Completing onboarding with user selections...');

  try {
    // Create user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: currentUser.id,
        exam_date: examDate,
        brazil_trip_start: tripStart || null,
        brazil_trip_end: tripEnd || null
      })
      .select()
      .single();

    if (settingsError) throw settingsError;
    appState.userSettings = settings;
    console.log('User settings created');

    // Create selected modules
    if (selectedModules.length > 0) {
      console.log(`Creating ${selectedModules.length} selected modules...`);
      const modulesData = selectedModules.map((module, index) => ({
        user_id: currentUser.id,
        name: module.name,
        exam_weight: module.exam_weight,
        subtopics: module.subtopics,
        completed: module.completed,
        color: module.color,
        subtopics_list: module.subtopics_list,
        sort_order: index
      }));

      const { error: modulesError } = await supabase
        .from('modules')
        .insert(modulesData);

      if (modulesError) throw modulesError;
      console.log('Modules created successfully');
      
      // Generate initial tasks based on exam date and selected modules
      await generateInitialTasks(examDate, tripStart, tripEnd, selectedModules);
    }

    console.log('Onboarding completed successfully');
    return true;

  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
}

// Load all user data from Supabase
async function loadAllData() {
  try {
    // Load modules
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('sort_order');

    if (modulesError) throw modulesError;
    appState.modules = modules || [];

    // Load tasks for viewing date
    await loadTasksForDate(appState.viewingDate);

    // Load catch-up queue
    const { data: catchUpQueue, error: catchUpError } = await supabase
      .from('catch_up_queue')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('new_date');

    if (catchUpError) throw catchUpError;
    appState.catchUpQueue = catchUpQueue || [];

  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

// Load tasks for a specific date
async function loadTasksForDate(date) {
  const dateStr = formatDateISO(date);

  try {
    // Load task categories for the date
    const { data: categories, error: categoriesError } = await supabase
      .from('task_categories')
      .select('*, tasks(*)')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr)
      .order('sort_order');

    if (categoriesError) throw categoriesError;

    if (!appState.tasks[dateStr]) {
      appState.tasks[dateStr] = [];
    }

    appState.tasks[dateStr] = categories || [];

    // Load SBA schedule entries for the date
    const { data: sbaEntries, error: sbaError } = await supabase
      .from('sba_schedule')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr)
      .order('created_at');

    if (sbaError) throw sbaError;
    
    if (!appState.sbaSchedule) {
      appState.sbaSchedule = {};
    }
    appState.sbaSchedule[dateStr] = sbaEntries || [];

    // Load telegram questions for the date
    const { data: telegramQuestions, error: telegramError } = await supabase
      .from('telegram_questions')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr)
      .order('created_at');

    if (telegramError) throw telegramError;
    
    if (!appState.telegramQuestions) {
      appState.telegramQuestions = {};
    }
    appState.telegramQuestions[dateStr] = telegramQuestions || [];

    // Load daily note
    const { data: note, error: noteError } = await supabase
      .from('daily_notes')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr)
      .maybeSingle();

    if (noteError && noteError.code !== 'PGRST116') throw noteError;

    if (!appState.dailyNotes[dateStr]) {
      appState.dailyNotes[dateStr] = '';
    }

    appState.dailyNotes[dateStr] = note ? note.notes : '';

  } catch (error) {
    console.error('Error loading tasks for date:', error);
  }
}

// Save daily note
let notesSaveTimeout = null;
async function saveDailyNote(date, notes) {
  const dateStr = formatDateISO(date);

  // Debounce saves
  if (notesSaveTimeout) {
    clearTimeout(notesSaveTimeout);
  }

  notesSaveTimeout = setTimeout(async () => {
    try {
      const { error } = await supabase
        .from('daily_notes')
        .upsert({
          user_id: currentUser.id,
          date: dateStr,
          notes: notes
        });

      if (error) throw error;

      appState.dailyNotes[dateStr] = notes;

    } catch (error) {
      console.error('Error saving daily note:', error);
    }
  }, 1000);
}

// Toggle task completion
async function toggleTaskCompletion(taskId) {
  try {
    const dateStr = formatDateISO(appState.viewingDate);
    const categories = appState.tasks[dateStr] || [];

    let task = null;
    for (const category of categories) {
      task = category.tasks.find(t => t.id === taskId);
      if (task) break;
    }

    if (!task) return;

    const newCompleted = !task.completed;

    const { error } = await supabase
      .from('tasks')
      .update({ completed: newCompleted })
      .eq('id', taskId);

    if (error) throw error;

    task.completed = newCompleted;

    // Recalculate module progress
    await updateModuleProgress();

    // Re-render views
    renderDailyView();
    updateHeaderStats();

  } catch (error) {
    console.error('Error toggling task:', error);
  }
}

// Update module progress based on completed tasks
async function updateModuleProgress() {
  try {
    // Get all tasks (excluding placeholders for progress calculation)
    const { data: allTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', currentUser.id);

    if (tasksError) throw tasksError;

    // Calculate completion for each module
    for (const module of appState.modules) {
      // Count completed subtopics based on:
      // 1. Explicit module_id links (primary method)
      // 2. Task name matching subtopics (fallback for backward compatibility)
      const completedSubtopics = new Set();

      for (const task of allTasks) {
        // Skip placeholders for progress calculation
        if (task.is_placeholder) continue;
        
        if (task.completed) {
          // Method 1: Explicit module_id link
          if (task.module_id === module.id) {
            // For explicitly linked tasks, we count them as completing a subtopic
            // This is a simplified approach - could be enhanced to track specific subtopics
            completedSubtopics.add(task.task_name);
          }
          // Method 2: Fallback to name matching
          else if (!task.module_id) {
            // Check if task name contains any subtopic or module name
            for (const subtopic of module.subtopics_list) {
              if (task.task_name.includes(subtopic) || task.task_name.includes(module.name)) {
                completedSubtopics.add(subtopic);
              }
            }
          }
        }
      }

      const newCompleted = Math.min(completedSubtopics.size, module.subtopics);

      if (newCompleted !== module.completed) {
        const { error } = await supabase
          .from('modules')
          .update({ completed: newCompleted })
          .eq('id', module.id);

        if (error) throw error;

        module.completed = newCompleted;
      }
    }

  } catch (error) {
    console.error('Error updating module progress:', error);
  }
}

// Get module progress stats including placeholders
async function getModuleProgressStats(moduleId) {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', currentUser.id)
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

// Helper Functions
function formatDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

function getDaysBetween(date1, date2) {
  const diffTime = date2 - date1;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function showLoading(show) {
  document.getElementById('loadingIndicator').style.display = show ? 'flex' : 'none';
}

// Update header stats
function updateHeaderStats() {
  if (!appState.userSettings) return;

  const examDate = new Date(appState.userSettings.exam_date);
  const today = new Date();
  const daysToExam = getDaysBetween(today, examDate);

  document.getElementById('daysUntilExam').textContent = daysToExam;
  document.getElementById('headerExamDate').textContent = formatDate(examDate);

  // Calculate overall progress
  const totalTasks = Object.values(appState.tasks).reduce((sum, categories) => {
    return sum + categories.reduce((catSum, cat) => catSum + cat.tasks.length, 0);
  }, 0);

  const completedTasks = Object.values(appState.tasks).reduce((sum, categories) => {
    return sum + categories.reduce((catSum, cat) =>
      catSum + cat.tasks.filter(t => t.completed).length, 0);
  }, 0);

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  document.getElementById('overallProgress').textContent = `${progress}%`;
}

// Async helpers
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function raceWithTimeout(promise, timeoutMs, label = 'Query') {
  const timeoutError = new Error(`${label} timeout after ${Math.round(timeoutMs / 1000)} seconds`);
  const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(timeoutError), timeoutMs));
  return Promise.race([promise, timeoutPromise]);
}

async function fetchUserSettingsWithRetry(userId, maxAttempts = 3, timeoutMs = 20000) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await raceWithTimeout(
        supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        timeoutMs,
        'Settings query'
      );

      // response is the usual Supabase { data, error }
      return { settings: response.data, settingsError: response.error };
    } catch (error) {
      lastError = error;
      const isTimeout = typeof error?.message === 'string' && error.message.includes('timeout');
      console.warn(`Settings fetch attempt ${attempt}/${maxAttempts} ${isTimeout ? 'timed out' : 'failed'}:`, error?.message || error);

      if (attempt === maxAttempts) break;

      // Exponential backoff: 300ms, 600ms, ...
      await sleep(300 * attempt);
    }
  }

  throw lastError || new Error('Settings fetch failed after retries');
}

// Update motivational banner
function updateMotivationalBanner() {
  const messages = appState.motivationalMessages;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  document.getElementById('motivationalBanner').textContent = randomMessage;
}

// Update catch-up queue
function updateCatchUpQueue() {
  const count = appState.catchUpQueue.length;
  document.getElementById('catchUpCount').textContent = count;

  const panel = document.getElementById('catchUpQueue');
  const content = document.getElementById('catchUpContent');

  if (count === 0) {
    content.innerHTML = '<p class="no-catchup">No catch-up tasks! You\'re all caught up! 🎉</p>';
    panel.style.display = 'none';
  } else {
    panel.style.display = 'block';

    content.innerHTML = appState.catchUpQueue.map(item => `
      <div class="catch-up-item">
        <div class="catch-up-item-info">
          <div class="catch-up-item-title">${item.original_topic}</div>
          <div class="catch-up-item-meta">
            Original: ${formatDateShort(new Date(item.original_date))} →
            Rescheduled to: ${formatDateShort(new Date(item.new_date))}
          </div>
        </div>
        <div class="catch-up-actions">
          <button class="btn btn--sm btn--outline" onclick="removeCatchUpItem('${item.id}')">Remove</button>
        </div>
      </div>
    `).join('');
  }
}

// Remove catch-up item
async function removeCatchUpItem(itemId) {
  try {
    const { error } = await supabase
      .from('catch_up_queue')
      .delete()
      .eq('id', itemId);

    if (error) throw error;

    appState.catchUpQueue = appState.catchUpQueue.filter(item => item.id !== itemId);
    updateCatchUpQueue();

  } catch (error) {
    console.error('Error removing catch-up item:', error);
  }
}

// Toggle catch-up queue visibility
function toggleCatchUpQueue() {
  const panel = document.getElementById('catchUpQueue');
  const isHidden = panel.classList.contains('hidden');

  if (isHidden) {
    panel.classList.remove('hidden');
    document.getElementById('toggleCatchUpBtn').textContent = 'Hide';
  } else {
    panel.classList.add('hidden');
    document.getElementById('toggleCatchUpBtn').textContent = 'Show';
  }
}

// View switching
async function switchView(viewName) {
  // Update active tab
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === viewName) {
      btn.classList.add('active');
    }
  });

  // Update active view
  document.querySelectorAll('.view-section').forEach(section => {
    section.style.display = 'none';
  });

  const viewMap = {
    daily: 'dailyView',
    weekly: 'weeklyView',
    calendar: 'calendarView',
    modules: 'modulesView',
    sba: 'sbaView',
    telegram: 'telegramView'
  };

  document.getElementById(viewMap[viewName]).style.display = 'block';

  // Render the view
  if (viewName === 'daily') renderDailyView();
  else if (viewName === 'weekly') await renderWeeklyView();
  else if (viewName === 'calendar') await renderCalendarView();
  else if (viewName === 'modules') await renderModulesView();
  else if (viewName === 'sba') await renderSBAView();
  else if (viewName === 'telegram') await renderTelegramView();
}

// Render Daily View
function renderDailyView() {
  const date = appState.viewingDate;
  const dateStr = formatDateISO(date);

  document.getElementById('currentDate').textContent = formatDate(date);

  // Get day type (simplified for now)
  const dayTypeBadge = document.getElementById('dayTypeBadge');
  dayTypeBadge.textContent = 'Study Day';
  dayTypeBadge.className = 'day-type-badge';

  document.getElementById('workInfo').textContent = 'Regular study day';

  // Render tasks
  const categories = appState.tasks[dateStr] || [];
  const sbaEntries = appState.sbaSchedule[dateStr] || [];
  const telegramQuestions = appState.telegramQuestions[dateStr] || [];
  const dailyContent = document.getElementById('dailyContent');

  let html = '';

  // Render task categories
  if (categories.length > 0) {
    html += categories.map((category, catIndex) => `
      <div class="task-category">
        <div class="task-category-header" onclick="toggleCategory(${catIndex})">
          <div class="category-title">
            <span class="toggle-icon" id="toggle-${catIndex}">▶</span>
            ${category.category_name}
          </div>
          <div class="category-meta">${category.time_estimate}</div>
        </div>
        <div class="task-category-content" id="content-${catIndex}">
          <ul class="task-list">
            ${category.tasks.map(task => {
              return `
                <li class="task-item ${task.completed ? 'completed' : ''} ${task.is_placeholder ? 'placeholder' : ''}">
                  <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTaskCompletion('${task.id}')"
                  />
                  <div class="task-details">
                    <div class="task-name">
                      ${task.task_name}
                      ${task.is_placeholder ? '<span class="placeholder-badge">Placeholder</span>' : ''}
                    </div>
                    <div class="task-meta">
                      <span>⏱ ${task.time_estimate}</span>
                      ${task.work_suitable ? '<span class="task-badge work-suitable">✓ Work Suitable</span>' : ''}
                    </div>
                  </div>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  }

  // Render SBA schedule entries
  if (sbaEntries.length > 0) {
    const sbaIndex = categories.length;
    html += `
      <div class="task-category sba-category">
        <div class="task-category-header" onclick="toggleCategory(${sbaIndex})">
          <div class="category-title">
            <span class="toggle-icon" id="toggle-${sbaIndex}">▶</span>
            📋 SBA Tests
          </div>
          <div class="category-meta">${sbaEntries.length} test${sbaEntries.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="task-category-content" id="content-${sbaIndex}">
          <ul class="task-list">
            ${sbaEntries.map(sba => `
              <li class="task-item ${sba.completed ? 'completed' : ''} ${sba.is_placeholder ? 'placeholder' : ''}">
                <input
                  type="checkbox"
                  class="task-checkbox"
                  ${sba.completed ? 'checked' : ''}
                  onchange="handleSBAScheduleToggle('${sba.id}')"
                />
                <div class="task-details">
                  <div class="task-name">
                    ${sba.sba_name}
                    ${sba.is_placeholder ? '<span class="placeholder-badge">Placeholder</span>' : ''}
                  </div>
                  <div class="task-meta">
                    <button class="btn btn--sm btn--secondary" onclick="editSBAScheduleEntry('${sba.id}')">Edit</button>
                    <button class="btn btn--sm btn--outline" onclick="deleteSBAScheduleEntryConfirm('${sba.id}')">Delete</button>
                  </div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  // Render Telegram questions
  if (telegramQuestions.length > 0) {
    const telegramIndex = categories.length + (sbaEntries.length > 0 ? 1 : 0);
    html += `
      <div class="task-category telegram-category">
        <div class="task-category-header" onclick="toggleCategory(${telegramIndex})">
          <div class="category-title">
            <span class="toggle-icon" id="toggle-${telegramIndex}">▶</span>
            💬 Telegram Questions
          </div>
          <div class="category-meta">${telegramQuestions.length} question${telegramQuestions.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="task-category-content" id="content-${telegramIndex}">
          <ul class="task-list">
            ${telegramQuestions.map(q => `
              <li class="task-item ${q.completed ? 'completed' : ''} ${q.is_placeholder ? 'placeholder' : ''}">
                <input
                  type="checkbox"
                  class="task-checkbox"
                  ${q.completed ? 'checked' : ''}
                  onchange="handleTelegramToggle('${q.id}')"
                />
                <div class="task-details">
                  <div class="task-name">
                    ${q.question_text}
                    ${q.source ? `<span class="source-badge">${q.source}</span>` : ''}
                    ${q.is_placeholder ? '<span class="placeholder-badge">Placeholder</span>' : ''}
                  </div>
                  <div class="task-meta">
                    <button class="btn btn--sm btn--secondary" onclick="editTelegramQuestionFromDaily('${q.id}')">Edit</button>
                    <button class="btn btn--sm btn--outline" onclick="deleteTelegramQuestionConfirm('${q.id}')">Delete</button>
                  </div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  if (html === '') {
    html = `
      <div class="empty-state">
        <p>No tasks, SBA tests, or Telegram questions scheduled for this day.</p>
        <p>Use the SBA Tests and Telegram Q tabs to add items, or use the settings to customize your study schedule.</p>
      </div>
    `;
  }

  dailyContent.innerHTML = html;

  // Load notes
  const notes = appState.dailyNotes[dateStr] || '';
  const notesTextarea = document.getElementById('dailyNotes');
  notesTextarea.value = notes;

  // Add notes change handler
  notesTextarea.onchange = (e) => {
    saveDailyNote(date, e.target.value);
  };
}

// Toggle task category
function toggleCategory(index) {
  const content = document.getElementById(`content-${index}`);
  const toggle = document.getElementById(`toggle-${index}`);

  if (content.classList.contains('expanded')) {
    content.classList.remove('expanded');
    toggle.classList.remove('expanded');
  } else {
    content.classList.add('expanded');
    toggle.classList.add('expanded');
  }
}

// Change day
async function changeDay(delta) {
  appState.viewingDate.setDate(appState.viewingDate.getDate() + delta);
  await loadTasksForDate(appState.viewingDate);
  renderDailyView();
}

// Render Weekly View
async function renderWeeklyView() {
  const weekStart = getWeekStart(appState.viewingDate);
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    weekDays.push(day);
  }

  const weekEnd = new Date(weekDays[6]);
  document.getElementById('currentWeek').textContent =
    `${formatDateShort(weekStart)} - ${formatDateShort(weekEnd)}`;

  // Load data for all days in the week
  const weekData = await Promise.all(weekDays.map(async day => {
    const dateStr = formatDateISO(day);
    
    // Load tasks
    const { data: categories } = await supabase
      .from('task_categories')
      .select('*, tasks(*)')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr);
    
    // Load SBA schedule
    const { data: sbaEntries } = await supabase
      .from('sba_schedule')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr);
    
    // Load telegram questions
    const { data: telegramQuestions } = await supabase
      .from('telegram_questions')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr);
    
    return {
      date: day,
      dateStr,
      categories: categories || [],
      sbaEntries: sbaEntries || [],
      telegramQuestions: telegramQuestions || []
    };
  }));

  const weeklyContent = document.getElementById('weeklyContent');
  weeklyContent.innerHTML = weekData.map(dayData => {
    const dayName = dayData.date.toLocaleDateString('en-GB', { weekday: 'long' });
    const totalTasks = dayData.categories.reduce((sum, cat) => sum + cat.tasks.length, 0);
    const completedTasks = dayData.categories.reduce((sum, cat) => 
      sum + cat.tasks.filter(t => t.completed).length, 0);
    const sbaCount = dayData.sbaEntries.length;
    const completedSBA = dayData.sbaEntries.filter(s => s.completed).length;
    const telegramCount = dayData.telegramQuestions.length;
    const completedTelegram = dayData.telegramQuestions.filter(q => q.completed).length;

    return `
      <div class="week-day-card" onclick="viewDayFromWeek('${dayData.dateStr}')">
        <div class="week-day-header">${dayName}</div>
        <div class="week-day-date">${formatDateShort(dayData.date)}</div>
        <div class="week-day-info">
          ${totalTasks > 0 ? `
            <div class="week-item">
              📚 Tasks: ${completedTasks}/${totalTasks}
            </div>
          ` : ''}
          ${sbaCount > 0 ? `
            <div class="week-item">
              📋 SBA: ${completedSBA}/${sbaCount}
            </div>
          ` : ''}
          ${telegramCount > 0 ? `
            <div class="week-item">
              💬 Telegram: ${completedTelegram}/${telegramCount}
            </div>
          ` : ''}
          ${totalTasks === 0 && sbaCount === 0 && telegramCount === 0 ? 
            '<div class="week-item-empty">No items scheduled</div>' : ''}
        </div>
      </div>
    `;
  }).join('');
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

async function viewDayFromWeek(dateStr) {
  appState.viewingDate = new Date(dateStr);
  await loadTasksForDate(appState.viewingDate);
  switchView('daily');
}

async function changeWeek(delta) {
  const weekStart = getWeekStart(appState.viewingDate);
  weekStart.setDate(weekStart.getDate() + (delta * 7));
  appState.viewingDate = weekStart;
  await renderWeeklyView();
}

// Render Calendar View
async function renderCalendarView() {
  const viewMonth = appState.viewingMonth;
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  document.getElementById('currentMonth').textContent =
    viewMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = lastDay.getDate();

  // Load data for all days in the month
  const monthDates = [];
  for (let day = 1; day <= daysInMonth; day++) {
    monthDates.push(new Date(year, month, day));
  }

  const monthData = await Promise.all(monthDates.map(async date => {
    const dateStr = formatDateISO(date);
    
    // Load tasks
    const { data: categories } = await supabase
      .from('task_categories')
      .select('*, tasks(*)')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr);
    
    // Load SBA schedule
    const { data: sbaEntries } = await supabase
      .from('sba_schedule')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr);
    
    // Load telegram questions
    const { data: telegramQuestions } = await supabase
      .from('telegram_questions')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr);
    
    const totalTasks = (categories || []).reduce((sum, cat) => sum + cat.tasks.length, 0);
    const completedTasks = (categories || []).reduce((sum, cat) => 
      sum + cat.tasks.filter(t => t.completed).length, 0);
    const sbaCount = (sbaEntries || []).length;
    const completedSBA = (sbaEntries || []).filter(s => s.completed).length;
    const telegramCount = (telegramQuestions || []).length;
    const completedTelegram = (telegramQuestions || []).filter(q => q.completed).length;
    
    return {
      dateStr,
      totalTasks,
      completedTasks,
      sbaCount,
      completedSBA,
      telegramCount,
      completedTelegram
    };
  }));

  const calendarContent = document.getElementById('calendarContent');
  let html = '';

  // Day headers
  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  dayHeaders.forEach(day => {
    html += `<div class="calendar-day-header">${day}</div>`;
  });

  // Empty cells before month starts
  for (let i = 0; i < startDay; i++) {
    html += '<div class="calendar-day other-month"></div>';
  }

  // Days of the month
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayData = monthData[day - 1];
    let dayClass = 'calendar-day';

    if (date.toDateString() === today.toDateString()) {
      dayClass += ' today';
    }

    const hasItems = dayData.totalTasks > 0 || dayData.sbaCount > 0 || dayData.telegramCount > 0;

    html += `
      <div class="${dayClass} ${hasItems ? 'has-items' : ''}" onclick="viewDayFromCalendar('${formatDateISO(date)}')">
        <div class="calendar-day-number">${day}</div>
        ${hasItems ? `
          <div class="calendar-day-items">
            ${dayData.totalTasks > 0 ? `<div class="calendar-indicator">📚 ${dayData.completedTasks}/${dayData.totalTasks}</div>` : ''}
            ${dayData.sbaCount > 0 ? `<div class="calendar-indicator">📋 ${dayData.completedSBA}/${dayData.sbaCount}</div>` : ''}
            ${dayData.telegramCount > 0 ? `<div class="calendar-indicator">💬 ${dayData.completedTelegram}/${dayData.telegramCount}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  calendarContent.innerHTML = html;
}

async function viewDayFromCalendar(dateStr) {
  appState.viewingDate = new Date(dateStr);
  await loadTasksForDate(appState.viewingDate);
  switchView('daily');
}

async function changeMonth(delta) {
  const newMonth = new Date(appState.viewingMonth);
  newMonth.setMonth(newMonth.getMonth() + delta);
  appState.viewingMonth = newMonth;
  await renderCalendarView();
}

// Render Modules View
async function renderModulesView() {
  const modulesContent = document.getElementById('modulesContent');

  // Get placeholder stats for each module
  const modulesWithStats = await Promise.all(appState.modules.map(async (module) => {
    const stats = await getModuleProgressStats(module.id);
    return { ...module, stats };
  }));

  modulesContent.innerHTML = modulesWithStats.map(module => {
    const progress = module.subtopics > 0 ?
      Math.round((module.completed / module.subtopics) * 100) : 0;

    return `
      <div class="module-card">
        <div class="module-header">
          <div class="module-name">${module.name}</div>
          <div class="module-weight">${module.exam_weight}% of exam</div>
        </div>
        <div class="module-progress">
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${progress}%; background-color: ${module.color};"></div>
          </div>
          <div class="progress-text">
            <span>${progress}% complete</span>
            <span>${module.completed}/${module.subtopics} subtopics</span>
          </div>
          ${module.stats.totalTasks > 0 || module.stats.placeholders > 0 ? `
            <div class="module-task-stats">
              <span>${module.stats.completedTasks}/${module.stats.totalTasks} tasks</span>
              ${module.stats.placeholders > 0 ? `<span class="placeholder-count">(${module.stats.placeholders} placeholders)</span>` : ''}
            </div>
          ` : ''}
        </div>
        <div class="module-subtopics">
          <strong>Subtopics:</strong><br/>
          ${module.subtopics_list.slice(0, 5).join(', ')}${module.subtopics_list.length > 5 ? `, +${module.subtopics_list.length - 5} more` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Settings Modal
function showSettingsModal() {
  if (!appState.userSettings) return;

  document.getElementById('settingsExamDate').value = appState.userSettings.exam_date;
  document.getElementById('settingsTripStart').value = appState.userSettings.brazil_trip_start || '';
  document.getElementById('settingsTripEnd').value = appState.userSettings.brazil_trip_end || '';

  document.getElementById('settingsModal').style.display = 'flex';
}

function closeSettingsModal() {
  document.getElementById('settingsModal').style.display = 'none';
}

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const examDate = document.getElementById('settingsExamDate').value;
  const tripStart = document.getElementById('settingsTripStart').value || null;
  const tripEnd = document.getElementById('settingsTripEnd').value || null;

  try {
    const { error } = await supabase
      .from('user_settings')
      .update({
        exam_date: examDate,
        brazil_trip_start: tripStart,
        brazil_trip_end: tripEnd
      })
      .eq('user_id', currentUser.id);

    if (error) throw error;

    appState.userSettings.exam_date = examDate;
    appState.userSettings.brazil_trip_start = tripStart;
    appState.userSettings.brazil_trip_end = tripEnd;

    updateHeaderStats();
    closeSettingsModal();

    alert('Settings saved successfully!');

  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Failed to save settings: ' + error.message);
  }
});

// Add Module Modal (placeholder)
function showAddModuleModal() {
  alert('Add module functionality coming soon!');
}

// Default dates from the original schedule
const defaultDates = {
  examDate: '2026-01-14',
  brazilTripStart: '2025-12-19',
  brazilTripEnd: '2025-12-29'
};

// Onboarding Modal Functions
function showOnboardingModal() {
  const modal = document.getElementById('onboardingModal');
  
  // Set default dates from the original schedule
  document.getElementById('onboardingExamDate').value = defaultDates.examDate;
  document.getElementById('onboardingTripStart').value = defaultDates.brazilTripStart;
  document.getElementById('onboardingTripEnd').value = defaultDates.brazilTripEnd;
  
  // Populate module checkboxes
  const checkboxContainer = document.getElementById('moduleCheckboxes');
  checkboxContainer.innerHTML = defaultModules.map((module, index) => `
    <div class="module-checkbox-item">
      <label class="checkbox-label">
        <input type="checkbox" value="${index}" checked class="module-checkbox">
        <span class="module-checkbox-info">
          <span class="module-checkbox-name" style="color: ${module.color}">
            <strong>${module.name}</strong>
          </span>
          <span class="module-checkbox-details">
            ${module.exam_weight}% of exam • ${module.subtopics} subtopics
          </span>
        </span>
      </label>
    </div>
  `).join('');
  
  modal.style.display = 'flex';
}

function selectAllModules() {
  document.querySelectorAll('.module-checkbox').forEach(cb => cb.checked = true);
}

function deselectAllModules() {
  document.querySelectorAll('.module-checkbox').forEach(cb => cb.checked = false);
}

// Handle onboarding form submission
document.getElementById('onboardingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const examDate = document.getElementById('onboardingExamDate').value;
  const tripStart = document.getElementById('onboardingTripStart').value || null;
  const tripEnd = document.getElementById('onboardingTripEnd').value || null;
  
  // Get selected modules
  const selectedIndexes = Array.from(document.querySelectorAll('.module-checkbox:checked'))
    .map(cb => parseInt(cb.value));
  
  if (selectedIndexes.length === 0) {
    alert('Please select at least one module to study.');
    return;
  }
  
  const selectedModules = selectedIndexes.map(index => defaultModules[index]);
  
  try {
    showLoading(true);
    document.getElementById('onboardingModal').style.display = 'none';
    
    // Complete onboarding
    await completeOnboarding(examDate, tripStart, tripEnd, selectedModules);
    
    // Load all data
    await loadAllData();
    
    // Render initial view
    updateHeaderStats();
    updateMotivationalBanner();
    renderDailyView();
    updateCatchUpQueue();
    
    showLoading(false);
    document.getElementById('dailyView').style.display = 'block';
    
  } catch (error) {
    console.error('Error during onboarding:', error);
    showLoading(false);
    alert('Failed to complete setup: ' + error.message);
    
    // Show the modal again so user can retry
    document.getElementById('onboardingModal').style.display = 'flex';
  }
});

// Close modal on outside click
window.onclick = function(event) {
  const settingsModal = document.getElementById('settingsModal');
  if (event.target === settingsModal) {
    closeSettingsModal();
  }
};

// ============================================
// SBA Tests Management
// ============================================

// Load all SBA tests for the user
async function loadSBATests() {
  try {
    const { data: tests, error } = await supabase
      .from('sba_tests')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at');

    if (error) throw error;
    return tests || [];
  } catch (error) {
    console.error('Error loading SBA tests:', error);
    return [];
  }
}

// Load SBA schedule for a date range
async function loadSBASchedule(startDate, endDate) {
  try {
    const { data: schedule, error } = await supabase
      .from('sba_schedule')
      .select('*')
      .eq('user_id', currentUser.id)
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

// Create new SBA test
async function createSBATest(data) {
  try {
    const { data: test, error } = await supabase
      .from('sba_tests')
      .insert({
        user_id: currentUser.id,
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

// Update SBA test
async function updateSBATest(id, data) {
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

// Delete SBA test
async function deleteSBATest(id) {
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

// Create SBA schedule entry
async function createSBAScheduleEntry(date, sbaName, isPlaceholder = false) {
  try {
    // Handle both Date objects and date strings
    const dateStr = typeof date === 'string' ? date : formatDateISO(date);
    
    const { data, error } = await supabase
      .from('sba_schedule')
      .insert({
        user_id: currentUser.id,
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

// Toggle SBA schedule completion
async function toggleSBAScheduleCompletion(id) {
  try {
    // Get current state
    const { data: entry, error: fetchError } = await supabase
      .from('sba_schedule')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Toggle completion
    const { error: updateError } = await supabase
      .from('sba_schedule')
      .update({ completed: !entry.completed })
      .eq('id', id);

    if (updateError) throw updateError;

    // Update SBA test completed count
    await updateSBATestProgress();
    
    return !entry.completed;
  } catch (error) {
    console.error('Error toggling SBA completion:', error);
    throw error;
  }
}

// Update SBA test progress
async function updateSBATestProgress() {
  try {
    const tests = await loadSBATests();
    
    for (const test of tests) {
      // Count completed schedule entries for this test
      const { count, error } = await supabase
        .from('sba_schedule')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id)
        .eq('completed', true)
        .ilike('sba_name', `%${test.name}%`);

      if (error) throw error;

      // Update the test's completed count
      await supabase
        .from('sba_tests')
        .update({ completed: count || 0 })
        .eq('id', test.id);
    }
  } catch (error) {
    console.error('Error updating SBA test progress:', error);
  }
}

// Delete SBA schedule entry
async function deleteSBAScheduleEntry(id) {
  try {
    const { error } = await supabase
      .from('sba_schedule')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    await updateSBATestProgress();
  } catch (error) {
    console.error('Error deleting SBA schedule entry:', error);
    throw error;
  }
}

// Bulk upload SBA schedule
async function bulkUploadSBA(jsonData) {
  try {
    const entries = [];
    
    for (const item of jsonData) {
      entries.push({
        user_id: currentUser.id,
        date: item.date,
        sba_name: item.sba_name,
        completed: item.completed || false,
        is_placeholder: item.is_placeholder || false
      });
    }

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
// Telegram Questions Management
// ============================================

// Load telegram questions for a date range
async function loadTelegramQuestions(startDate, endDate) {
  try {
    const { data: questions, error } = await supabase
      .from('telegram_questions')
      .select('*')
      .eq('user_id', currentUser.id)
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

// Create telegram question
async function createTelegramQuestion(data) {
  try {
    // Handle both Date objects and date strings
    const dateStr = typeof data.date === 'string' ? data.date : formatDateISO(data.date);
    
    const { data: question, error } = await supabase
      .from('telegram_questions')
      .insert({
        user_id: currentUser.id,
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

// Update telegram question
async function updateTelegramQuestion(id, data) {
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

// Toggle telegram question completion
async function toggleTelegramQuestionCompletion(id) {
  try {
    // Get current state
    const { data: question, error: fetchError } = await supabase
      .from('telegram_questions')
      .select('completed')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Toggle completion
    const { error: updateError } = await supabase
      .from('telegram_questions')
      .update({ completed: !question.completed })
      .eq('id', id);

    if (updateError) throw updateError;
    
    return !question.completed;
  } catch (error) {
    console.error('Error toggling telegram question:', error);
    throw error;
  }
}

// Delete telegram question
async function deleteTelegramQuestion(id) {
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

// Bulk upload telegram questions
async function bulkUploadTelegramQuestions(jsonData) {
  try {
    const questions = [];
    
    for (const item of jsonData) {
      questions.push({
        user_id: currentUser.id,
        date: item.date,
        question_text: item.question_text,
        source: item.source || null,
        completed: item.completed || false,
        is_placeholder: item.is_placeholder || false
      });
    }

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
// Placeholder Management
// ============================================

// Create placeholders for selected dates
async function createPlaceholders(dates, type, data = {}) {
  try {
    const results = [];
    
    for (const date of dates) {
      // date is already a string in YYYY-MM-DD format from the calendar
      const dateStr = typeof date === 'string' ? date : formatDateISO(new Date(date));
      
      if (type === 'sba') {
        const entry = await createSBAScheduleEntry(
          dateStr,
          data.sba_name || 'TBD',
          true
        );
        results.push(entry);
      } else if (type === 'telegram') {
        const question = await createTelegramQuestion({
          date: dateStr,
          question_text: data.question_text || 'Placeholder - to be added',
          source: data.source || null,
          completed: false,
          is_placeholder: true
        });
        results.push(question);
      } else if (type === 'task') {
        // Create a placeholder task
        // First, we need a category
        let category = null;
        
        // Try to find or create a category for this date
        const { data: existingCategories } = await supabase
          .from('task_categories')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('date', dateStr)
          .limit(1);
        
        if (existingCategories && existingCategories.length > 0) {
          category = existingCategories[0];
        } else {
          // Create a new category
          const { data: newCategory, error: catError } = await supabase
            .from('task_categories')
            .insert({
              user_id: currentUser.id,
              date: dateStr,
              category_name: data.category_name || '📝 Placeholder Tasks',
              time_estimate: '30-60 min',
              sort_order: 999
            })
            .select()
            .single();
          
          if (catError) throw catError;
          category = newCategory;
        }
        
        // Create the placeholder task
        const { data: task, error: taskError } = await supabase
          .from('tasks')
          .insert({
            user_id: currentUser.id,
            category_id: category.id,
            module_id: data.module_id || null,
            date: dateStr,
            task_name: data.task_name || 'Placeholder - to be defined',
            time_estimate: data.time_estimate || '30 min',
            work_suitable: true,
            is_placeholder: true,
            completed: false,
            sort_order: 999
          })
          .select()
          .single();
        
        if (taskError) throw taskError;
        results.push(task);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error creating placeholders:', error);
    throw error;
  }
}

// Get weekdays only from date array
function getWeekdaysOnly(dates) {
  return dates.filter(date => {
    const d = new Date(date);
    const day = d.getDay();
    return day !== 0 && day !== 6; // Exclude Sunday (0) and Saturday (6)
  });
}

// ============================================
// UI Rendering Functions
// ============================================

// Render SBA Tests View
async function renderSBAView() {
  try {
    // Render SBA tests list
    const tests = await loadSBATests();
    const testsListEl = document.getElementById('sbaTestsList');
    
    if (tests.length === 0) {
      testsListEl.innerHTML = '<p class="empty-state">No SBA tests defined yet. Click "Add SBA Test" to create one.</p>';
    } else {
      testsListEl.innerHTML = tests.map(test => `
        <div class="sba-test-card">
          <div class="sba-test-header">
            <div class="sba-test-name">${test.name}</div>
            <div class="sba-test-actions">
              <button class="btn btn--sm btn--secondary" onclick="editSBATest('${test.id}')">Edit</button>
              <button class="btn btn--sm btn--outline" onclick="deleteSBATestConfirm('${test.id}')">Delete</button>
            </div>
          </div>
          <div class="sba-test-details">
            <span>Key: ${test.test_key}</span>
            <span>Days: ${test.total_days}</span>
            <span>Reading: ${test.reading_time}</span>
            <span>Avg: ${test.avg_time}</span>
          </div>
          <div class="sba-test-progress">
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: ${Math.round((test.completed / test.total_days) * 100)}%;"></div>
            </div>
            <div class="progress-text">
              <span>${test.completed}/${test.total_days} completed</span>
            </div>
          </div>
        </div>
      `).join('');
    }
    
    // Set default date range for schedule
    const today = new Date();
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    
    document.getElementById('sbaScheduleStartDate').value = formatDateISO(today);
    document.getElementById('sbaScheduleEndDate').value = formatDateISO(oneMonthLater);
    
    // Load schedule
    await loadSBAScheduleView();
    
    // Update header stats
    await updateSBAHeaderStats();
  } catch (error) {
    console.error('Error rendering SBA view:', error);
  }
}

// Load and render SBA schedule
async function loadSBAScheduleView() {
  try {
    const startDate = new Date(document.getElementById('sbaScheduleStartDate').value);
    const endDate = new Date(document.getElementById('sbaScheduleEndDate').value);
    
    const schedule = await loadSBASchedule(startDate, endDate);
    const contentEl = document.getElementById('sbaScheduleContent');
    
    if (schedule.length === 0) {
      contentEl.innerHTML = '<p class="empty-state">No SBA tests scheduled for this date range.</p>';
    } else {
      // Group by date
      const grouped = {};
      schedule.forEach(item => {
        if (!grouped[item.date]) grouped[item.date] = [];
        grouped[item.date].push(item);
      });
      
      contentEl.innerHTML = Object.entries(grouped).map(([date, items]) => `
        <div class="sba-schedule-day">
          <div class="sba-schedule-date">${formatDate(new Date(date))}</div>
          <div class="sba-schedule-items">
            ${items.map(item => `
              <div class="sba-schedule-item ${item.completed ? 'completed' : ''} ${item.is_placeholder ? 'placeholder' : ''}">
                <input 
                  type="checkbox" 
                  ${item.completed ? 'checked' : ''} 
                  onchange="handleSBAScheduleToggle('${item.id}')"
                  class="task-checkbox"
                />
                <span class="sba-schedule-name">
                  ${item.sba_name}
                  ${item.is_placeholder ? '<span class="placeholder-badge">Placeholder</span>' : ''}
                </span>
                <button class="btn btn--sm btn--outline delete-btn" onclick="deleteSBAScheduleEntryConfirm('${item.id}')">Delete</button>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading SBA schedule view:', error);
  }
}

// Render Telegram Questions View
async function renderTelegramView() {
  try {
    // Set default date range
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    
    document.getElementById('telegramStartDate').value = formatDateISO(oneMonthAgo);
    document.getElementById('telegramEndDate').value = formatDateISO(oneMonthLater);
    
    // Load questions
    await loadTelegramQuestionsView();
    
    // Update header stats
    await updateTelegramHeaderStats();
  } catch (error) {
    console.error('Error rendering Telegram view:', error);
  }
}

// Load and render Telegram questions
async function loadTelegramQuestionsView() {
  try {
    const startDate = new Date(document.getElementById('telegramStartDate').value);
    const endDate = new Date(document.getElementById('telegramEndDate').value);
    const sourceFilter = document.getElementById('telegramSourceFilter').value;
    const statusFilter = document.getElementById('telegramStatusFilter').value;
    
    let questions = await loadTelegramQuestions(startDate, endDate);
    
    // Apply filters
    if (sourceFilter) {
      questions = questions.filter(q => q.source === sourceFilter);
    }
    if (statusFilter === 'completed') {
      questions = questions.filter(q => q.completed);
    } else if (statusFilter === 'pending') {
      questions = questions.filter(q => !q.completed);
    }
    
    const contentEl = document.getElementById('telegramQuestionsContent');
    
    if (questions.length === 0) {
      contentEl.innerHTML = '<p class="empty-state">No telegram questions found for the selected filters.</p>';
    } else {
      // Group by date
      const grouped = {};
      questions.forEach(q => {
        if (!grouped[q.date]) grouped[q.date] = [];
        grouped[q.date].push(q);
      });
      
      contentEl.innerHTML = Object.entries(grouped).map(([date, items]) => `
        <div class="telegram-questions-day">
          <div class="telegram-day-header">${formatDate(new Date(date))}</div>
          <div class="telegram-questions-list">
            ${items.map(item => `
              <div class="telegram-question-item ${item.completed ? 'completed' : ''} ${item.is_placeholder ? 'placeholder' : ''}">
                <input 
                  type="checkbox" 
                  ${item.completed ? 'checked' : ''} 
                  onchange="handleTelegramToggle('${item.id}')"
                  class="task-checkbox"
                />
                <div class="telegram-question-content">
                  <div class="telegram-question-text">${item.question_text}</div>
                  <div class="telegram-question-meta">
                    ${item.source ? `<span class="source-badge">${item.source}</span>` : ''}
                    ${item.is_placeholder ? '<span class="placeholder-badge">Placeholder</span>' : ''}
                  </div>
                </div>
                <div class="telegram-question-actions">
                  <button class="btn btn--sm btn--secondary" onclick="editTelegramQuestion('${item.id}')">Edit</button>
                  <button class="btn btn--sm btn--outline" onclick="deleteTelegramQuestionConfirm('${item.id}')">Delete</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading telegram questions view:', error);
  }
}

// Update header stats
async function updateSBAHeaderStats() {
  try {
    const tests = await loadSBATests();
    const totalCompleted = tests.reduce((sum, test) => sum + test.completed, 0);
    const totalDays = tests.reduce((sum, test) => sum + test.total_days, 0);
    const percentage = totalDays > 0 ? Math.round((totalCompleted / totalDays) * 100) : 0;
    
    document.getElementById('sbaProgress').textContent = `${percentage}%`;
  } catch (error) {
    console.error('Error updating SBA header stats:', error);
  }
}

async function updateTelegramHeaderStats() {
  try {
    // Get all telegram questions count
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2026-12-31');
    const questions = await loadTelegramQuestions(startDate, endDate);
    const completed = questions.filter(q => q.completed && !q.is_placeholder).length;
    
    document.getElementById('telegramProgress').textContent = completed;
  } catch (error) {
    console.error('Error updating Telegram header stats:', error);
  }
}

// ============================================
// Modal Functions
// ============================================

// SBA Modal Functions
function showAddSBAModal() {
  document.getElementById('sbaModalTitle').textContent = 'Add SBA Test';
  document.getElementById('sbaEditId').value = '';
  document.getElementById('sbaForm').reset();
  document.getElementById('addSBAModal').style.display = 'flex';
}

async function editSBATest(id) {
  try {
    const tests = await loadSBATests();
    const test = tests.find(t => t.id === id);
    
    if (test) {
      document.getElementById('sbaModalTitle').textContent = 'Edit SBA Test';
      document.getElementById('sbaEditId').value = test.id;
      document.getElementById('sbaTestKey').value = test.test_key;
      document.getElementById('sbaName').value = test.name;
      document.getElementById('sbaTotalDays').value = test.total_days;
      document.getElementById('sbaReadingTime').value = test.reading_time;
      document.getElementById('sbaAvgTime').value = test.avg_time;
      document.getElementById('addSBAModal').style.display = 'flex';
    }
  } catch (error) {
    console.error('Error loading SBA test for edit:', error);
  }
}

function closeSBAModal() {
  document.getElementById('addSBAModal').style.display = 'none';
}

async function deleteSBATestConfirm(id) {
  if (confirm('Are you sure you want to delete this SBA test? This will also delete all associated schedule entries.')) {
    try {
      await deleteSBATest(id);
      await renderSBAView();
      alert('SBA test deleted successfully!');
    } catch (error) {
      alert('Failed to delete SBA test: ' + error.message);
    }
  }
}

// Handle SBA form submission
document.getElementById('sbaForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const editId = document.getElementById('sbaEditId').value;
  const data = {
    test_key: document.getElementById('sbaTestKey').value,
    name: document.getElementById('sbaName').value,
    total_days: parseInt(document.getElementById('sbaTotalDays').value),
    reading_time: document.getElementById('sbaReadingTime').value,
    avg_time: document.getElementById('sbaAvgTime').value
  };
  
  try {
    if (editId) {
      await updateSBATest(editId, data);
      alert('SBA test updated successfully!');
    } else {
      await createSBATest(data);
      alert('SBA test created successfully!');
    }
    
    closeSBAModal();
    await renderSBAView();
  } catch (error) {
    alert('Failed to save SBA test: ' + error.message);
  }
});

// Telegram Modal Functions
function showAddTelegramModal() {
  document.getElementById('telegramModalTitle').textContent = 'Add Telegram Question';
  document.getElementById('telegramEditId').value = '';
  document.getElementById('telegramForm').reset();
  document.getElementById('telegramQuestionDate').value = formatDateISO(new Date());
  document.getElementById('addTelegramModal').style.display = 'flex';
}

async function editTelegramQuestion(id) {
  try {
    const { data: question, error } = await supabase
      .from('telegram_questions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (question) {
      document.getElementById('telegramModalTitle').textContent = 'Edit Telegram Question';
      document.getElementById('telegramEditId').value = question.id;
      document.getElementById('telegramQuestionDate').value = question.date;
      document.getElementById('telegramQuestionText').value = question.question_text;
      document.getElementById('telegramQuestionSource').value = question.source || '';
      document.getElementById('addTelegramModal').style.display = 'flex';
    }
  } catch (error) {
    console.error('Error loading telegram question for edit:', error);
  }
}

function closeTelegramModal() {
  document.getElementById('addTelegramModal').style.display = 'none';
}

async function deleteTelegramQuestionConfirm(id) {
  if (confirm('Are you sure you want to delete this telegram question?')) {
    try {
      await deleteTelegramQuestion(id);
      
      // Reload data for both views
      await loadTasksForDate(appState.viewingDate);
      renderDailyView();
      
      // Also update the telegram view if it's loaded
      if (document.getElementById('telegramView').style.display === 'block') {
        await loadTelegramQuestionsView();
      }
      
      await updateTelegramHeaderStats();
      alert('Telegram question deleted successfully!');
    } catch (error) {
      alert('Failed to delete telegram question: ' + error.message);
    }
  }
}

// Handle Telegram form submission
document.getElementById('telegramForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const editId = document.getElementById('telegramEditId').value;
  const data = {
    date: document.getElementById('telegramQuestionDate').value,
    question_text: document.getElementById('telegramQuestionText').value,
    source: document.getElementById('telegramQuestionSource').value || null,
    completed: false,
    is_placeholder: false
  };
  
  try {
    if (editId) {
      await updateTelegramQuestion(editId, data);
      alert('Telegram question updated successfully!');
    } else {
      await createTelegramQuestion(data);
      alert('Telegram question created successfully!');
    }
    
    closeTelegramModal();
    
    // Reload both daily and telegram views
    await loadTasksForDate(appState.viewingDate);
    renderDailyView();
    
    if (document.getElementById('telegramView').style.display === 'block') {
      await loadTelegramQuestionsView();
    }
    
    await updateTelegramHeaderStats();
  } catch (error) {
    alert('Failed to save telegram question: ' + error.message);
  }
});

// Bulk Upload Modal Functions
function showSBABulkUploadModal() {
  document.getElementById('bulkUploadType').value = 'sba';
  document.getElementById('bulkUploadJSON').value = '';
  document.getElementById('bulkUploadResult').innerHTML = '';
  document.getElementById('bulkUploadModal').style.display = 'flex';
}

function showTelegramBulkUploadModal() {
  document.getElementById('bulkUploadType').value = 'telegram';
  document.getElementById('bulkUploadJSON').value = '';
  document.getElementById('bulkUploadResult').innerHTML = '';
  document.getElementById('bulkUploadModal').style.display = 'flex';
}

function closeBulkUploadModal() {
  document.getElementById('bulkUploadModal').style.display = 'none';
}

async function processBulkUpload() {
  const type = document.getElementById('bulkUploadType').value;
  const jsonText = document.getElementById('bulkUploadJSON').value;
  const resultEl = document.getElementById('bulkUploadResult');
  
  try {
    const data = JSON.parse(jsonText);
    
    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of objects');
    }
    
    let count = 0;
    if (type === 'sba') {
      count = await bulkUploadSBA(data);
    } else if (type === 'telegram') {
      count = await bulkUploadTelegramQuestions(data);
    }
    
    resultEl.innerHTML = `<p class="success-message">✓ Successfully uploaded ${count} ${type === 'sba' ? 'SBA entries' : 'telegram questions'}!</p>`;
    
    // Refresh the view
    setTimeout(async () => {
      closeBulkUploadModal();
      if (type === 'sba') {
        await renderSBAView();
      } else {
        await loadTelegramQuestionsView();
        await updateTelegramHeaderStats();
      }
    }, 1500);
  } catch (error) {
    resultEl.innerHTML = `<p class="error-message">✗ Error: ${error.message}</p>`;
  }
}

// Placeholder Modal Functions
let selectedPlaceholderDates = [];

function showSBAPlaceholderModal() {
  document.getElementById('placeholderType').value = 'sba';
  document.getElementById('placeholderModalTitle').textContent = 'Create SBA Placeholders';
  selectedPlaceholderDates = [];
  renderPlaceholderCalendar();
  document.getElementById('placeholderModal').style.display = 'flex';
}

function showTelegramPlaceholderModal() {
  document.getElementById('placeholderType').value = 'telegram';
  document.getElementById('placeholderModalTitle').textContent = 'Create Telegram Question Placeholders';
  selectedPlaceholderDates = [];
  renderPlaceholderCalendar();
  document.getElementById('placeholderModal').style.display = 'flex';
}

function closePlaceholderModal() {
  document.getElementById('placeholderModal').style.display = 'none';
  selectedPlaceholderDates = [];
}

function renderPlaceholderCalendar() {
  const today = new Date();
  const calendarEl = document.getElementById('placeholderCalendar');
  
  let html = '<div class="placeholder-calendar-month">';
  
  // Render 3 months
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const viewMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    
    html += `<div class="placeholder-month">`;
    html += `<div class="placeholder-month-header">${viewMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>`;
    html += `<div class="placeholder-days-grid">`;
    
    // Day headers
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
      html += `<div class="placeholder-day-header">${day}</div>`;
    });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const daysInMonth = lastDay.getDate();
    
    // Empty cells
    for (let i = 0; i < startDay; i++) {
      html += '<div class="placeholder-day empty"></div>';
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDateISO(date);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isSelected = selectedPlaceholderDates.includes(dateStr);
      const isPast = date < today;
      
      html += `<div class="placeholder-day ${isWeekend ? 'weekend' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}" 
        onclick="togglePlaceholderDate('${dateStr}')">${day}</div>`;
    }
    
    html += '</div></div>';
  }
  
  html += '</div>';
  calendarEl.innerHTML = html;
  
  updateSelectedDatesDisplay();
}

function togglePlaceholderDate(dateStr) {
  const excludeWeekends = document.getElementById('excludeWeekends').checked;
  const date = new Date(dateStr);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  
  if (excludeWeekends && isWeekend) {
    alert('Weekends are excluded. Uncheck "Exclude Weekends" to select weekend dates.');
    return;
  }
  
  const index = selectedPlaceholderDates.indexOf(dateStr);
  if (index > -1) {
    selectedPlaceholderDates.splice(index, 1);
  } else {
    selectedPlaceholderDates.push(dateStr);
  }
  
  renderPlaceholderCalendar();
}

function updateSelectedDatesDisplay() {
  document.getElementById('selectedDatesCount').textContent = selectedPlaceholderDates.length;
}

async function createPlaceholdersFromModal() {
  const type = document.getElementById('placeholderType').value;
  const resultEl = document.getElementById('placeholderResult');
  
  if (selectedPlaceholderDates.length === 0) {
    alert('Please select at least one date.');
    return;
  }
  
  try {
    const data = type === 'sba' 
      ? { sba_name: 'TBD - Placeholder' }
      : { question_text: 'Placeholder - to be added', source: null };
    
    const results = await createPlaceholders(selectedPlaceholderDates, type, data);
    
    resultEl.innerHTML = `<p class="success-message">✓ Successfully created ${results.length} placeholders!</p>`;
    
    setTimeout(async () => {
      closePlaceholderModal();
      if (type === 'sba') {
        await renderSBAView();
      } else {
        await loadTelegramQuestionsView();
      }
    }, 1500);
  } catch (error) {
    resultEl.innerHTML = `<p class="error-message">✗ Error: ${error.message}</p>`;
  }
}

// Event Handlers
async function handleSBAScheduleToggle(id) {
  try {
    await toggleSBAScheduleCompletion(id);
    
    // Reload data for both views
    await loadTasksForDate(appState.viewingDate);
    renderDailyView();
    
    // Also update the SBA view if it's loaded
    if (document.getElementById('sbaView').style.display === 'block') {
      await loadSBAScheduleView();
    }
    
    await updateSBAHeaderStats();
  } catch (error) {
    console.error('Error toggling SBA schedule:', error);
  }
}

async function deleteSBAScheduleEntryConfirm(id) {
  if (confirm('Are you sure you want to delete this SBA schedule entry?')) {
    try {
      await deleteSBAScheduleEntry(id);
      
      // Reload data for both views
      await loadTasksForDate(appState.viewingDate);
      renderDailyView();
      
      // Also update the SBA view if it's loaded
      if (document.getElementById('sbaView').style.display === 'block') {
        await loadSBAScheduleView();
      }
      
      await updateSBAHeaderStats();
      alert('SBA schedule entry deleted successfully!');
    } catch (error) {
      alert('Failed to delete SBA schedule entry: ' + error.message);
    }
  }
}

async function handleTelegramToggle(id) {
  try {
    await toggleTelegramQuestionCompletion(id);
    
    // Reload data for both views
    await loadTasksForDate(appState.viewingDate);
    renderDailyView();
    
    // Also update the telegram view if it's loaded
    if (document.getElementById('telegramView').style.display === 'block') {
      await loadTelegramQuestionsView();
    }
    
    await updateTelegramHeaderStats();
  } catch (error) {
    console.error('Error toggling telegram question:', error);
  }
}

// Edit SBA schedule entry from daily view
async function editSBAScheduleEntry(id) {
  try {
    const { data: entry, error } = await supabase
      .from('sba_schedule')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (entry) {
      // For now, we'll just allow editing the name
      const newName = prompt('Edit SBA test name:', entry.sba_name);
      if (newName && newName !== entry.sba_name) {
        const { error: updateError } = await supabase
          .from('sba_schedule')
          .update({ sba_name: newName })
          .eq('id', id);
        
        if (updateError) throw updateError;
        
        // Reload the daily view
        await loadTasksForDate(appState.viewingDate);
        renderDailyView();
        
        alert('SBA test updated successfully!');
      }
    }
  } catch (error) {
    console.error('Error editing SBA schedule entry:', error);
    alert('Failed to edit SBA test: ' + error.message);
  }
}

// Edit telegram question from daily view
async function editTelegramQuestionFromDaily(id) {
  await editTelegramQuestion(id);
  // After the modal closes and saves, reload the daily view
  // This is handled by the form submission handler
}
