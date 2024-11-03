import { read, utils, WorkBook } from 'xlsx';

export const processExcelFile = async (data: ArrayBuffer): Promise<any[]> => {
  let workbook: WorkBook | null = null;
  
  try {
    workbook = read(data, { 
      type: 'array',
      cellDates: false,
      cellNF: false,
      cellText: false,
      WTF: true
    });
    
    if (!workbook.SheetNames.length) {
      throw new Error('No sheets found in the Excel file');
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      throw new Error('Sheet is empty');
    }
    
    const jsonData = utils.sheet_to_json(worksheet, { 
      raw: true,
      rawNumbers: true,
      defval: null
    });
    
    if (!jsonData.length) {
      throw new Error('No data found in the Excel file');
    }
    
    return jsonData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Excel processing error: ${error.message}`);
    }
    throw new Error('Failed to process Excel file');
  } finally {
    if (workbook) {
      // Clean up workbook references
      Object.keys(workbook.Sheets).forEach(name => {
        workbook!.Sheets[name] = null;
      });
      workbook.SheetNames.length = 0;
    }
  }
};