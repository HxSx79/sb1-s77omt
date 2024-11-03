import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { CameraFeed } from './components/CameraFeed';
import { LineGraph } from './components/LineGraph';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { processProductionData, processLineData } from './utils/dataProcessing';
import { ProductionData } from './types';

interface LineStatus {
  partNumber: string;
  partName: string;
  totalQuantity: string;
  partsPerHour: string;
  totalScrap: string;
  scrapRate: string;
}

const getScrapRateColor = (scrapRate: string) => {
  const rate = parseFloat(scrapRate);
  if (rate < 3) return 'bg-[#228B22]';
  if (rate <= 5) return 'bg-[#FFFF00]';
  return 'bg-[#FF0000]';
};

const getSmileyPath = (scrapRate: string) => {
  const rate = parseFloat(scrapRate);
  if (rate < 3) {
    return "M 30 65 Q 50 80 70 65";
  } else if (rate <= 5) {
    return "M 30 65 L 70 65";
  } else {
    return "M 30 75 Q 50 60 70 75";
  }
};

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [line1Data, setLine1Data] = useState<LineStatus>({
    partNumber: '-',
    partName: '-',
    totalQuantity: '0',
    partsPerHour: '0',
    totalScrap: '0',
    scrapRate: '0.0'
  });
  const [line2Data, setLine2Data] = useState<LineStatus>({
    partNumber: '-',
    partName: '-',
    totalQuantity: '0',
    partsPerHour: '0',
    totalScrap: '0',
    scrapRate: '0.0'
  });

  const [lineData1, setLineData1] = useState<Array<{ time: string; value: number | null }>>([]);
  const [lineData2, setLineData2] = useState<Array<{ time: string; value: number | null }>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleFileUpload = (rawData: any[]) => {
    const formattedData = processProductionData(rawData);
    setLastRefreshTime(new Date());

    const line1Entries = formattedData.filter(entry => entry.line === '1');
    if (line1Entries.length > 0) {
      const lastLine1Entry = line1Entries[line1Entries.length - 1];
      setLine1Data({
        partNumber: lastLine1Entry.partNumber || '-',
        partName: lastLine1Entry.partName || '-',
        totalQuantity: lastLine1Entry.totalQuantity || '0',
        partsPerHour: Math.ceil(lastLine1Entry.partsPerHour).toString(),
        totalScrap: lastLine1Entry.totalScrap || '0',
        scrapRate: lastLine1Entry.scrapRate || '0.0'
      });

      const line1GraphData = processLineData(line1Entries);
      setLineData1(line1GraphData);
    }

    const line2Entries = formattedData.filter(entry => entry.line === '2');
    if (line2Entries.length > 0) {
      const lastLine2Entry = line2Entries[line2Entries.length - 1];
      setLine2Data({
        partNumber: lastLine2Entry.partNumber || '-',
        partName: lastLine2Entry.partName || '-',
        totalQuantity: lastLine2Entry.totalQuantity || '0',
        partsPerHour: Math.ceil(lastLine2Entry.partsPerHour).toString(),
        totalScrap: lastLine2Entry.totalScrap || '0',
        scrapRate: lastLine2Entry.scrapRate || '0.0'
      });

      const line2GraphData = processLineData(line2Entries);
      setLineData2(line2GraphData);
    }
  };

  const totalQuantity = parseInt(line1Data.totalQuantity) + parseInt(line2Data.totalQuantity);
  const totalScrap = parseInt(line1Data.totalScrap) + parseInt(line2Data.totalScrap);
  const avgScrapRate = ((parseFloat(line1Data.scrapRate) + parseFloat(line2Data.scrapRate)) / 2).toFixed(1);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="flex-none bg-white shadow-sm py-1">
        <div className="mx-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClipboardList className="w-5 h-5 text-black mr-2" />
              <h1 className="text-base font-bold text-black">Decatur MX - Flock Real Time Report</h1>
            </div>
            <div className="flex items-center gap-6">
              {lastRefreshTime && (
                <div className="flex items-center text-sm text-gray-600">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Last refresh: {formatTime(lastRefreshTime)}
                </div>
              )}
              <div className="text-base font-bold text-black">
                {formatDate(currentTime)} {formatTime(currentTime)}
              </div>
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-2 py-1 min-h-0 overflow-hidden">
        <div className="grid grid-cols-5 gap-1 h-full">
          <div className="h-full flex flex-col gap-1">
            <div className="flex-1 flex flex-col gap-1">
              <div className="bg-white rounded-lg shadow-sm p-2 flex-1">
                <h2 className="text-sm font-semibold text-black mb-1">Current Part Line 1</h2>
                <div className="space-y-1">
                  <div className="text-sm">
                    <p className="text-black text-xs">Part Number</p>
                    <p className="font-medium text-black">{line1Data.partNumber}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-black text-xs">Part Name</p>
                    <p className="font-medium text-black">{line1Data.partName}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-black text-xs">Total Quantity / Shift</p>
                    <p className="font-medium text-black">{line1Data.totalQuantity}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-black text-xs">Parts / Hour</p>
                    <p className="font-medium text-black">{line1Data.partsPerHour}</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-lg shadow-sm p-2 ${getScrapRateColor(line1Data.scrapRate)}`}>
                <h2 className="text-sm font-semibold text-black mb-1">Scrap Line 1</h2>
                <div className="space-y-1">
                  <div className="text-sm">
                    <p className="text-black text-xs">Total Scrap</p>
                    <p className="font-medium text-black">{line1Data.totalScrap}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-black text-xs">Scrap Rate</p>
                    <p className="font-medium text-black">{line1Data.scrapRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <div className="bg-white rounded-lg shadow-sm p-2 flex-1">
                <h2 className="text-sm font-semibold text-black mb-1">Current Part Line 2</h2>
                <div className="space-y-1">
                  <div className="text-sm">
                    <p className="text-black text-xs">Part Number</p>
                    <p className="font-medium text-black">{line2Data.partNumber}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-black text-xs">Part Name</p>
                    <p className="font-medium text-black">{line2Data.partName}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-black text-xs">Total Quantity / Shift</p>
                    <p className="font-medium text-black">{line2Data.totalQuantity}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-black text-xs">Parts / Hour</p>
                    <p className="font-medium text-black">{line2Data.partsPerHour}</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-lg shadow-sm p-2 ${getScrapRateColor(line2Data.scrapRate)}`}>
                <h2 className="text-sm font-semibold text-black mb-1">Scrap Line 2</h2>
                <div className="space-y-1">
                  <div className="text-sm">
                    <p className="text-black text-xs">Total Scrap</p>
                    <p className="font-medium text-black">{line2Data.totalScrap}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-black text-xs">Scrap Rate</p>
                    <p className="font-medium text-black">{line2Data.scrapRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-3 flex flex-col gap-1">
            <div className="bg-white rounded-lg shadow-sm p-1 h-[calc(50%-0.125rem)]">
              <LineGraph title="Line 1 Production Rate" data={lineData1} color="#3B82F6" />
            </div>
            <div className="bg-white rounded-lg shadow-sm p-1 h-[calc(50%-0.125rem)]">
              <LineGraph title="Line 2 Production Rate" data={lineData2} color="#10B981" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="bg-white rounded-lg shadow-sm p-1 h-[calc(50%-0.125rem)]">
              <CameraFeed />
            </div>
            <div className={`rounded-lg shadow-sm p-2 ${getScrapRateColor(avgScrapRate)}`}>
              <div className="space-y-1">
                <div className="text-sm">
                  <p className="text-black text-xs">Total Quantity Produced</p>
                  <p className="font-medium text-black">{totalQuantity}</p>
                </div>
                <div className="text-sm">
                  <p className="text-black text-xs">Total Scrap</p>
                  <p className="font-medium text-black">{totalScrap}</p>
                </div>
                <div className="text-sm">
                  <p className="text-black text-xs">Average Scrap Rate</p>
                  <p className="font-medium text-black">{avgScrapRate}%</p>
                </div>
              </div>
            </div>
            <div className={`rounded-lg shadow-sm p-1 flex-1 ${getScrapRateColor(avgScrapRate)}`}>
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-black">
                  <svg width="168" height="168" viewBox="0 0 100 100" className="fill-current">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="5"/>
                    <circle cx="35" cy="40" r="5"/>
                    <circle cx="65" cy="40" r="5"/>
                    <path d={getSmileyPath(avgScrapRate)} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;