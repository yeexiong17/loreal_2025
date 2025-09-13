import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AnalysisStatus } from '../types';
import { apiService } from '../services/api';

interface AnalysisContextType {
  analysisStatus: AnalysisStatus | null;
  isAnalysisRunning: boolean;
  canResume: boolean;
  startAnalysis: () => Promise<void>;
  resumeAnalysis: () => Promise<void>;
  stopAnalysis: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  clearAnalysis: () => Promise<void>;
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
  const canResume = analysisStatus?.status === 'stopped' && analysisStatus?.processed_comments > 0;

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

  const resumeAnalysis = async () => {
    if (!analysisStatus?.analysis_id) {
      throw new Error('No analysis to resume');
    }

    try {
      console.log('Resuming analysis:', analysisStatus.analysis_id);
      const result = await apiService.resumeAnalysis(analysisStatus.analysis_id);
      
      if (result.analysis_id) {
        // Update status to processing
        const resumedStatus = { ...analysisStatus, status: 'processing' as const };
        setAnalysisStatus(resumedStatus);
        localStorage.setItem('analysisStatus', JSON.stringify(resumedStatus));

        // Start polling for status updates
        startPolling(result.analysis_id);
      }
    } catch (error) {
      console.error('Failed to resume analysis:', error);
      throw error;
    }
  };

  const stopAnalysis = async () => {
    console.log('stopAnalysis called, current status:', analysisStatus);
    console.log('pollingInterval exists:', !!pollingInterval);
    
    // Stop polling immediately
    if (pollingInterval) {
      console.log('Clearing polling interval');
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    if (analysisStatus?.status === 'processing' && analysisStatus.analysis_id) {
      console.log('Stopping analysis with ID:', analysisStatus.analysis_id);
      try {
        // Call backend to stop the analysis
        const result = await apiService.stopAnalysis(analysisStatus.analysis_id);
        console.log('Backend stop response:', result);

        // Update local status
        const stoppedStatus = { ...analysisStatus, status: 'stopped' as const };
        setAnalysisStatus(stoppedStatus);
        localStorage.setItem('analysisStatus', JSON.stringify(stoppedStatus));
        console.log('Status updated to stopped');
      } catch (error) {
        console.error('Failed to stop analysis:', error);
        // Still update local status even if backend call fails
        const stoppedStatus = { ...analysisStatus, status: 'stopped' as const };
        setAnalysisStatus(stoppedStatus);
        localStorage.setItem('analysisStatus', JSON.stringify(stoppedStatus));
        console.log('Status updated to stopped (fallback)');
      }
    } else {
      console.log('No processing analysis to stop');
    }
  };

  const startPolling = (analysisId: string) => {
    console.log('Starting polling for analysis ID:', analysisId);
    const interval = setInterval(async () => {
      try {
        console.log('Polling status for analysis:', analysisId);
        const status = await apiService.getAnalysisStatus(analysisId);
        console.log('Received status:', status);
        setAnalysisStatus(status);
        localStorage.setItem('analysisStatus', JSON.stringify(status));

        if (status.status === 'completed' || status.status === 'failed' || status.status === 'stopped' || status.status === 'stopping') {
          console.log('Analysis finished, stopping polling. Status:', status.status);
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

  const clearAnalysis = async () => {
    // Stop polling immediately
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    // Stop any running analysis
    if (analysisStatus?.status === 'processing' && analysisStatus.analysis_id) {
      try {
        await apiService.stopAnalysis(analysisStatus.analysis_id);
        console.log('Analysis stopped during clear');
      } catch (error) {
        console.error('Failed to stop analysis during clear:', error);
      }
    }

    // Clear local state
    setAnalysisStatus(null);
    localStorage.removeItem('analysisStatus');
    
    // Reset to latest chosen model (this will be handled by the model switcher)
    console.log('Analysis cleared, ready for new analysis');
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
  }, [analysisStatus?.status, analysisStatus?.analysis_id]); // Include dependencies

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
    canResume,
    startAnalysis,
    resumeAnalysis,
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
