import React from 'react';
import { Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';

interface FileUploadProps {
  onFileUpload: (data: any[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const {
    state: { fileName, error, isRefreshing, isAutoRefreshEnabled },
    fileInputRef,
    handleFileChange,
    handleManualRefresh,
    toggleAutoRefresh
  } = useFileUpload({ onFileUpload });

  return (
    <div className="flex items-center gap-2">
      <label 
        className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
      >
        <Upload className="w-5 h-5 mr-2" />
        <span className="text-sm font-medium">Upload Excel</span>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />
      </label>
      {fileName && !error && (
        <>
          <button
            onClick={toggleAutoRefresh}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              isAutoRefreshEnabled
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isAutoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <span className="text-sm text-gray-500">
            {fileName}
          </span>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-full ${
              isRefreshing 
                ? 'bg-gray-100 text-gray-400' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            title="Manual refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </>
      )}
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};