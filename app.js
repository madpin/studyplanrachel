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

// MRCOG Jan 2026 Template Data
// Revision Resources for the MRCOG template
const templateRevisionResources = {
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
};

// SBA Test Schedule for MRCOG Jan 2026 Template
const templateSBASchedule = {
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

// Detailed day-by-day schedule for MRCOG Jan 2026 Template
const templateDetailedSchedule = {
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

// Template Helper Functions
function isTemplateWorkDay(date) {
  const dateStr = date.toISOString().split('T')[0];
  const dayData = templateDetailedSchedule[dateStr];
  return dayData && dayData.type === 'work';
}

function isTemplateRevisionDay(date) {
  const dateStr = date.toISOString().split('T')[0];
  const dayData = templateDetailedSchedule[dateStr];
  return dayData && dayData.type === 'revision';
}

function isTemplateBrazilTrip(date) {
  const dateStr = date.toISOString().split('T')[0];
  const dayData = templateDetailedSchedule[dateStr];
  return dayData && (dayData.type === 'trip' || dayData.type === 'trip-end');
}

function getTemplateWorkInfo(date) {
  const dateStr = date.toISOString().split('T')[0];
  const dayData = templateDetailedSchedule[dateStr];
  
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

function getTemplateSpecificTopicsForDate(date) {
  const dateStr = date.toISOString().split('T')[0];
  const dayData = templateDetailedSchedule[dateStr];
  
  if (dayData) {
    return dayData.topics;
  }
  
  return ['General Study Period'];
}

function getTemplateSBATestsForDate(date) {
  const dateStr = date.toISOString().split('T')[0];
  return templateSBASchedule[dateStr] || [];
}

function getTemplateRevisionResourcesForWeek(date) {
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

// Generate task structure from template for a specific date
function getTemplateDailyTasks(date) {
  const dateStr = date.toISOString().split('T')[0];
  const dayData = templateDetailedSchedule[dateStr];
  const sbaTests = getTemplateSBATestsForDate(date);
  
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
      isSBA: true
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

// Generate tasks from MRCOG Jan 2026 Template
async function generateTasksFromTemplate(selectedModules) {
  console.log('Generating tasks from MRCOG Jan 2026 Template...');
  
  try {
    let totalCategories = 0;
    let totalTasks = 0;
    let totalSBAEntries = 0;
    let totalTelegramPlaceholders = 0;
    
    // Get all dates from the template (2025-11-01 to 2026-01-13)
    const templateDates = Object.keys(templateDetailedSchedule).sort();
    
    for (let i = 0; i < templateDates.length; i++) {
      const dateStr = templateDates[i];
      const date = new Date(dateStr);
      const dayData = templateDetailedSchedule[dateStr];
      
      if (!dayData) continue;
      
      // Get the task structure for this date
      const templateTasks = getTemplateDailyTasks(date);
      
      // Create task categories and tasks
      for (let catIndex = 0; catIndex < templateTasks.length; catIndex++) {
        const taskCategory = templateTasks[catIndex];
        
        // Skip empty categories
        if (taskCategory.items.length === 0) continue;
        
        // Determine category name
        let categoryName = taskCategory.category;
        
        // Create the category
        const { data: category, error: categoryError } = await supabase
          .from('task_categories')
          .insert({
            user_id: currentUser.id,
            date: dateStr,
            category_name: categoryName,
            time_estimate: taskCategory.time,
            sort_order: catIndex
          })
          .select()
          .single();
        
        if (categoryError) throw categoryError;
        totalCategories++;
        
        // Create tasks for this category
        const tasksToInsert = taskCategory.items.map((item, itemIndex) => ({
          user_id: currentUser.id,
          date: dateStr,
          category_id: category.id,
          task_name: item.name,
          time_estimate: item.time,
          work_suitable: item.workSuitable,
          completed: false,
          sort_order: itemIndex
        }));
        
        if (tasksToInsert.length > 0) {
          const { error: tasksError } = await supabase
            .from('tasks')
            .insert(tasksToInsert);
          
          if (tasksError) throw tasksError;
          totalTasks += tasksToInsert.length;
        }
      }
      
      // Create SBA schedule entries for this date
      const sbaTests = templateSBASchedule[dateStr];
      if (sbaTests && sbaTests.length > 0) {
        for (const sbaName of sbaTests) {
          const { error: sbaError } = await supabase
            .from('sba_schedule')
            .insert({
              user_id: currentUser.id,
              date: dateStr,
              sba_name: sbaName,
              completed: false,
              is_placeholder: false
            });
          
          if (sbaError) throw sbaError;
          totalSBAEntries++;
        }
      }
      
      // Create telegram question placeholders (2 per day, except rest days)
      if (dayData.type !== 'trip' || (dayData.resources && dayData.resources.length > 0)) {
        const telegramSources = ['MRCOG Study Group', 'MRCOG Intensive Hour'];
        
        for (const source of telegramSources) {
          const { error: telegramError } = await supabase
            .from('telegram_questions')
            .insert({
              user_id: currentUser.id,
              date: dateStr,
              question_text: `Placeholder - ${source} question`,
              source: source,
              completed: false,
              is_placeholder: true
            });
          
          if (telegramError) throw telegramError;
          totalTelegramPlaceholders++;
        }
      }
      
      // Progress logging every 10 dates
      if ((i + 1) % 10 === 0) {
        console.log(`Progress: ${i + 1}/${templateDates.length} days processed...`);
        console.log(`  Categories: ${totalCategories}, Tasks: ${totalTasks}, SBA: ${totalSBAEntries}, Telegram: ${totalTelegramPlaceholders}`);
      }
    }
    
    console.log(`Template import completed successfully!`);
    console.log(`  Total dates: ${templateDates.length}`);
    console.log(`  Total categories: ${totalCategories}`);
    console.log(`  Total tasks: ${totalTasks}`);
    console.log(`  Total SBA entries: ${totalSBAEntries}`);
    console.log(`  Total Telegram placeholders: ${totalTelegramPlaceholders}`);
    
    return {
      dates: templateDates.length,
      categories: totalCategories,
      tasks: totalTasks,
      sbaEntries: totalSBAEntries,
      telegramPlaceholders: totalTelegramPlaceholders
    };
    
  } catch (error) {
    console.error('Error generating tasks from template:', error);
    throw error;
  }
}

// Complete first-time user setup with selected options
async function completeOnboarding(examDate, tripStart, tripEnd, selectedModules, useTemplate = false) {
  console.log('Completing onboarding with user selections...');
  console.log('Using template:', useTemplate);

  try {
    // If using template, override dates with template defaults
    if (useTemplate) {
      examDate = defaultDates.examDate;
      tripStart = defaultDates.brazilTripStart;
      tripEnd = defaultDates.brazilTripEnd;
      console.log('Using MRCOG Jan 2026 template with fixed dates');
    }
    
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
      
      // Generate tasks based on template or custom
      if (useTemplate) {
        console.log('Generating tasks from MRCOG Jan 2026 template...');
        const stats = await generateTasksFromTemplate(selectedModules);
        console.log('Template tasks generated:', stats);
      } else {
        console.log('Generating custom tasks...');
        await generateInitialTasks(examDate, tripStart, tripEnd, selectedModules);
      }
    }

    // Seed daily schedule if using template
    if (useTemplate) {
      console.log('Seeding daily schedule from template...');
      await seedDailySchedule(currentUser.id);
    }

    console.log('Onboarding completed successfully');
    return true;

  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
}

// Seed daily schedule from template
async function seedDailySchedule(userId) {
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

// Load daily schedule from database
async function loadDailySchedule(userId) {
  try {
    const { data: schedule, error } = await supabase
      .from('daily_schedule')
      .select('*')
      .eq('user_id', userId)
      .gte('date', '2025-11-01')
      .lte('date', '2026-01-13');

    if (error) throw error;

    if (schedule && schedule.length > 0) {
      schedule.forEach(entry => {
        appState.dailySchedule[entry.date] = {
          topics: entry.topics,
          type: entry.type,
          resources: entry.resources
        };
      });
      console.log(`Loaded ${schedule.length} days of schedule from database`);
    } else {
      console.log('No schedule found in database, using template');
      // Fall back to template
      Object.keys(templateDetailedSchedule).forEach(date => {
        appState.dailySchedule[date] = templateDetailedSchedule[date];
      });
    }
  } catch (error) {
    console.error('Error loading daily schedule:', error);
    // Fall back to template on error
    Object.keys(templateDetailedSchedule).forEach(date => {
      appState.dailySchedule[date] = templateDetailedSchedule[date];
    });
  }
}

// Update day schedule type in database
async function updateDayScheduleType(userId, date, newType) {
  try {
    // Get current schedule for this date
    const currentSchedule = appState.dailySchedule[date] || templateDetailedSchedule[date];
    
    if (!currentSchedule) {
      console.warn('No schedule found for date:', date);
      return;
    }

    // Update in database
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

    // Update local state
    appState.dailySchedule[date] = {
      ...currentSchedule,
      type: newType
    };

    console.log(`Updated day ${date} to type: ${newType}`);
  } catch (error) {
    console.error('Error updating day schedule type:', error);
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

    // Load daily schedule
    await loadDailySchedule(currentUser.id);

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

    // Find task in state
    let task = null;
    for (const category of categories) {
      task = category.tasks.find(t => t.id === taskId);
      if (task) break;
    }

    if (!task) return;

    const newCompleted = !task.completed;
    
    // Optimistic UI update - update immediately
    task.completed = newCompleted;
    
    // Update checkbox and task item visually
    const checkbox = document.querySelector(`input[onchange*="toggleTaskCompletion('${taskId}')"]`);
    if (checkbox) {
      checkbox.checked = newCompleted;
      const taskItem = checkbox.closest('.task-item');
      if (taskItem) {
        if (newCompleted) {
          taskItem.classList.add('completed');
        } else {
          taskItem.classList.remove('completed');
        }
      }
    }
    
    // Save to database in background
    const { error } = await supabase
      .from('tasks')
      .update({ completed: newCompleted })
      .eq('id', taskId);

    if (error) {
      // Revert optimistic update on error
      task.completed = !newCompleted;
      
      if (checkbox) {
        checkbox.checked = !newCompleted;
        const taskItem = checkbox.closest('.task-item');
        if (taskItem) {
          if (!newCompleted) {
            taskItem.classList.add('completed');
          } else {
            taskItem.classList.remove('completed');
          }
        }
      }
      
      alert('Failed to save task completion: ' + error.message);
      throw error;
    }

    // Update module progress and header stats in background (no re-render)
    updateModuleProgress().then(() => {
      updateHeaderStats();
    }).catch(err => {
      console.error('Error updating progress:', err);
    });

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
  today.setHours(0, 0, 0, 0);
  const daysToExam = getDaysBetween(today, examDate);

  document.getElementById('daysUntilExam').textContent = daysToExam;
  document.getElementById('headerExamDate').textContent = formatDate(examDate);

  // Calculate overall progress - ONLY TASKS UP TO TODAY
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

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  document.getElementById('overallProgress').textContent = `${progress}% (${completedTasks}/${totalTasks})`;
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

  // Get day type using loaded schedule or template fallback
  const dayTypeBadge = document.getElementById('dayTypeBadge');
  const workInfoElement = document.getElementById('workInfo');
  
  // Check if date is in loaded schedule or template
  const daySchedule = appState.dailySchedule[dateStr] || templateDetailedSchedule[dateStr];
  
  if (daySchedule) {
    const dayType = daySchedule.type;
    
    // Set badge based on day type
    if (dayType === 'work') {
      dayTypeBadge.textContent = 'Work Day';
      dayTypeBadge.className = 'day-type-badge work-day clickable';
    } else if (dayType === 'revision') {
      dayTypeBadge.textContent = 'Revision Day';
      dayTypeBadge.className = 'day-type-badge revision-day clickable';
    } else if (dayType === 'trip' || dayType === 'trip-end') {
      dayTypeBadge.textContent = 'Brazil Trip';
      dayTypeBadge.className = 'day-type-badge brazil-trip clickable';
    } else if (dayType === 'intensive' || dayType === 'intensive-post') {
      dayTypeBadge.textContent = 'Intensive Study';
      dayTypeBadge.className = 'day-type-badge intensive-day clickable';
    } else if (dayType === 'rest' || dayType === 'exam-eve') {
      dayTypeBadge.textContent = dayType === 'exam-eve' ? 'Exam Eve' : 'Rest Day';
      dayTypeBadge.className = 'day-type-badge rest-day clickable';
    } else if (dayType === 'light') {
      dayTypeBadge.textContent = 'Light Study';
      dayTypeBadge.className = 'day-type-badge light-day clickable';
    } else {
      dayTypeBadge.textContent = 'Study Day';
      dayTypeBadge.className = 'day-type-badge clickable';
    }
    
    // Make badge clickable to change day type
    dayTypeBadge.onclick = () => showDayTypeEditor(dateStr, dayType);
    
    // Set work info based on type
    const infoMap = {
      'work': '🏥 WORK DAY (1000-2200 shift) - Focus on 1 specific topic only',
      'off': '📚 OFF DAY - Full study capacity with multiple topics',
      'revision': '🔄 REVISION DAY - Comprehensive review + Mock exam',
      'intensive': '🔥 INTENSIVE STUDY DAY - Deep dive into topics',
      'intensive-post': '💪 POST-BRAZIL INTENSIVE - Get back on track',
      'trip': '🌴 BRAZIL TRIP - Minimal/optional study',
      'trip-end': '🌴 BRAZIL TRIP ENDS - Ease back into study',
      'rest': '😌 REST DAY - Very light review only',
      'exam-eve': '🎯 EXAM EVE - Mental preparation, early night',
      'light': '📖 LIGHT STUDY DAY - Reduced load'
    };
    workInfoElement.textContent = infoMap[dayType] || 'Regular study day';
  } else {
    // Default for dates without schedule
    dayTypeBadge.textContent = 'Study Day';
    dayTypeBadge.className = 'day-type-badge';
    workInfoElement.textContent = 'Regular study day';
  }

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

  // Auto-expand all categories on initial render
  setTimeout(() => {
    document.querySelectorAll('.task-category-content').forEach((content, index) => {
      content.classList.add('expanded');
      const toggle = document.getElementById(`toggle-${index}`);
      if (toggle) toggle.classList.add('expanded');
    });
  }, 10); // Small delay to ensure DOM is ready

  // Load notes
  const notes = appState.dailyNotes[dateStr] || '';
  const notesTextarea = document.getElementById('dailyNotes');
  notesTextarea.value = notes;

  // Add notes change handler
  notesTextarea.onchange = (e) => {
    saveDailyNote(date, e.target.value);
  };
  
  // Render revision resources
  renderRevisionResources();
}

// Render revision resources section
function renderRevisionResources() {
  const resources = getTemplateRevisionResourcesForWeek(appState.viewingDate);
  const hasResources = resources.podcasts.length > 0 || resources.summaries.length > 0 || 
                       resources.nice.length > 0 || resources.rrr.length > 0;
  
  const section = document.getElementById('revisionResourcesSection');
  
  if (!section) return; // Section doesn't exist
  
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
  renderRevisionResources();
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
    // Calculate manual subtopic progress
    const manualProgress = module.subtopics > 0 ?
      Math.round((module.completed / module.subtopics) * 100) : 0;
    
    // Calculate task-based progress
    const taskProgress = module.stats.totalTasks > 0 ?
      Math.round((module.stats.completedTasks / module.stats.totalTasks) * 100) : 0;
    
    // Combined progress: average of both if tasks exist, otherwise use manual only
    const combinedProgress = module.stats.totalTasks > 0 ?
      Math.round((manualProgress + taskProgress) / 2) : manualProgress;

    return `
      <div class="module-card">
        <div class="module-header">
          <div class="module-name">${module.name}</div>
          <div class="module-weight">${module.exam_weight}% of exam</div>
        </div>
        <div class="module-progress">
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${combinedProgress}%; background-color: ${module.color};"></div>
          </div>
          <div class="progress-text">
            <span>${combinedProgress}% complete</span>
            <span>${module.completed}/${module.subtopics} subtopics checked</span>
          </div>
          ${module.stats.totalTasks > 0 || module.stats.placeholders > 0 ? `
            <div class="module-task-stats">
              <span>📚 ${module.stats.completedTasks}/${module.stats.totalTasks} daily tasks (${taskProgress}%)</span>
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

// Day Type Editor
function showDayTypeEditor(dateStr, currentType) {
  const dayTypes = [
    { value: 'work', label: 'Work Day', emoji: '🏥' },
    { value: 'off', label: 'Off Day', emoji: '📚' },
    { value: 'revision', label: 'Revision Day', emoji: '🔄' },
    { value: 'intensive', label: 'Intensive Study', emoji: '🔥' },
    { value: 'intensive-post', label: 'Post-Brazil Intensive', emoji: '💪' },
    { value: 'light', label: 'Light Study', emoji: '📖' },
    { value: 'rest', label: 'Rest Day', emoji: '😌' },
    { value: 'trip', label: 'Trip Day', emoji: '🌴' },
    { value: 'trip-end', label: 'Trip End', emoji: '🌴' },
    { value: 'exam-eve', label: 'Exam Eve', emoji: '🎯' }
  ];
  
  const options = dayTypes.map(type => `
    <option value="${type.value}" ${type.value === currentType ? 'selected' : ''}>
      ${type.emoji} ${type.label}
    </option>
  `).join('');
  
  const html = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;" onclick="if(event.target === this) closeDayTypeEditor()">
      <div style="background: white; padding: 24px; border-radius: 12px; max-width: 400px; width: 90%;" onclick="event.stopPropagation()">
        <h3 style="margin-top: 0;">Change Day Type</h3>
        <p style="font-size: 14px; color: #666; margin-bottom: 16px;">Select the day type for ${new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <select id="dayTypeSelector" style="width: 100%; padding: 12px; font-size: 16px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 16px;">
          ${options}
        </select>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button onclick="closeDayTypeEditor()" class="btn btn--secondary">Cancel</button>
          <button onclick="saveDayType('${dateStr}')" class="btn btn--primary">Save</button>
        </div>
      </div>
    </div>
  `;
  
  const modal = document.createElement('div');
  modal.id = 'dayTypeEditorModal';
  modal.innerHTML = html;
  document.body.appendChild(modal);
}

function closeDayTypeEditor() {
  const modal = document.getElementById('dayTypeEditorModal');
  if (modal) {
    modal.remove();
  }
}

async function saveDayType(dateStr) {
  const selector = document.getElementById('dayTypeSelector');
  const newType = selector.value;
  
  try {
    await updateDayScheduleType(currentUser.id, dateStr, newType);
    closeDayTypeEditor();
    renderDailyView();
    alert('Day type updated successfully!');
  } catch (error) {
    console.error('Error saving day type:', error);
    alert('Failed to save day type: ' + error.message);
  }
}

// Default dates from the original schedule
const defaultDates = {
  examDate: '2026-01-14',
  brazilTripStart: '2025-12-19',
  brazilTripEnd: '2025-12-29'
};

// Onboarding Modal Functions
function handleTemplateChange() {
  const selectedTemplate = document.querySelector('input[name="planTemplate"]:checked').value;
  const datesSection = document.getElementById('datesSection');
  
  if (selectedTemplate === 'mrcog-jan-2026') {
    // Hide dates section for MRCOG template (uses fixed dates)
    datesSection.style.display = 'none';
  } else {
    // Show dates section for custom template
    datesSection.style.display = 'block';
  }
}

function showOnboardingModal() {
  const modal = document.getElementById('onboardingModal');
  
  // Set default dates from the original schedule
  document.getElementById('onboardingExamDate').value = defaultDates.examDate;
  document.getElementById('onboardingTripStart').value = defaultDates.brazilTripStart;
  document.getElementById('onboardingTripEnd').value = defaultDates.brazilTripEnd;
  
  // Initialize template visibility
  handleTemplateChange();
  
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
  
  // Check which template was selected
  const selectedTemplate = document.querySelector('input[name="planTemplate"]:checked').value;
  const useTemplate = selectedTemplate === 'mrcog-jan-2026';
  
  // Get dates (only needed for custom template)
  let examDate = null;
  let tripStart = null;
  let tripEnd = null;
  
  if (!useTemplate) {
    examDate = document.getElementById('onboardingExamDate').value;
    tripStart = document.getElementById('onboardingTripStart').value || null;
    tripEnd = document.getElementById('onboardingTripEnd').value || null;
  }
  
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
    
    // Complete onboarding with template flag
    await completeOnboarding(examDate, tripStart, tripEnd, selectedModules, useTemplate);
    
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

    const newCompleted = !entry.completed;
    
    // Optimistic UI update - update checkbox immediately
    const checkbox = document.querySelector(`input[onchange*="handleSBAScheduleToggle('${id}')"]`);
    if (checkbox) {
      checkbox.checked = newCompleted;
      const taskItem = checkbox.closest('.task-item, .sba-schedule-item');
      if (taskItem) {
        if (newCompleted) {
          taskItem.classList.add('completed');
        } else {
          taskItem.classList.remove('completed');
        }
      }
    }

    // Save to database in background
    const { error: updateError } = await supabase
      .from('sba_schedule')
      .update({ completed: newCompleted })
      .eq('id', id);

    if (updateError) {
      // Revert optimistic update on error
      if (checkbox) {
        checkbox.checked = !newCompleted;
        const taskItem = checkbox.closest('.task-item, .sba-schedule-item');
        if (taskItem) {
          if (!newCompleted) {
            taskItem.classList.add('completed');
          } else {
            taskItem.classList.remove('completed');
          }
        }
      }
      
      alert('Failed to save SBA completion: ' + updateError.message);
      throw updateError;
    }

    // Update SBA test progress in background
    updateSBATestProgress().then(() => {
      updateHeaderStats();
    }).catch(err => {
      console.error('Error updating SBA progress:', err);
    });
    
    return newCompleted;
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

    const newCompleted = !question.completed;
    
    // Optimistic UI update - update checkbox immediately
    const checkbox = document.querySelector(`input[onchange*="handleTelegramToggle('${id}')"]`);
    if (checkbox) {
      checkbox.checked = newCompleted;
      const taskItem = checkbox.closest('.task-item, .telegram-question-item');
      if (taskItem) {
        if (newCompleted) {
          taskItem.classList.add('completed');
        } else {
          taskItem.classList.remove('completed');
        }
      }
    }

    // Save to database in background
    const { error: updateError } = await supabase
      .from('telegram_questions')
      .update({ completed: newCompleted })
      .eq('id', id);

    if (updateError) {
      // Revert optimistic update on error
      if (checkbox) {
        checkbox.checked = !newCompleted;
        const taskItem = checkbox.closest('.task-item, .telegram-question-item');
        if (taskItem) {
          if (!newCompleted) {
            taskItem.classList.add('completed');
          } else {
            taskItem.classList.remove('completed');
          }
        }
      }
      
      alert('Failed to save telegram question completion: ' + updateError.message);
      throw updateError;
    }
    
    // Update header stats in background
    updateTelegramHeaderStats().catch(err => {
      console.error('Error updating telegram stats:', err);
    });
    
    return newCompleted;
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
