import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AnalysisStatus } from '../types';
import { apiService } from '../services/api';

interface AnalysisContextType {
  analysisStatus: AnalysisStatus | null;
  isAnalysisRunning: boolean;
  startAnalysis: () => Promise<void>;
  stopAnalysis: () => void;
  refreshStatus: () => Promise<void>;
  clearAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

interface AnalysisProviderProps {
  children: ReactNode;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ children }) => {
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | null>(() => {
    // Try to recover analysis state from localStorage
    const saved = localStorage.getItem('analysisStatus');
    return saved ? JSON.parse(saved) : null;
  });
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const isAnalysisRunning = analysisStatus?.status === 'processing';

  const startAnalysis = async () => {
    try {
      const result = await apiService.startAnalysis({
        analysis_types: ['quality', 'sentiment', 'categorization', 'spam']
      });

      if (result.analysis_id) {
        const newStatus = {
          analysis_id: result.analysis_id,
          status: 'processing' as const,
          progress: 0,
          total_comments: 0,
          processed_comments: 0
        };
        setAnalysisStatus(newStatus);
        localStorage.setItem('analysisStatus', JSON.stringify(newStatus));

        // Start polling for status updates
        startPolling(result.analysis_id);
      }
    } catch (error) {
      console.error('Failed to start analysis:', error);
      throw error;
    }
  };

  const stopAnalysis = async () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    if (analysisStatus?.status === 'processing' && analysisStatus.analysis_id) {
      try {
        // Call backend to stop the analysis
        await apiService.stopAnalysis(analysisStatus.analysis_id);

        // Update local status
        const stoppedStatus = { ...analysisStatus, status: 'stopped' as const };
        setAnalysisStatus(stoppedStatus);
        localStorage.setItem('analysisStatus', JSON.stringify(stoppedStatus));
      } catch (error) {
        console.error('Failed to stop analysis:', error);
        // Still update local status even if backend call fails
        const stoppedStatus = { ...analysisStatus, status: 'stopped' as const };
        setAnalysisStatus(stoppedStatus);
        localStorage.setItem('analysisStatus', JSON.stringify(stoppedStatus));
      }
    }
  };

  const startPolling = (analysisId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await apiService.getAnalysisStatus(analysisId);
        setAnalysisStatus(status);
        localStorage.setItem('analysisStatus', JSON.stringify(status));

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          setPollingInterval(null);
        }
      } catch (err) {
        console.error('Error polling analysis status:', err);
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 2000); // Poll every 2 seconds

    setPollingInterval(interval);
  };

  const refreshStatus = async () => {
    if (analysisStatus?.analysis_id) {
      try {
        const status = await apiService.getAnalysisStatus(analysisStatus.analysis_id);
        setAnalysisStatus(status);
        localStorage.setItem('analysisStatus', JSON.stringify(status));
      } catch (err) {
        console.error('Error refreshing analysis status:', err);
      }
    }
  };

  const clearAnalysis = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setAnalysisStatus(null);
    localStorage.removeItem('analysisStatus');
  };

  // Recovery mechanism - check for running analysis on mount
  useEffect(() => {
    const recoverAnalysis = async () => {
      if (analysisStatus?.status === 'processing' && analysisStatus.analysis_id) {
        console.log('Recovering analysis state:', analysisStatus.analysis_id);
        // Start polling for the recovered analysis
        startPolling(analysisStatus.analysis_id);
      }
    };

    recoverAnalysis();
  }, []); // Only run on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const value: AnalysisContextType = {
    analysisStatus,
    isAnalysisRunning,
    startAnalysis,
    stopAnalysis,
    refreshStatus,
    clearAnalysis,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};
