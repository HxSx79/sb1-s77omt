import { processExcelFile } from './excelProcessor';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileCache {
  file: File;
  lastModified: number;
  data: ArrayBuffer;
}

export const validateExcelFile = (file: File): FileValidationResult => {
  const validTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream' // Some systems may use this type for .xlsx files
  ];

  if (!file) {
    return {
      isValid: false,
      error: 'No file selected'
    };
  }

  const fileExtension = file.name.toLowerCase().split('.').pop();
  if (!['xls', 'xlsx'].includes(fileExtension || '')) {
    return {
      isValid: false,
      error: 'Please upload a valid Excel file (.xls or .xlsx)'
    };
  }

  if (!validTypes.includes(file.type)) {
    // If the file extension is valid but type isn't recognized,
    // we'll still accept it as some systems may report different MIME types
    console.warn('Unexpected MIME type for Excel file:', file.type);
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: 'The selected file is empty'
    };
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    return {
      isValid: false,
      error: 'File size exceeds 10MB limit'
    };
  }

  return { isValid: true };
};

export const createFileCache = async (file: File): Promise<FileCache> => {
  const data = await file.arrayBuffer();
  return {
    file: new File([data], file.name, {
      type: file.type,
      lastModified: Date.now()
    }),
    lastModified: Date.now(),
    data
  };
};

export const readAndProcessFile = async (fileCache: FileCache) => {
  try {
    // Create a fresh copy of the ArrayBuffer for each processing attempt
    const freshBuffer = fileCache.data.slice(0);
    return await processExcelFile(freshBuffer);
  } catch (error) {
    throw new Error('Failed to process Excel file. Please try uploading the file again.');
  }
};