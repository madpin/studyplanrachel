/**
 * Schedule Module
 * Contains template schedule data, revision resources, and schedule helper functions
 */

import { appState } from './state.js';

// Default modules data for MRCOG Jan 2026
export const defaultModules = [
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

// Revision Resources for the MRCOG template
export const templateRevisionResources = {
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
export const templateSBASchedule = {
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
export const templateDetailedSchedule = {
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

// Schedule Helper Functions
export function formatDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

export function getDaysBetween(date1, date2) {
  const diffTime = date2 - date1;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Get day type for a date
export function getDayType(date) {
  const dateStr = formatDateISO(date);
  const schedule = appState.dailySchedule[dateStr] || templateDetailedSchedule[dateStr];
  return schedule ? schedule.type : 'off';
}

// Check if date is a work day
export function isWorkDay(date) {
  return getDayType(date) === 'work';
}

// Check if date is a revision day
export function isRevisionDay(date) {
  return getDayType(date) === 'revision';
}

// Get work info text for a date
export function getWorkInfo(date) {
  const dayType = getDayType(date);
  
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
  
  return infoMap[dayType] || 'Regular study day';
}

// Get revision resources for a given week
export function getTemplateRevisionResourcesForWeek(date) {
  const month = date.getMonth();
  const day = date.getDate();
  
  const resources = {
    podcasts: [],
    summaries: [],
    nice: [],
    rrr: []
  };
  
  if (month === 10) { // November
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

