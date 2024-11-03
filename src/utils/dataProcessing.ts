import { ProductionData } from '../types';

export const formatTime = (timeStr: string | number): string => {
  try {
    if (!timeStr) return '06:00:00';

    // If it's a number (Excel time value)
    if (typeof timeStr === 'number') {
      // Excel stores times as fractions of a day
      const totalSeconds = Math.round(timeStr * 24 * 60 * 60);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // If it's already in HH:mm:ss format
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
    if (timeMatch) {
      const [_, hours, minutes, seconds] = timeMatch;
      return `${hours.padStart(2, '0')}:${minutes}:${seconds}`;
    }

    // Handle date string
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return date.toTimeString().slice(0, 8);
    }

    return '06:00:00';
  } catch {
    return '06:00:00';
  }
};

export const processProductionData = (rawData: any[]): ProductionData[] => {
  return rawData.map(item => {
    const quantity = parseInt(item.Quantity) || 0;
    const scrapQuantity = parseInt(item['Scrap Quantity'] || '0');
    const scrapPercentage = parseFloat(item['Scrap %'] || '0') * 100;

    const processed = {
      partNumber: item['Part Number'] || '',
      partName: item['Part Name'] || '',
      quantity: quantity,
      date: item.Date || '',
      shift: item.Shift || '',
      operator: item.Operator || '',
      line: item.Line?.toString() || '',
      totalQuantity: item['Total Quantity/Shift'] || '0',
      partsPerHour: parseFloat(item['Parts/Hour']) || 0,
      time: formatTime(item.Time),
      totalScrap: scrapQuantity.toString(),
      scrapRate: scrapPercentage.toFixed(1)
    };
    
    return processed;
  });
};

export const processLineData = (entries: ProductionData[]) => {
  // Sort entries by time
  const sortedEntries = [...entries].sort((a, b) => {
    const timeA = new Date(`1970-01-01T${a.time}`).getTime();
    const timeB = new Date(`1970-01-01T${b.time}`).getTime();
    return timeA - timeB;
  });

  // Map each entry to a data point
  const dataPoints = sortedEntries.map(entry => ({
    time: entry.time,
    value: entry.partsPerHour > 0 ? Math.round(entry.partsPerHour) : null
  }));

  return dataPoints;
};