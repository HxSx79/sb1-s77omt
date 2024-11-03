import { useState, useRef, useCallback, useEffect } from 'react';
import { validateExcelFile, createFileCache, readAndProcessFile, FileCache } from '../utils/fileHandler';

interface UseFileUploadProps {
  onFileUpload: (data: any[]) => void;
  refreshInterval?: number;
}

interface FileUploadState {
  fileName: string | null;
  error: string | null;
  isRefreshing: boolean;
  isAutoRefreshEnabled: boolean;
}

export const useFileUpload = ({ onFileUpload, refreshInterval = 30000 }: UseFileUploadProps) => {
  const [state, setState] = useState<FileUploadState>({
    fileName: null,
    error: null,
    isRefreshing: false,
    isAutoRefreshEnabled: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileCacheRef = useRef<FileCache | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  const cleanupResources = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = undefined;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileCacheRef.current = null;
    setState(prev => ({
      ...prev,
      isAutoRefreshEnabled: false,
      fileName: null,
      error: null
    }));
  }, []);

  const processAndUpload = async () => {
    if (!fileCacheRef.current) {
      setState(prev => ({
        ...prev,
        error: 'No file available. Please upload a file.'
      }));
      return;
    }

    setState(prev => ({ ...prev, error: null, isRefreshing: true }));

    try {
      const data = await readAndProcessFile(fileCacheRef.current);
      onFileUpload(data);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to process Excel file. Please try uploading the file again.';
      setState(prev => ({ ...prev, error: errorMessage }));
      cleanupResources();
    } finally {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  };

  const startAutoRefresh = useCallback(() => {
    setState(prev => ({ ...prev, isAutoRefreshEnabled: true }));
    refreshIntervalRef.current = setInterval(() => {
      processAndUpload();
    }, refreshInterval);
  }, [refreshInterval]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    cleanupResources();

    const validation = validateExcelFile(file);
    if (!validation.isValid) {
      setState(prev => ({ ...prev, error: validation.error || 'Invalid file' }));
      return;
    }

    try {
      fileCacheRef.current = await createFileCache(file);
      setState(prev => ({ ...prev, fileName: file.name }));
      await processAndUpload();
      startAutoRefresh();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to read file. Please try again.';
      setState(prev => ({ ...prev, error: errorMessage }));
      cleanupResources();
    }
  };

  const handleManualRefresh = async () => {
    if (state.isRefreshing) return;
    await processAndUpload();
  };

  const toggleAutoRefresh = () => {
    if (state.isAutoRefreshEnabled) {
      cleanupResources();
    } else if (fileCacheRef.current) {
      startAutoRefresh();
    }
  };

  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  return {
    state,
    fileInputRef,
    handleFileChange,
    handleManualRefresh,
    toggleAutoRefresh
  };
};