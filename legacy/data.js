// Application Data
const appData = {
  examDate: new Date('2026-01-14'),
  currentDate: new Date('2025-10-31'),
  brazilTripStart: new Date('2025-12-19'),
  brazilTripEnd: new Date('2025-12-29'),
  
  sbaTests: {
    anatomyEmbryology: { name: 'Anatomy + Embryology SBA', totalDays: 8, readingTime: '2h 10m', avgTime: '15-20 min', completed: 0 },
    endocrinologyPathology: { name: 'Endocrinology + Pathology SBA', totalDays: 8, readingTime: '2h 1m', avgTime: '15-20 min', completed: 0 },
    clinicalData: { name: 'Clinical Management & Data Interpretation SBA', totalDays: 8, readingTime: '2h 4m', avgTime: '15-20 min', completed: 0 },
    anatomy: { name: 'Anatomy SBA', totalDays: 6, readingTime: '1h 36m', avgTime: '15-20 min', completed: 0 },
    physiology: { name: 'Physiology SBA', totalDays: 6, readingTime: '1h 30m', avgTime: '15 min', completed: 0 },
    endocrinology: { name: 'Endocrinology SBA', totalDays: 6, readingTime: '1h 30m', avgTime: '15 min', completed: 0 },
    biostatistics: { name: 'Biostatistics SBA', totalDays: 4, readingTime: '1h 0m', avgTime: '15 min', completed: 0 }
  },
  
  sbaCompletions: {},
  dailySBACompletions: {},
  dailySBAPracticeTests: [],
  catchUpQueue: [],
  rescheduleModal: null,
  
  modules: [
    { name: 'Anatomy', exam_weight: 10, subtopics: 13, color: '#3498db', completed: 0,
      subtopicsList: ['Kidneys, Ureters & Bladder', 'Nerve Injuries', 'Anterior Abdominal Wall', 'Pelvis & Foetal Skull', 'Vagina & Ovaries', 'Vulva', 'Intra-abdominal Organs', 'Perineum, Inguinal & Femoral Canal', 'Inguinal Region', 'Thigh', 'Wisdom Shots', 'Beginners Blueprint Videos', 'Concept Based Videos'] },
    { name: 'Genetics', exam_weight: 5, subtopics: 10, color: '#e74c3c', completed: 0,
      subtopicsList: ['Structure of Chromosome', 'Genetic Disorders', 'Cell Division', 'Genetic Syndrome', 'Gene Abnormalities & Inheritance Patterns', 'How to Interpret Pedigree Charts', 'Chromosomal Abnormalities', 'Genetic Tests and Interpretation of Results', 'Questions', 'Wisdom Shots'] },
    { name: 'Physiology', exam_weight: 8, subtopics: 9, color: '#2ecc71', completed: 0,
      subtopicsList: ['Urinary System & Acid Base Balance', 'Male & Female Reproductive System', 'Cardiac & Respiratory System', 'Physiological Changes in Pregnancy', 'GIT & Nutrition', 'Foetal and Placental', 'Questions', 'Wisdom Shots', 'Beginners Blueprint Video'] },
    { name: 'Endocrinology', exam_weight: 6, subtopics: 10, color: '#f39c12', completed: 0,
      subtopicsList: ['RAAS', 'Placental and Foetal Hormones', 'Thyroid & Parathyroid Hormones', 'Adrenal Hormones', 'Pancreatic Hormones', 'Sex Hormones & Related Conditions', 'Hypothalamic & Pituitary Hormones', 'Wisdom Shots', 'Beginners Blueprint Video', 'Questions'] },
    { name: 'Biochemistry', exam_weight: 8, subtopics: 10, color: '#9b59b6', completed: 0,
      subtopicsList: ['Lipid', 'Nucleic Acids, Hormones and Prostaglandins', 'Vitamins & Minerals', 'Fats', 'Proteins', 'Starvation', 'Carbohydrates', 'Questions', 'General Biochemistry – Cell', 'Wisdom Shots'] },
    { name: 'Embryology', exam_weight: 8, subtopics: 8, color: '#1abc9c', completed: 0,
      subtopicsList: ['Development of Urogenital System', 'Development of Cardiac System', 'Foetal Circulation', 'Early Development of Embryo', 'Development of GIT', 'Development of CNS', 'Wisdom Shots', 'Questions'] },
    { name: 'Microbiology & Immunology', exam_weight: 10, subtopics: 15, color: '#34495e', completed: 0,
      subtopicsList: ['Bacteria', 'Fungi', 'General Immunology & Mediators', 'Immunology of Pregnancy', 'Viruses', 'Protozoa', 'Adaptive/Innate Immunity', 'Perinatal Infections', 'Bacterial Sepsis', 'Vaccines and Immune Response', 'Clinical Application Questions', 'Wisdom Shots', 'Questions'] },
    { name: 'Pathology', exam_weight: 7, subtopics: 8, color: '#c0392b', completed: 0,
      subtopicsList: ['Inflammation', 'Benign Gynae Conditions', 'Cellular Adaptations', 'Coagulation', 'Sepsis & Shock', 'Oncology', 'Wisdom Shots', 'Questions'] },
    { name: 'Pharmacology', exam_weight: 7, subtopics: 9, color: '#16a085', completed: 0,
      subtopicsList: ['NSAIDs', 'Anti-epileptics', 'Antibiotics', 'Antihypertensives', 'Pharmacokinetics in Pregnancy', 'Contraceptives', 'Drugs used in Gynae', 'Wisdom Shots', 'Questions'] },
    { name: 'Clinical Management', exam_weight: 20, subtopics: 19, color: '#2980b9', completed: 0,
      subtopicsList: ['Frase & Guillick', 'Valid Consent', 'Abortion, Ectopic and Mole', 'Management of Labour', 'Management of Women with Rh Antibodies', 'Hypertension in Pregnancy', 'Diabetes in Pregnancy', 'Instruments', 'OASIS', 'CTG New Guideline', 'CTG Interpretation', 'Endometrial Hyperplasia & Endometriosis', 'Ovarian Cysts', 'Heavy Menstrual Bleeding', 'PCOS', 'PID', 'Blueprint Video', 'Wisdom Shots', 'Questions'] },
    { name: 'Biostatistics', exam_weight: 7, subtopics: 14, color: '#8e44ad', completed: 0,
      subtopicsList: ['Variable & Types', 'Study Design', 'Hypothesis Testing', 'Graphs', 'Definition of Biostatistics', 'Inferential Statistics', 'Measures of Central Tendency', 'Probability', 'Odds Ratio, Relative Risk, ARR and NNT', 'Normal Distribution & CI', 'Effect Estimation', 'Diagnostic Accuracy Tests', 'Wisdom Shots', 'Questions'] },
    { name: 'Data Interpretation', exam_weight: 4, subtopics: 8, color: '#d35400', completed: 0,
      subtopicsList: ['ABG Analysis', 'Clinical Governance', 'Haem Abnormalities', 'Urogynaecology', 'Biophysics', 'Spirometry', 'Wisdom Shots', 'Questions'] }
  ],
  
  revisionResources: {
    gtgPodcasts: [
      'Management of Perineal Tear GTG 29',
      'Management of Shoulder Dystocia',
      'Red Cell Antibodies GTG 65',
      'Premenopausal Ovarian Mass GTG 62',
      'Bacterial Sepsis GTG 64',
      'Postmenopausal Ovarian Cyst GTG 34'
    ],
    gtgSummaries: [
      'Breech and ECV', 'Gestational Trophoblastic Disease', 'Endometriosis',
      'Female Genital Mutilation', 'PCOS', 'Obstetric Cholestasis',
      'Amniocentesis and CVS', 'Chickenpox in Pregnancy',
      'Management of 3rd and 4th degree perineal tears', 'Assisted Vaginal Births',
      'Bacterial Sepsis in Pregnancy', 'Thromboembolism Acute Management',
      'Management of Endometrial Hyperplasia', 'Nausea and Vomiting in Pregnancy',
      'Premenopausal Ovarian Masses', 'Rh Negative Management',
      'Postmenopausal Ovarian Cyst', 'Shoulder Dystocia',
      'Reducing risk of VTE in Pregnancy', 'Prevention and management of PPH'
    ],
    niceGuidelines: [
      'Intrapartum Care', 'Diabetes in Pregnancy', 'Endometriosis',
      'Heavy Menstrual Bleeding', 'Urinary Incontinence and Prolapse',
      'Fertility Problems Assessment and Treatment'
    ],
    rrrSessions: {
      'Jan2024': [
        'Session 1: Pharmacology, Clinical Management',
        'Session 2: Microbiology, Embryology',
        'Session 3: Endocrinology',
        'Session 4: Genetics, Biostatistics',
        'Session 5: Biostatistics, Anatomy',
        'Session 6: Anatomy',
        'Session 7: Embryology',
        'Session 8: Pathology',
        'Session 9: Embryology 2'
      ],
      'Jul2024': [
        'Session 1: Clinical Management, Pathology Cellular Adaptation',
        'Session 2: Biostatistics, Genetics Pedigree Charts',
        'Session 3: Endocrinology, Anatomy of Female Reproductive',
        'Session 4: Data Interpretation, Biochemistry',
        'Session 5: Anatomy, Biophysics (Lasers)',
        'Session 6: Physiology, Biostatistics',
        'Session 7: Microbiology, Clinical Management (CTG)',
        'Session 8: Embryology, Data Interpretation',
        'Session 9: Immunology, Embryology',
        'Session 10: Genetics, Endocrinology (Adrenal & Pancreatic)',
        'Session 11: Biophysics, Immunology (Adaptive/Innate)',
        'Session 12: Pharmacology, Microbiology (Perinatal Infections)',
        'Session 13: Biochemistry, Pharmacology (Antibiotics)',
        'Session 14: Pathology, Physiology (Changes in Pregnancy)'
      ]
    }
  },
  
  studySchedule: {
    'Nov 1-9': { modules: ['Biostatistics', 'Biochemistry', 'Biophysics'], intensity: 'moderate' },
    'Nov 10-19': { modules: ['Biochemistry continued', 'Microbiology', 'Immunology'], intensity: 'moderate' },
    'Nov 20-Dec 2': { modules: ['Data Interpretation', 'Embryology', 'Endocrinology'], intensity: 'moderate-high' },
    'Dec 3-13': { modules: ['Endocrinology continued', 'Genetics', 'Immunology review'], intensity: 'high' },
    'Dec 14-18': { modules: ['Revision of all modules'], intensity: 'high' },
    'Dec 19-29': { modules: ['Light review, questions only'], intensity: 'very-low' },
    'Dec 30-Jan 4': { modules: ['Pathology', 'Pharmacology', 'Anatomy', 'Mock exams'], intensity: 'high' },
    'Jan 5-11': { modules: ['Clinical Management', 'Data Interpretation', 'Mock exams', 'Final review'], intensity: 'very-high' },
    'Jan 12-13': { modules: ['Rest and light revision'], intensity: 'light' }
  },
  
  motivationalMessages: [
    "One day at a time - you're doing great!",
    "Small steps lead to big wins!",
    "You've got this - Jan 14 is going to be your day!",
    "Every question practiced is one step closer to success!",
    "Enjoy your Brazil trip - balance is key!",
    "Post-Brazil sprint - you're in the home stretch!",
    "Final week energy - bring it home!",
    "Progress, not perfection!",
    "You're stronger than you think!",
    "Keep going - you're making it happen!"
  ],
  
  dailyNotes: {},
  taskCompletions: {},
  
  viewingDate: new Date('2025-10-31'),
  viewingWeekStart: null,
  viewingMonth: new Date('2025-11-01'),
  
  catchUpQueueVisible: true
};

// Helper Functions
function formatDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getDaysBetween(date1, date2) {
  const diffTime = date2 - date1;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function isWorkDay(date) {
  const dateStr = date.toISOString().split('T')[0];
  const dayData = detailedSchedule[dateStr];
  return dayData && dayData.type === 'work';
}

function isRevisionDay(date) {
  const dateStr = date.toISOString().split('T')[0];
  const dayData = detailedSchedule[dateStr];
  return dayData && dayData.type === 'revision';
}

function isBrazilTrip(date) {
  return date >= appData.brazilTripStart && date <= appData.brazilTripEnd;
}

function isExamDay(date) {
  return date.toDateString() === appData.examDate.toDateString();
}

function getWorkInfo(date) {
  const dateStr = date.toISOString().split('T')[0];
  const dayData = detailedSchedule[dateStr];
  
  if (!dayData) return 'Regular study day';
  
  switch(dayData.type) {
    case 'work':
      return '🏥 WORK DAY (1000-2200 shift) - Focus on 1 specific topic only';
    case 'off':
      return '📚 OFF DAY - Full study capacity with multiple topics';
    case 'revision':
      return '🔄 REVISION DAY - Comprehensive review + Mock exam';
    case 'intensive':
      return '🔥 INTENSIVE STUDY DAY - Deep dive into topics';
    case 'intensive-post':
      return '💪 POST-BRAZIL INTENSIVE - Get back on track';
    case 'trip':
      return '🌴 BRAZIL TRIP - Minimal/optional study';
    case 'trip-end':
      return '🌴 BRAZIL TRIP ENDS - Ease back into study';
    case 'rest':
      return '😌 REST DAY - Very light review only';
    case 'exam-eve':
      return '🎯 EXAM EVE - Mental preparation, early night';
    case 'light':
      return '📖 LIGHT STUDY DAY - Reduced load';
    default:
      return 'Regular study day';
  }
}

// SBA Test Schedule - integrated into daily study
const sbaSchedule = {
  '2025-11-01': ['Biostatistics SBA Day 1'],
  '2025-11-02': ['Biostatistics SBA Day 2'],
  '2025-11-03': ['Biostatistics SBA Day 3'],
  '2025-11-04': ['Biostatistics SBA Day 4'],
  '2025-11-06': ['Anatomy SBA Day 1'],
  '2025-11-07': ['Anatomy SBA Day 2'],
  '2025-11-08': ['Anatomy SBA Day 3'],
  '2025-11-09': ['Anatomy SBA Day 4'],
  '2025-11-10': ['Anatomy SBA Day 5'],
  '2025-11-11': ['Anatomy SBA Day 6'],
  '2025-11-12': ['Physiology SBA Day 1'],
  '2025-11-13': ['Physiology SBA Day 2'],
  '2025-11-14': ['Physiology SBA Day 3'],
  '2025-11-15': ['Physiology SBA Day 4'],
  '2025-11-16': ['Physiology SBA Day 5'],
  '2025-11-17': ['Physiology SBA Day 6'],
  '2025-11-18': ['Endocrinology SBA Day 1'],
  '2025-11-19': ['Endocrinology SBA Day 2'],
  '2025-11-20': ['Endocrinology SBA Day 3'],
  '2025-11-21': ['Endocrinology SBA Day 4'],
  '2025-11-22': ['Endocrinology SBA Day 5'],
  '2025-11-23': ['Endocrinology SBA Day 6'],
  '2025-11-24': ['Anatomy+Embryology SBA Day 1'],
  '2025-11-25': ['Anatomy+Embryology SBA Day 2'],
  '2025-11-26': ['Anatomy+Embryology SBA Day 3'],
  '2025-11-27': ['Anatomy+Embryology SBA Day 4'],
  '2025-11-28': ['Anatomy+Embryology SBA Day 5'],
  '2025-11-29': ['Anatomy+Embryology SBA Day 6'],
  '2025-11-30': ['Anatomy+Embryology SBA Day 7'],
  '2025-12-01': ['Anatomy+Embryology SBA Day 8'],
  '2025-12-02': ['Endocrinology+Pathology SBA Day 1'],
  '2025-12-03': ['Endocrinology+Pathology SBA Day 2'],
  '2025-12-04': ['Endocrinology+Pathology SBA Day 3'],
  '2025-12-05': ['Endocrinology+Pathology SBA Day 4'],
  '2025-12-06': ['Endocrinology+Pathology SBA Day 5'],
  '2025-12-07': ['Endocrinology+Pathology SBA Day 6'],
  '2025-12-08': ['Endocrinology+Pathology SBA Day 7'],
  '2025-12-09': ['Endocrinology+Pathology SBA Day 8'],
  '2025-12-10': ['Clinical+Data SBA Day 1'],
  '2025-12-11': ['Clinical+Data SBA Day 2'],
  '2025-12-12': ['Clinical+Data SBA Day 3'],
  '2025-12-13': ['Clinical+Data SBA Day 4'],
  '2025-12-14': ['Clinical+Data SBA Day 5'],
  '2025-12-15': ['Clinical+Data SBA Day 6'],
  '2025-12-16': ['Clinical+Data SBA Day 7'],
  '2025-12-17': ['Clinical+Data SBA Day 8']
};

// Detailed day-by-day schedule with unique topics for every single day
const detailedSchedule = {
  '2025-11-01': { topics: ['Biostatistics: Variables & Types'], type: 'work', resources: ['Lecture Summary', 'Telegram Q'] },
  '2025-11-02': { topics: ['Biostatistics: Study Design', 'Biostatistics: Hypothesis Testing', 'Biostatistics: Graphs'], type: 'off', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-11-03': { topics: ['Biostatistics: Study Design recap'], type: 'work', resources: ['Podcast', 'Telegram Q'] },
  '2025-11-04': { topics: ['Biochemistry: Lipids'], type: 'work', resources: ['Lecture Summary', 'Telegram Q'] },
  '2025-11-05': { topics: ['Biochemistry: Lipids', 'Biochemistry: Nucleic Acids, Hormones & Prostaglandins', 'Biochemistry: Vitamins & Minerals'], type: 'off', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-11-06': { topics: ['Biochemistry: Nucleic Acids, Hormones & Prostaglandins'], type: 'work', resources: ['Podcast', 'Telegram Q'] },
  '2025-11-07': { topics: ['Biochemistry: Vitamins & Minerals'], type: 'work', resources: ['Lecture Summary', 'Telegram Q'] },
  '2025-11-08': { topics: ['Biochemistry: Proteins'], type: 'work', resources: ['Podcast', 'Telegram Q'] },
  '2025-11-09': { topics: ['Biochemistry: Fats', 'Biochemistry: Carbohydrates', 'Biochemistry: Starvation', 'Biochemistry: Cell Biology', 'Biochemistry: Wisdom Shots'], type: 'revision', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q', 'Mock Exam option'] },
  '2025-11-10': { topics: ['Biochemistry: Fats'], type: 'work', resources: ['Lecture Summary', 'Telegram Q'] },
  '2025-11-11': { topics: ['Biochemistry: Carbohydrates', 'Biochemistry: Starvation', 'Biochemistry: Cell Biology'], type: 'off', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-11-12': { topics: ['Biochemistry: Cell Biology & Wisdom Shots'], type: 'work', resources: ['Podcast', 'Telegram Q'] },
  '2025-11-13': { topics: ['Microbiology: Bacteria', 'Microbiology: Fungi'], type: 'off', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-11-14': { topics: ['Microbiology: Bacteria'], type: 'work', resources: ['Lecture Summary', 'Telegram Q'] },
  '2025-11-15': { topics: ['Microbiology: Fungi'], type: 'work', resources: ['Podcast', 'Telegram Q'] },
  '2025-11-16': { topics: ['Biostatistics Mock Exam', 'Biostatistics & Biochemistry core concepts review'], type: 'revision', resources: ['Full Mock Exam', 'Lecture Summary review', 'Course Questions', 'Telegram Q'] },
  '2025-11-17': { topics: ['Immunology: General Immunology & Mediators'], type: 'work', resources: ['Lecture Summary', 'Telegram Q'] },
  '2025-11-18': { topics: ['Immunology: Immunology of Pregnancy', 'Immunology: Viruses'], type: 'off', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-11-19': { topics: ['Immunology: Protozoa'], type: 'work', resources: ['Podcast', 'Telegram Q'] },
  '2025-11-20': { topics: ['Data Interpretation: ABG Analysis'], type: 'work', resources: ['Lecture Summary', 'Telegram Q'] },
  '2025-11-21': { topics: ['Data Interpretation: ABG Analysis', 'Data Interpretation: Clinical Governance'], type: 'off', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-11-22': { topics: ['Data Interpretation: Haem Abnormalities'], type: 'work', resources: ['Podcast', 'Telegram Q'] },
  '2025-11-23': { topics: ['Data Interpretation Mock Exam', 'Data Interpretation: Urogynaecology', 'Data Interpretation: Biophysics review'], type: 'revision', resources: ['Full Mock Exam', 'Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-11-24': { topics: ['Embryology: Development of Urogenital System'], type: 'work', resources: ['Lecture Summary', 'Telegram Q'] },
  '2025-11-25': { topics: ['Embryology: Development of Cardiac System', 'Embryology: Foetal Circulation'], type: 'off', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-11-26': { topics: ['Embryology: Early Development of Embryo'], type: 'work', resources: ['Podcast', 'Telegram Q'] },
  '2025-11-27': { topics: ['Embryology: Development of GIT', 'Embryology: Development of CNS'], type: 'off', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-11-28': { topics: ['Embryology: Wisdom Shots & Questions review'], type: 'work', resources: ['Lecture Summary', 'Telegram Q'] },
  '2025-11-29': { topics: ['Endocrinology: RAAS'], type: 'work', resources: ['Podcast', 'Telegram Q'] },
  '2025-11-30': { topics: ['Embryology Mock Exam', 'July RRR Session 9: Embryology & Immunology review'], type: 'revision', resources: ['Full Mock Exam', 'Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-12-01': { topics: ['Endocrinology: Placental and Foetal Hormones'], type: 'work', resources: ['Lecture Summary', 'Telegram Q'] },
  '2025-12-02': { topics: ['Endocrinology: Thyroid & Parathyroid Hormones', 'Endocrinology: Adrenal Hormones'], type: 'off', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-12-03': { topics: ['Endocrinology: Pancreatic Hormones'], type: 'work', resources: ['Podcast', 'Telegram Q'] },
  '2025-12-04': { topics: ['Endocrinology: Sex Hormones & Related Conditions', 'Endocrinology: Hypothalamic & Pituitary Hormones'], type: 'off', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-12-05': { topics: ['Endocrinology: Wisdom Shots'], type: 'work', resources: ['Lecture Summary', 'Telegram Q'] },
  '2025-12-06': { topics: ['Endocrinology Mock Exam - Light day'], type: 'work', resources: ['Mock Exam OR Questions only', 'Telegram Q'] },
  '2025-12-07': { topics: ['Endocrinology comprehensive review', 'July RRR Session 10: Endocrinology (Adrenal & Pancreatic)'], type: 'revision', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-12-08': { topics: ['Genetics: Structure of Chromosome'], type: 'work', resources: ['Lecture Summary', 'Telegram Q'] },
  '2025-12-09': { topics: ['Genetics: Genetic Disorders', 'Genetics: Cell Division'], type: 'off', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-12-10': { topics: ['Genetics: Genetic Syndrome & How to Interpret Pedigree Charts'], type: 'work', resources: ['Podcast', 'Telegram Q'] },
  '2025-12-11': { topics: ['Genetics: Chromosomal Abnormalities', 'Genetics: Genetic Tests and Interpretation'], type: 'off', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-12-12': { topics: ['Genetics: Wisdom Shots & Questions practice'], type: 'work', resources: ['Lecture Summary', 'Telegram Q'] },
  '2025-12-13': { topics: ['Genetics Mock Exam - Light questions focus'], type: 'work', resources: ['Mock Exam OR Questions only', 'Telegram Q'] },
  '2025-12-14': { topics: ['Clinical Management Obstetrics: Frase & Guillick', 'Clinical Management Obstetrics: Valid Consent'], type: 'intensive', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-12-15': { topics: ['Clinical Management Obstetrics: Abortion, Ectopic & Mole', 'Clinical Management Obstetrics: Management of Labour'], type: 'intensive', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-12-16': { topics: ['Clinical Management Obstetrics: Management of Rh Antibodies', 'Clinical Management Obstetrics: Hypertension in Pregnancy'], type: 'intensive', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-12-17': { topics: ['Clinical Management Obstetrics: Diabetes in Pregnancy', 'Clinical Management Obstetrics: Instruments', 'Clinical Management Obstetrics: OASIS'], type: 'intensive', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-12-18': { topics: ['Clinical Management Obstetrics: CTG New Guideline', 'Clinical Management Obstetrics: CTG Interpretation', 'Mock exam simulation'], type: 'intensive', resources: ['Full Mock Exam', 'Lecture Summary', 'Podcast', 'Course Questions', 'Telegram Q'] },
  '2025-12-19': { topics: ['Brazil Trip - Light Telegram questions only'], type: 'trip', resources: ['Optional Telegram Q (10-20 questions)'] },
  '2025-12-20': { topics: ['Brazil Trip - Optional light review'], type: 'trip', resources: ['Optional Podcast if time'] },
  '2025-12-21': { topics: ['Brazil Trip - Enjoy, no study'], type: 'trip', resources: [] },
  '2025-12-22': { topics: ['Brazil Trip - Light questions if motivated'], type: 'trip', resources: ['Optional Telegram Q'] },
  '2025-12-23': { topics: ['Brazil Trip - Full relaxation'], type: 'trip', resources: [] },
  '2025-12-24': { topics: ['Brazil Trip - Light Telegram questions'], type: 'trip', resources: ['Optional Telegram Q'] },
  '2025-12-25': { topics: ['Brazil Trip - Enjoy Christmas'], type: 'trip', resources: [] },
  '2025-12-26': { topics: ['Brazil Trip - Optional light questions'], type: 'trip', resources: ['Optional Telegram Q'] },
  '2025-12-27': { topics: ['Brazil Trip - Light Telegram questions'], type: 'trip', resources: ['Optional Both Telegram groups'] },
  '2025-12-28': { topics: ['Brazil Trip - Trip final day'], type: 'trip', resources: [] },
  '2025-12-29': { topics: ['Brazil Trip END - Light Telegram questions to ease back in'], type: 'trip-end', resources: ['Optional Both Telegram groups'] },
  '2025-12-30': { topics: ['Pathology: Inflammation'], type: 'intensive-post', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2025-12-31': { topics: ['Pathology: Benign Gynae Conditions', 'Pathology: Cellular Adaptations'], type: 'intensive-post', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2026-01-01': { topics: ['Pathology: Coagulation focus - Light day (NEW YEAR)'], type: 'light', resources: ['Podcast', 'Telegram Q'] },
  '2026-01-02': { topics: ['Pharmacology: NSAIDs', 'Pharmacology: Anti-epileptics'], type: 'intensive-post', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2026-01-03': { topics: ['Pharmacology: Antibiotics'], type: 'intensive-post', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2026-01-04': { topics: ['Pharmacology: Antihypertensives', 'Pharmacology: Pharmacokinetics in Pregnancy', 'Pharmacology: Contraceptives'], type: 'intensive-post', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2026-01-05': { topics: ['Anatomy: Kidneys, Ureters & Bladder', 'Anatomy: Nerve Injuries – Upper and Lower Limb'], type: 'intensive', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2026-01-06': { topics: ['Anatomy: Anterior Abdominal Wall', 'Anatomy: Pelvis & Foetal Skull'], type: 'intensive', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2026-01-07': { topics: ['Anatomy: Vagina & Ovaries', 'Anatomy: Vulva'], type: 'intensive', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2026-01-08': { topics: ['Anatomy: Intra-abdominal Organs', 'Anatomy: Perineum, Inguinal & Femoral Canal'], type: 'intensive', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2026-01-09': { topics: ['Anatomy Mock Exam', 'GTG Podcast: Shoulder Dystocia review'], type: 'intensive', resources: ['Full Mock Exam', 'Podcast', 'Course Questions', 'Telegram Q'] },
  '2026-01-10': { topics: ['Clinical Management: CTG Interpretation', 'Clinical Management: Instruments', 'Clinical Management: OASIS'], type: 'intensive', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2026-01-11': { topics: ['Clinical Management Gynaecology: Endometrial Hyperplasia & Endometriosis', 'Clinical Management Gynaecology: Ovarian Cysts', 'Clinical Management Gynaecology: Heavy Menstrual Bleeding'], type: 'intensive', resources: ['Lecture Summary', 'Podcast', 'Video', 'Course Questions', 'Telegram Q'] },
  '2026-01-12': { topics: ['GTG Summary: Management of Perineal Tears', 'GTG Summary: Prevention and management of PPH'], type: 'rest', resources: ['Light review only', 'Optional Telegram Q'] },
  '2026-01-13': { topics: ['Exam Eve - Mental preparation, minimal study'], type: 'exam-eve', resources: ['Optional light Telegram Q', 'Mental preparation', 'Avoid heavy material'] }
};

function getSpecificTopicsForDate(date) {
  const dateStr = date.toISOString().split('T')[0];
  const dayData = detailedSchedule[dateStr];
  
  if (dayData) {
    return dayData.topics;
  }
  
  return ['General Study Period'];
}

function getModulesForDate(date) {
  const month = date.getMonth();
  const day = date.getDate();
  
  if (month === 10) { // November
    if (day >= 1 && day <= 9) return ['Biostatistics', 'Biochemistry', 'Biophysics'];
    if (day >= 10 && day <= 19) return ['Biochemistry', 'Microbiology', 'Immunology'];
    if (day >= 20) return ['Data Interpretation', 'Embryology', 'Endocrinology'];
  }
  if (month === 11) { // December
    if (day >= 1 && day <= 2) return ['Data Interpretation', 'Embryology', 'Endocrinology'];
    if (day >= 3 && day <= 13) return ['Endocrinology', 'Genetics', 'Immunology'];
    if (day >= 14 && day <= 18) return ['Revision of all modules'];
    if (day >= 19 && day <= 29) return ['Light review only'];
    if (day >= 30) return ['Pathology', 'Pharmacology', 'Anatomy'];
  }
  if (month === 0 && date.getFullYear() === 2026) { // January 2026
    if (day >= 1 && day <= 4) return ['Pathology', 'Pharmacology', 'Anatomy', 'Mock exams'];
    if (day >= 5 && day <= 11) return ['Clinical Management', 'Data Interpretation', 'Final review'];
    if (day >= 12 && day <= 13) return ['Rest and light revision'];
  }
  return ['General Review'];
}

function getSBATestsForDate(date) {
  const dateStr = date.toISOString().split('T')[0];
  return sbaSchedule[dateStr] || [];
}

function isSBACompleted(dateStr, sbaTest) {
  const key = `${dateStr}-${sbaTest}`;
  return appData.sbaCompletions[key] || false;
}

function toggleSBACompletion(dateStr, sbaTest) {
  const key = `${dateStr}-${sbaTest}`;
  appData.sbaCompletions[key] = !appData.sbaCompletions[key];
  updateSBAProgress();
}

function updateSBAProgress() {
  const totalCompleted = Object.values(appData.sbaCompletions).filter(v => v).length;
  document.getElementById('sbaCompleted').textContent = totalCompleted;
  document.getElementById('namedSBACount').textContent = `${totalCompleted}/46`;
  
  // Update individual module counts
  Object.keys(appData.sbaTests).forEach(key => {
    appData.sbaTests[key].completed = 0;
  });
  
  Object.keys(appData.sbaCompletions).forEach(key => {
    if (appData.sbaCompletions[key]) {
      if (key.includes('Biostatistics')) appData.sbaTests.biostatistics.completed++;
      else if (key.includes('Anatomy+Embryology')) appData.sbaTests.anatomyEmbryology.completed++;
      else if (key.includes('Endocrinology+Pathology')) appData.sbaTests.endocrinologyPathology.completed++;
      else if (key.includes('Clinical+Data')) appData.sbaTests.clinicalData.completed++;
      else if (key.includes('Anatomy SBA')) appData.sbaTests.anatomy.completed++;
      else if (key.includes('Physiology')) appData.sbaTests.physiology.completed++;
      else if (key.includes('Endocrinology SBA')) appData.sbaTests.endocrinology.completed++;
    }
  });
  
  // Update Daily SBA Practice counts
  updateDailySBACounts();
}

function updateDailySBACounts() {
  const currentDate = new Date(appData.currentDate);
  const examDate = new Date(appData.examDate);
  
  // Calculate days from Nov 1 to exam (Jan 14)
  const startDate = new Date('2025-11-01');
  const totalDaysUntilExam = Math.ceil((examDate - startDate) / (1000 * 60 * 60 * 24));
  
  // Days passed since Nov 1
  const daysPassed = Math.max(0, Math.ceil((currentDate - startDate) / (1000 * 60 * 60 * 24)));
  
  // Total available = days passed (1 new test per day)
  const totalAvailable = Math.min(daysPassed, totalDaysUntilExam);
  
  // Count completed daily SBAs
  const completedCount = Object.values(appData.dailySBACompletions).filter(v => v).length;
  
  // Calculate pending
  const pendingCount = Math.max(0, totalAvailable - completedCount);
  
  // Update UI
  document.getElementById('dailySBACount').textContent = completedCount;
  document.getElementById('dailySBACompleted').textContent = completedCount;
  document.getElementById('dailySBAPending').textContent = pendingCount;
  document.getElementById('dailySBATotal').textContent = totalDaysUntilExam;
  document.getElementById('dailySBAToday').textContent = daysPassed >= 0 && daysPassed <= totalDaysUntilExam ? '1' : '0';
  document.getElementById('dailySBACatchUp').textContent = pendingCount;
}

function getDailyTasks(date) {
  const dateStr = date.toISOString().split('T')[0];
  const dayData = detailedSchedule[dateStr];
  const sbaTests = getSBATestsForDate(date);
  const dailySBAPractice = getDailySBAPracticeForDate(date);
  
  if (!dayData) {
    return [{
      category: 'No specific schedule available',
      time: 'N/A',
      items: []
    }];
  }
  
  const specificTopics = dayData.topics;
  const resources = dayData.resources;
  const dayType = dayData.type;
  const isBrazil = dayType === 'trip' || dayType === 'trip-end';
  const isWork = dayType === 'work';
  
  const tasks = [];
  
  // Check for catch-up tasks
  const catchUpTasks = appData.catchUpQueue.filter(item => item.newDate === dateStr);
  if (catchUpTasks.length > 0) {
    catchUpTasks.forEach(catchUp => {
      tasks.push({
        category: `⚠️ CATCH-UP: ${catchUp.originalTopic}`,
        time: catchUp.time,
        isCatchUp: true,
        originalDate: catchUp.originalDate,
        items: catchUp.items
      });
    });
  }
  
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
      }
      
      tasks.push({
        category: topic,
        time: isWork ? '50-60 min' : (dayType === 'revision' ? '2-3 hours' : '2-3 hours'),
        items: categoryTasks
      });
    });
  }
  
  // Telegram groups - always add unless it's a full rest day
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
    } else {
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
  if (sbaTests.length > 0) {
    const sbaItems = sbaTests.map(test => ({
      name: test,
      time: '15-20 min',
      workSuitable: true,
      isSBA: true,
      sbaKey: `${dateStr}-${test}`
    }));
    
    tasks.push({
      category: '📋 Named Module SBA Test',
      time: '15-20 min',
      items: sbaItems,
      isSBA: true
    });
  }
  
  // Add Daily SBA Practice tests if scheduled for this day
  if (dailySBAPractice.length > 0) {
    const dailySBAItems = dailySBAPractice.map(test => ({
      name: test.name,
      time: '15-20 min',
      workSuitable: true,
      isDailySBA: true,
      dailySBAKey: test.key
    }));
    
    tasks.push({
      category: '🎯 Daily SBA Practice Test',
      time: '15-20 min',
      items: dailySBAItems,
      isDailySBA: true
    });
  }
  
  return tasks;
}

function getDailySBAPracticeForDate(date) {
  const dateStr = date.toISOString().split('T')[0];
  return appData.dailySBAPracticeTests.filter(test => test.date === dateStr);
}

function addDailySBAToDay(targetDate) {
  const date = targetDate || appData.viewingDate;
  const dateStr = date.toISOString().split('T')[0];
  
  // Check if already has a daily SBA practice for this day
  const existing = appData.dailySBAPracticeTests.filter(t => t.date === dateStr).length;
  const testNumber = existing + 1;
  
  const dailySBA = {
    key: `daily-sba-${dateStr}-${testNumber}`,
    date: dateStr,
    name: `Daily SBA Practice: New Test ${testNumber}`,
    addedOn: new Date().toISOString()
  };
  
  appData.dailySBAPracticeTests.push(dailySBA);
  renderDailyView();
  updateDailySBACounts();
  
  // Show confirmation
  alert(`Daily SBA Practice test added to ${formatDate(date)}!`);
}

function toggleDailySBAHistory() {
  const history = document.getElementById('dailySBAHistory');
  if (history.style.display === 'none') {
    history.style.display = 'block';
    renderDailySBAHistory();
  } else {
    history.style.display = 'none';
  }
}

function renderDailySBAHistory() {
  const history = document.getElementById('dailySBAHistory');
  
  if (appData.dailySBAPracticeTests.length === 0) {
    history.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-20);">No daily SBA practice tests added yet. Click "Add Daily SBA Practice" to get started!</p>';
    return;
  }
  
  // Sort by date
  const sorted = [...appData.dailySBAPracticeTests].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  history.innerHTML = sorted.map(test => {
    const date = new Date(test.date);
    const isCompleted = appData.dailySBACompletions[test.key];
    
    return `
      <div class="daily-sba-history-item ${isCompleted ? 'completed' : ''}">
        <div>
          <div class="daily-sba-history-date">${formatDate(date)}</div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${test.name}</div>
        </div>
        <div class="daily-sba-history-status">${isCompleted ? '✓ Completed' : 'Pending'}</div>
      </div>
    `;
  }).join('');
}

function getTaskKey(date, categoryIndex, itemIndex) {
  return `${date.toISOString().split('T')[0]}-${categoryIndex}-${itemIndex}`;
}

function isTaskCompleted(date, categoryIndex, itemIndex) {
  const key = getTaskKey(date, categoryIndex, itemIndex);
  return appData.taskCompletions[key] || false;
}

function toggleTaskCompletion(date, categoryIndex, itemIndex) {
  const key = getTaskKey(date, categoryIndex, itemIndex);
  appData.taskCompletions[key] = !appData.taskCompletions[key];
  updateProgress();
  renderModulesView();
}

function addToCatchUpQueue(date, categoryIndex, taskCategory) {
  const dateStr = date.toISOString().split('T')[0];
  
  // Find next available off day or revision day
  const nextAvailableDate = findNextAvailableDay(date);
  
  const catchUpItem = {
    id: Date.now(),
    originalDate: dateStr,
    originalTopic: taskCategory.category,
    newDate: nextAvailableDate,
    time: taskCategory.time,
    items: taskCategory.items,
    categoryIndex: categoryIndex
  };
  
  appData.catchUpQueue.push(catchUpItem);
  updateCatchUpQueue();
  
  // Show reschedule modal
  showRescheduleModal(catchUpItem);
}

function findNextAvailableDay(currentDate) {
  let nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + 1);
  
  // Find next off day or revision day
  for (let i = 0; i < 30; i++) {
    const dateStr = nextDate.toISOString().split('T')[0];
    const dayData = detailedSchedule[dateStr];
    
    if (dayData && (dayData.type === 'off' || dayData.type === 'revision')) {
      return dateStr;
    }
    
    nextDate.setDate(nextDate.getDate() + 1);
  }
  
  // If no off/revision day found, return next day
  return nextDate.toISOString().split('T')[0];
}

function showRescheduleModal(catchUpItem) {
  const modal = document.createElement('div');
  modal.className = 'reschedule-modal';
  modal.id = 'rescheduleModal';
  
  const suggestedDate = new Date(catchUpItem.newDate);
  const formattedDate = formatDate(suggestedDate);
  
  modal.innerHTML = `
    <div class="reschedule-modal-content">
      <div class="reschedule-modal-header">Reschedule Task</div>
      <div class="reschedule-suggestion">
        <div class="reschedule-suggestion-label">Suggested Date:</div>
        <div class="reschedule-suggestion-date">${formattedDate}</div>
        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-8);">
          Next available OFF/REVISION day
        </div>
      </div>
      <div class="date-picker-section">
        <label class="date-picker-label">Or choose another date:</label>
        <input type="date" class="date-picker-input" id="customDatePicker" min="${new Date().toISOString().split('T')[0]}" max="2026-01-13" value="${catchUpItem.newDate}">
      </div>
      <div class="reschedule-modal-actions">
        <button class="btn btn--secondary" onclick="closeRescheduleModal()">Cancel</button>
        <button class="btn btn--primary" onclick="acceptReschedule(${catchUpItem.id})">Confirm Reschedule</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  appData.rescheduleModal = catchUpItem;
}

function closeRescheduleModal() {
  const modal = document.getElementById('rescheduleModal');
  if (modal) {
    modal.remove();
  }
  appData.rescheduleModal = null;
}

function acceptReschedule(itemId) {
  const customDate = document.getElementById('customDatePicker')?.value;
  
  if (customDate) {
    const item = appData.catchUpQueue.find(i => i.id === itemId);
    if (item) {
      item.newDate = customDate;
    }
  }
  
  closeRescheduleModal();
  updateCatchUpQueue();
  renderDailyView();
}

function removeCatchUpItem(itemId) {
  appData.catchUpQueue = appData.catchUpQueue.filter(item => item.id !== itemId);
  updateCatchUpQueue();
  renderDailyView();
}

function updateCatchUpQueue() {
  const catchUpCount = appData.catchUpQueue.length;
  document.getElementById('catchUpCount').textContent = catchUpCount;
  
  const catchUpContent = document.getElementById('catchUpContent');
  const catchUpPanel = document.getElementById('catchUpQueue');
  
  if (catchUpCount === 0) {
    catchUpContent.innerHTML = '<p class="no-catchup">No catch-up tasks! You\'re all caught up! 🎉</p>';
    if (catchUpPanel) catchUpPanel.style.display = 'none';
  } else {
    if (catchUpPanel) catchUpPanel.style.display = 'block';
    
    catchUpContent.innerHTML = appData.catchUpQueue.map(item => {
      const originalDate = new Date(item.originalDate);
      const newDate = new Date(item.newDate);
      
      return `
        <div class="catch-up-item">
          <div class="catch-up-item-info">
            <div class="catch-up-item-title">${item.originalTopic}</div>
            <div class="catch-up-item-meta">
              Original: ${formatDateShort(originalDate)} → Rescheduled to: ${formatDateShort(newDate)}
            </div>
          </div>
          <div class="catch-up-actions">
            <button class="btn btn--sm btn--secondary" onclick="showRescheduleModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">Change Date</button>
            <button class="btn btn--sm btn--outline" onclick="removeCatchUpItem(${item.id})">Remove</button>
          </div>
        </div>
      `;
    }).join('');
  }
}

function toggleCatchUpQueue() {
  appData.catchUpQueueVisible = !appData.catchUpQueueVisible;
  const panel = document.getElementById('catchUpQueue');
  const btn = document.getElementById('toggleCatchUpBtn');
  
  if (appData.catchUpQueueVisible) {
    panel.classList.remove('hidden');
    btn.textContent = 'Hide';
  } else {
    panel.classList.add('hidden');
    btn.textContent = 'Show';
  }
}

function updateProgress() {
  const totalTasks = Object.keys(appData.taskCompletions).length;
  const completedTasks = Object.values(appData.taskCompletions).filter(v => v).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  document.getElementById('overallProgress').textContent = `${progress}%`;
}

// Initialize App
function initializeApp() {
  updateHeaderStats();
  updateMotivationalBanner();
  renderDailyView();
  renderWeeklyView();
  renderCalendarView();
  renderModulesView();
  renderSBAView();
  renderRevisionResources();
  updateCatchUpQueue();
  updateSBAProgress();
  updateDailySBACounts();
  
  // Set initial viewing week
  appData.viewingWeekStart = getWeekStart(appData.viewingDate);
  
  // Initialize SBA total
  document.getElementById('sbaTotal').textContent = '46';
  
  // Auto-suggest daily SBAs after Dec 10 if named modules mostly complete
  checkAndSuggestDailySBAs();
}

function checkAndSuggestDailySBAs() {
  const currentDate = new Date(appData.currentDate);
  const transitionDate = new Date('2025-12-10');
  
  // Only suggest if past Dec 10
  if (currentDate < transitionDate) return;
  
  // Check if named SBAs are mostly complete (>= 35 out of 46)
  const namedCompleted = Object.values(appData.sbaCompletions).filter(v => v).length;
  
  if (namedCompleted >= 35) {
    // Check if we're behind on daily SBAs
    const startDate = new Date('2025-11-01');
    const daysPassed = Math.max(0, Math.ceil((currentDate - startDate) / (1000 * 60 * 60 * 24)));
    const completedDaily = Object.values(appData.dailySBACompletions).filter(v => v).length;
    const behind = daysPassed - completedDaily;
    
    if (behind > 5 && appData.dailySBAPracticeTests.length < daysPassed / 2) {
      // Show suggestion banner
      const banner = document.getElementById('motivationalBanner');
      banner.textContent = `💡 Great progress on named SBAs! Don't forget to catch up on Daily SBA Practice tests (${behind} pending).`;
      banner.style.backgroundColor = 'var(--color-bg-5)';
    }
  }
}

function getRevisionResourcesForWeek(date) {
  const month = date.getMonth();
  const day = date.getDate();
  
  const resources = {
    podcasts: [],
    summaries: [],
    nice: [],
    rrr: []
  };
  
  if (month === 10) { // November - Early topics
    if (day >= 1 && day <= 9) {
      resources.summaries = ['Clinical Governance basics'];
      resources.rrr = ['RRR Jan 2024 Session 4: Biostatistics', 'RRR Jan 2024 Session 5: Biostatistics'];
    } else if (day >= 10 && day <= 19) {
      resources.summaries = ['Bacterial Sepsis in Pregnancy', 'Chickenpox in Pregnancy'];
      resources.podcasts = ['Bacterial Sepsis GTG 64'];
      resources.rrr = ['RRR Jan 2024 Session 2: Microbiology'];
    } else if (day >= 20) {
      resources.summaries = ['Amniocentesis and CVS'];
      resources.rrr = ['RRR Jan 2024 Session 7: Embryology', 'RRR Jul 2024 Session 8: Embryology'];
    }
  } else if (month === 11) { // December
    if (day >= 1 && day <= 13) {
      resources.summaries = ['PCOS', 'Endometriosis'];
      resources.nice = ['Endometriosis'];
      resources.rrr = ['RRR Jan 2024 Session 3: Endocrinology', 'RRR Jan 2024 Session 4: Genetics'];
    } else if (day >= 14 && day <= 18) {
      resources.podcasts = ['All GTG podcasts - comprehensive review'];
      resources.summaries = ['Review all 20 GTG summaries'];
      resources.nice = ['Review all NICE guidelines'];
    }
  } else if (month === 0 && date.getFullYear() === 2026) { // January
    if (day >= 1 && day <= 4) {
      resources.summaries = ['Female Genital Mutilation', 'Management of 3rd and 4th degree perineal tears'];
      resources.podcasts = ['Management of Perineal Tear GTG 29'];
      resources.rrr = ['RRR Jan 2024 Session 1: Pharmacology', 'RRR Jan 2024 Session 6: Anatomy'];
    } else if (day >= 5 && day <= 11) {
      resources.summaries = ['Management of Labour', 'Shoulder Dystocia', 'Assisted Vaginal Births', 'Prevention and management of PPH'];
      resources.podcasts = ['Management of Shoulder Dystocia', 'Red Cell Antibodies GTG 65'];
      resources.nice = ['Intrapartum Care', 'Diabetes in Pregnancy'];
      resources.rrr = ['RRR Jan 2024 Session 1: Clinical Management', 'RRR Jul 2024 Session 7: CTG Interpretation'];
    }
  }
  
  return resources;
}

function renderRevisionResources() {
  const resources = getRevisionResourcesForWeek(appData.viewingDate);
  const hasResources = resources.podcasts.length > 0 || resources.summaries.length > 0 || 
                       resources.nice.length > 0 || resources.rrr.length > 0;
  
  const section = document.getElementById('revisionResourcesSection');
  
  if (!hasResources) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  
  let html = '';
  
  if (resources.podcasts.length > 0) {
    html += `
      <div class="resource-category">
        <div class="resource-category-title">🎧 GTG Podcasts</div>
        <ul class="resource-list">
          ${resources.podcasts.map(p => `<li class="resource-item">${p}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  if (resources.summaries.length > 0) {
    html += `
      <div class="resource-category">
        <div class="resource-category-title">📄 GTG Summaries</div>
        <ul class="resource-list">
          ${resources.summaries.map(s => `<li class="resource-item">${s}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  if (resources.nice.length > 0) {
    html += `
      <div class="resource-category">
        <div class="resource-category-title">📋 NICE Guidelines</div>
        <ul class="resource-list">
          ${resources.nice.map(n => `<li class="resource-item">${n}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  if (resources.rrr.length > 0) {
    html += `
      <div class="resource-category">
        <div class="resource-category-title">🎥 RRR Session Recordings</div>
        <ul class="resource-list">
          ${resources.rrr.map(r => `<li class="resource-item">${r}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  document.getElementById('revisionResourcesContent').innerHTML = html;
}

function updateHeaderStats() {
  const daysToExam = getDaysBetween(appData.currentDate, appData.examDate);
  const daysToBrazil = getDaysBetween(appData.currentDate, appData.brazilTripStart);
  
  document.getElementById('daysUntilExam').textContent = daysToExam;
  document.getElementById('daysUntilBrazil').textContent = daysToBrazil;
  updateProgress();
}

function updateMotivationalBanner() {
  const messages = appData.motivationalMessages;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  document.getElementById('motivationalBanner').textContent = randomMessage;
}

// View Switching
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
    section.classList.remove('active');
  });
  
  const viewMap = {
    daily: 'dailyView',
    weekly: 'weeklyView',
    calendar: 'calendarView',
    modules: 'modulesView',
    sba: 'sbaView'
  };
  
  document.getElementById(viewMap[viewName]).classList.add('active');
}

// Daily View
function renderDailyView() {
  const date = appData.viewingDate;
  const dateStr = date.toISOString().split('T')[0];
  document.getElementById('currentDate').textContent = formatDate(date);
  
  // Update day info
  const dayTypeBadge = document.getElementById('dayTypeBadge');
  const workInfo = document.getElementById('workInfo');
  
  if (isWorkDay(date)) {
    dayTypeBadge.textContent = 'Work Day';
    dayTypeBadge.className = 'day-type-badge work-day';
  } else if (isRevisionDay(date)) {
    dayTypeBadge.textContent = 'Revision Day';
    dayTypeBadge.className = 'day-type-badge revision-day';
  } else if (isBrazilTrip(date)) {
    dayTypeBadge.textContent = 'Brazil Trip';
    dayTypeBadge.className = 'day-type-badge brazil-trip';
  } else {
    dayTypeBadge.textContent = 'Study Day';
    dayTypeBadge.className = 'day-type-badge';
  }
  
  workInfo.textContent = getWorkInfo(date);
  
  // Render tasks
  const dailyContent = document.getElementById('dailyContent');
  const tasks = getDailyTasks(date);
  
  dailyContent.innerHTML = tasks.map((taskCategory, catIndex) => `
    <div class="task-category ${taskCategory.isCatchUp ? 'catch-up' : ''}">
      <div class="task-category-header" onclick="toggleCategory(${catIndex})">
        <div class="category-title">
          <span class="toggle-icon" id="toggle-${catIndex}">▶</span>
          ${taskCategory.category}
        </div>
        <div class="category-meta">${taskCategory.time}</div>
      </div>
      <div class="task-category-content" id="content-${catIndex}">
        <ul class="task-list">
          ${taskCategory.items.map((item, itemIndex) => {
            const isCompleted = item.isDailySBA ? (appData.dailySBACompletions[item.dailySBAKey] || false) : isTaskCompleted(date, catIndex, itemIndex);
            return `
              <li class="task-item ${isCompleted ? 'completed' : ''} ${taskCategory.isCatchUp ? 'catch-up' : ''}" data-sba="${item.isSBA ? 'true' : 'false'}" data-daily-sba="${item.isDailySBA ? 'true' : 'false'}" data-sba-key="${item.isSBA ? item.sbaKey : ''}" data-daily-sba-key="${item.isDailySBA ? item.dailySBAKey : ''}">
                <input 
                  type="checkbox" 
                  class="task-checkbox" 
                  ${item.isDailySBA ? (isCompleted ? 'checked' : '') : (item.isSBA ? (isSBACompleted(dateStr, item.name) ? 'checked' : '') : (isCompleted ? 'checked' : ''))}
                  onchange="${item.isDailySBA ? `handleDailySBAToggle('${item.dailySBAKey}')` : (item.isSBA ? `handleSBAToggle('${dateStr}', this.parentElement.querySelector('.task-name').textContent.trim().split('\n')[0].trim())` : `handleTaskToggle(${catIndex}, ${itemIndex})`)}"
                />
                <div class="task-details">
                  <div class="task-name">
                    ${item.name}
                    ${taskCategory.isCatchUp ? '<span class="catch-up-badge">CATCH-UP</span>' : ''}
                    ${item.isDailySBA ? '<span class="daily-sba-badge">DAILY PRACTICE</span>' : ''}
                  </div>
                  <div class="task-meta">
                    <span>⏱ ${item.time}</span>
                    ${item.workSuitable ? '<span class="task-badge work-suitable">✓ Work Day Suitable</span>' : ''}
                  </div>
                  ${!isCompleted && !taskCategory.isSBA && !taskCategory.isCatchUp ? `
                    <div class="task-actions">
                      <button class="btn-reschedule" onclick="addToCatchUpQueue(appData.viewingDate, ${catIndex}, ${JSON.stringify(taskCategory).replace(/"/g, '&quot;')})">Reschedule</button>
                    </div>
                  ` : ''}
                </div>
              </li>
            `;
          }).join('')}
        </ul>
      </div>
    </div>
  `).join('');
  
  // Load notes
  const dateKey = date.toISOString().split('T')[0];
  document.getElementById('dailyNotes').value = appData.dailyNotes[dateKey] || '';
  document.getElementById('dailyNotes').onchange = (e) => {
    appData.dailyNotes[dateKey] = e.target.value;
  };
}

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

function handleTaskToggle(catIndex, itemIndex) {
  toggleTaskCompletion(appData.viewingDate, catIndex, itemIndex);
  renderDailyView();
}

function handleSBAToggle(dateStr, sbaName) {
  toggleSBACompletion(dateStr, sbaName);
  renderDailyView();
  renderSBAView();
}

function handleDailySBAToggle(dailySBAKey) {
  appData.dailySBACompletions[dailySBAKey] = !appData.dailySBACompletions[dailySBAKey];
  updateDailySBACounts();
  renderDailyView();
  renderSBAView();
}

function changeDay(delta) {
  appData.viewingDate = new Date(appData.viewingDate);
  appData.viewingDate.setDate(appData.viewingDate.getDate() + delta);
  renderDailyView();
  renderRevisionResources();
  renderCalendarView();
}

// Weekly View
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  return new Date(d.setDate(diff));
}

function renderWeeklyView() {
  const weekStart = appData.viewingWeekStart || getWeekStart(appData.viewingDate);
  const weekDays = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    weekDays.push(day);
  }
  
  const weekEnd = new Date(weekDays[6]);
  document.getElementById('currentWeek').textContent = `${formatDateShort(weekStart)} - ${formatDateShort(weekEnd)}`;
  
  const weeklyContent = document.getElementById('weeklyContent');
  weeklyContent.innerHTML = weekDays.map(day => {
    const modules = getModulesForDate(day);
    const dayName = day.toLocaleDateString('en-GB', { weekday: 'long' });
    
    let dayClass = 'week-day-card';
    if (isWorkDay(day)) dayClass += ' work-day';
    else if (isRevisionDay(day)) dayClass += ' revision-day';
    else if (isBrazilTrip(day)) dayClass += ' brazil-trip';
    
    return `
      <div class="${dayClass}" onclick="viewDayFromWeek('${day.toISOString()}')">
        <div class="week-day-header">${dayName}</div>
        <div class="week-day-date">${formatDateShort(day)}</div>
        <div class="week-day-info">${getWorkInfo(day)}</div>
        <div class="week-day-modules">
          <strong>Topics:</strong><br/>
          ${modules.join(', ')}
        </div>
      </div>
    `;
  }).join('');
}

function viewDayFromWeek(dateStr) {
  appData.viewingDate = new Date(dateStr);
  switchView('daily');
  renderDailyView();
}

function changeWeek(delta) {
  const newWeekStart = new Date(appData.viewingWeekStart);
  newWeekStart.setDate(newWeekStart.getDate() + (delta * 7));
  appData.viewingWeekStart = newWeekStart;
  renderWeeklyView();
}

// Calendar View
function hasCatchUpTasks(date) {
  const dateStr = date.toISOString().split('T')[0];
  return appData.catchUpQueue.some(item => item.newDate === dateStr);
}

function renderCalendarView() {
  const viewMonth = appData.viewingMonth;
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  
  document.getElementById('currentMonth').textContent = viewMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
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
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    let dayClass = 'calendar-day';
    
    if (date.toDateString() === appData.currentDate.toDateString()) {
      dayClass += ' today';
    }
    if (isWorkDay(date)) dayClass += ' work-day';
    else if (isRevisionDay(date)) dayClass += ' revision-day';
    if (isBrazilTrip(date)) dayClass += ' brazil-trip';
    if (isExamDay(date)) dayClass += ' exam-day';
    if (hasCatchUpTasks(date)) dayClass += ' has-catchup';
    
    const modules = getModulesForDate(date).slice(0, 2).join(', ');
    const moreCount = getModulesForDate(date).length > 2 ? '...' : '';
    
    html += `
      <div class="${dayClass}" onclick="viewDayFromCalendar('${date.toISOString()}')">
        <div class="calendar-day-number">${day}</div>
        <div class="calendar-day-info">${modules}${moreCount}</div>
      </div>
    `;
  }
  
  calendarContent.innerHTML = html;
}

function viewDayFromCalendar(dateStr) {
  appData.viewingDate = new Date(dateStr);
  switchView('daily');
  renderDailyView();
}

function changeMonth(delta) {
  const newMonth = new Date(appData.viewingMonth);
  newMonth.setMonth(newMonth.getMonth() + delta);
  appData.viewingMonth = newMonth;
  renderCalendarView();
}

// Modules View
function renderModulesView() {
  const modulesContent = document.getElementById('modulesContent');
  
  modulesContent.innerHTML = appData.modules.map(module => {
    const progress = module.subtopics > 0 ? Math.round((module.completed / module.subtopics) * 100) : 0;
    const subtopicsList = module.subtopicsList || [];
    
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
          ${subtopicsList.slice(0, 5).join(', ')}${subtopicsList.length > 5 ? `, +${subtopicsList.length - 5} more` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// SBA View
function renderSBAView() {
  const sbaContent = document.getElementById('sbaContent');
  
  const sbaModules = [
    { key: 'biostatistics', name: 'Biostatistics SBA', days: 4 },
    { key: 'anatomy', name: 'Anatomy SBA', days: 6 },
    { key: 'physiology', name: 'Physiology SBA', days: 6 },
    { key: 'endocrinology', name: 'Endocrinology SBA', days: 6 },
    { key: 'anatomyEmbryology', name: 'Anatomy + Embryology SBA', days: 8 },
    { key: 'endocrinologyPathology', name: 'Endocrinology + Pathology SBA', days: 8 },
    { key: 'clinicalData', name: 'Clinical Management & Data Interpretation SBA', days: 8 }
  ];
  
  sbaContent.innerHTML = sbaModules.map(module => {
    const moduleData = appData.sbaTests[module.key];
    const progress = moduleData.totalDays > 0 ? Math.round((moduleData.completed / moduleData.totalDays) * 100) : 0;
    
    return `
      <div class="sba-module-card">
        <div class="sba-module-header">
          <div class="sba-module-name">${module.name}</div>
        </div>
        <div class="sba-module-meta">
          ${moduleData.totalDays} days • ${moduleData.readingTime} total • ${moduleData.avgTime} per day
        </div>
        <div class="sba-progress">
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${progress}%;"></div>
          </div>
          <div class="progress-text">
            <span>${progress}% complete</span>
            <span>${moduleData.completed}/${moduleData.totalDays} days</span>
          </div>
        </div>
        <div class="sba-days-grid">
          ${Array.from({length: module.days}, (_, i) => {
            const dayNum = i + 1;
            const isCompleted = moduleData.completed > i;
            return `
              <div class="sba-day-box ${isCompleted ? 'completed' : 'incomplete'}" title="Day ${dayNum}">
                ${dayNum}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Initialize app on page load
initializeApp();