/**
 * Validation Module
 * Handles validation and preview for bulk uploads
 */

// Validate SBA bulk upload
export function validateSBABulkUpload(jsonData) {
  const results = {
    valid: true,
    errors: [],
    preview: [],
    summary: { total: 0, valid: 0, errors: 0, duplicates: 0 }
  };
  
  if (!Array.isArray(jsonData)) {
    results.valid = false;
    results.errors.push('JSON must be an array of objects');
    return results;
  }
  
  results.summary.total = jsonData.length;
  
  // Track duplicates: key is "date|sba_name"
  const seen = new Map();
  const duplicateIndexes = new Set();
  
  jsonData.forEach((item, index) => {
    const rowNum = index + 1;
    const rowErrors = [];
    
    // Validate required fields
    if (!item.date) {
      rowErrors.push('date is required');
    } else if (!isValidDate(item.date)) {
      rowErrors.push('date must be in YYYY-MM-DD format');
    }
    
    if (!item.sba_name) {
      rowErrors.push('sba_name is required');
    } else if (typeof item.sba_name !== 'string') {
      rowErrors.push('sba_name must be a string');
    }
    
    // Check for duplicates: date + sba_name
    if (item.date && item.sba_name) {
      const key = `${item.date}|${item.sba_name}`;
      if (seen.has(key)) {
        rowErrors.push(`duplicate: same date+name found at row ${seen.get(key)}`);
        duplicateIndexes.add(index);
        duplicateIndexes.add(seen.get(key) - 1); // Mark the first occurrence too
        results.summary.duplicates++;
      } else {
        seen.set(key, rowNum);
      }
    }
    
    // Validate optional fields
    if (item.completed !== undefined && typeof item.completed !== 'boolean') {
      rowErrors.push('completed must be true or false');
    }
    
    if (item.is_placeholder !== undefined && typeof item.is_placeholder !== 'boolean') {
      rowErrors.push('is_placeholder must be true or false');
    }
    
    const isValid = rowErrors.length === 0;
    
    if (isValid) {
      results.summary.valid++;
    } else {
      results.summary.errors++;
      results.valid = false;
    }
    
    results.preview.push({
      rowNum,
      data: item,
      valid: isValid,
      errors: rowErrors,
      isDuplicate: duplicateIndexes.has(index)
    });
  });
  
  return results;
}

// Validate Telegram bulk upload
export function validateTelegramBulkUpload(jsonData) {
  const results = {
    valid: true,
    errors: [],
    preview: [],
    summary: { total: 0, valid: 0, errors: 0, duplicates: 0 }
  };
  
  if (!Array.isArray(jsonData)) {
    results.valid = false;
    results.errors.push('JSON must be an array of objects');
    return results;
  }
  
  results.summary.total = jsonData.length;
  
  // Track duplicates: key is "date|source|question_text"
  const seen = new Map();
  const duplicateIndexes = new Set();
  
  jsonData.forEach((item, index) => {
    const rowNum = index + 1;
    const rowErrors = [];
    
    // Validate required fields
    if (!item.date) {
      rowErrors.push('date is required');
    } else if (!isValidDate(item.date)) {
      rowErrors.push('date must be in YYYY-MM-DD format');
    }
    
    if (!item.question_text) {
      rowErrors.push('question_text is required');
    } else if (typeof item.question_text !== 'string') {
      rowErrors.push('question_text must be a string');
    }
    
    // Check for duplicates: date + source + question_text
    if (item.date && item.question_text) {
      const source = item.source || '';
      const key = `${item.date}|${source}|${item.question_text}`;
      if (seen.has(key)) {
        rowErrors.push(`duplicate: same date+source+text found at row ${seen.get(key)}`);
        duplicateIndexes.add(index);
        duplicateIndexes.add(seen.get(key) - 1); // Mark the first occurrence too
        results.summary.duplicates++;
      } else {
        seen.set(key, rowNum);
      }
    }
    
    // Validate optional fields
    if (item.source !== undefined && item.source !== null && typeof item.source !== 'string') {
      rowErrors.push('source must be a string or null');
    }
    
    if (item.completed !== undefined && typeof item.completed !== 'boolean') {
      rowErrors.push('completed must be true or false');
    }
    
    if (item.is_placeholder !== undefined && typeof item.is_placeholder !== 'boolean') {
      rowErrors.push('is_placeholder must be true or false');
    }
    
    const isValid = rowErrors.length === 0;
    
    if (isValid) {
      results.summary.valid++;
    } else {
      results.summary.errors++;
      results.valid = false;
    }
    
    results.preview.push({
      rowNum,
      data: item,
      valid: isValid,
      errors: rowErrors,
      isDuplicate: duplicateIndexes.has(index)
    });
  });
  
  return results;
}

// Helper function to validate date format
function isValidDate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
}

