// Main Application Logic with Supabase Integration

// Application State
const appState = {
  userSettings: null,
  modules: [],
  dailySchedule: {},
  tasks: {},
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
    showLoading(true);

    // Check if user has settings (first-time user check)
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();

    if (settingsError && settingsError.code === 'PGRST116') {
      // First-time user - initialize with default data
      await initializeFirstTimeUser();
    } else if (settingsError) {
      throw settingsError;
    } else {
      appState.userSettings = settings;
    }

    // Load all user data
    await loadAllData();

    // Render initial view
    updateHeaderStats();
    updateMotivationalBanner();
    renderDailyView();
    updateCatchUpQueue();

    showLoading(false);
    document.getElementById('dailyView').style.display = 'block';

  } catch (error) {
    console.error('Error initializing app:', error);
    alert('Failed to load app. Please refresh the page.');
    showLoading(false);
  }
}

// Initialize first-time user with default data
async function initializeFirstTimeUser() {
  console.log('Initializing first-time user...');

  try {
    // Create user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: currentUser.id,
        exam_date: '2026-01-14',
        current_date: new Date().toISOString().split('T')[0],
        brazil_trip_start: '2025-12-19',
        brazil_trip_end: '2025-12-29'
      })
      .select()
      .single();

    if (settingsError) throw settingsError;

    appState.userSettings = settings;

    // Create default modules
    const modulesData = defaultModules.map((module, index) => ({
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

    console.log('First-time user initialized successfully');

  } catch (error) {
    console.error('Error initializing first-time user:', error);
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

    // Load daily note
    const { data: note, error: noteError } = await supabase
      .from('daily_notes')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('date', dateStr)
      .single();

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
    // Get all tasks
    const { data: allTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', currentUser.id);

    if (tasksError) throw tasksError;

    // Calculate completion for each module
    for (const module of appState.modules) {
      // Count completed subtopics based on task names matching subtopics
      const completedSubtopics = new Set();

      for (const task of allTasks) {
        if (task.completed) {
          // Check if task name contains any subtopic
          for (const subtopic of module.subtopics_list) {
            if (task.task_name.includes(subtopic) || task.task_name.includes(module.name)) {
              completedSubtopics.add(subtopic);
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
function switchView(viewName) {
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
    modules: 'modulesView'
  };

  document.getElementById(viewMap[viewName]).style.display = 'block';

  // Render the view
  if (viewName === 'daily') renderDailyView();
  else if (viewName === 'weekly') renderWeeklyView();
  else if (viewName === 'calendar') renderCalendarView();
  else if (viewName === 'modules') renderModulesView();
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
  const dailyContent = document.getElementById('dailyContent');

  if (categories.length === 0) {
    dailyContent.innerHTML = `
      <div class="empty-state">
        <p>No tasks scheduled for this day.</p>
        <p>Use the settings to customize your study schedule.</p>
      </div>
    `;
  } else {
    dailyContent.innerHTML = categories.map((category, catIndex) => `
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
                <li class="task-item ${task.completed ? 'completed' : ''}">
                  <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTaskCompletion('${task.id}')"
                  />
                  <div class="task-details">
                    <div class="task-name">${task.task_name}</div>
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
function renderWeeklyView() {
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

  const weeklyContent = document.getElementById('weeklyContent');
  weeklyContent.innerHTML = weekDays.map(day => {
    const dayName = day.toLocaleDateString('en-GB', { weekday: 'long' });

    return `
      <div class="week-day-card" onclick="viewDayFromWeek('${formatDateISO(day)}')">
        <div class="week-day-header">${dayName}</div>
        <div class="week-day-date">${formatDateShort(day)}</div>
        <div class="week-day-info">Study Day</div>
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

function changeWeek(delta) {
  const weekStart = getWeekStart(appState.viewingDate);
  weekStart.setDate(weekStart.getDate() + (delta * 7));
  appState.viewingDate = weekStart;
  renderWeeklyView();
}

// Render Calendar View
function renderCalendarView() {
  const viewMonth = appState.viewingMonth;
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  document.getElementById('currentMonth').textContent =
    viewMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = lastDay.getDate();

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
    let dayClass = 'calendar-day';

    if (date.toDateString() === today.toDateString()) {
      dayClass += ' today';
    }

    html += `
      <div class="${dayClass}" onclick="viewDayFromCalendar('${formatDateISO(date)}')">
        <div class="calendar-day-number">${day}</div>
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

function changeMonth(delta) {
  const newMonth = new Date(appState.viewingMonth);
  newMonth.setMonth(newMonth.getMonth() + delta);
  appState.viewingMonth = newMonth;
  renderCalendarView();
}

// Render Modules View
function renderModulesView() {
  const modulesContent = document.getElementById('modulesContent');

  modulesContent.innerHTML = appState.modules.map(module => {
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

// Close modal on outside click
window.onclick = function(event) {
  const settingsModal = document.getElementById('settingsModal');
  if (event.target === settingsModal) {
    closeSettingsModal();
  }
};
