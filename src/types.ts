export interface ProductionData {
  partNumber: string;
  partName: string;
  quantity: number;
  date: string;
  shift: string;
  operator: string;
  line: string;
  totalQuantity: string;
  partsPerHour: number;
  time: string;
  totalScrap: string;
  scrapRate: string;
}

export interface ChartData {
  name: string;
  quantity: number;
}