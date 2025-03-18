
import { useState, useEffect } from 'react';
import { parseLogText } from '../utils/logParser';
import { Entity, Relationship, ProcessData } from '../types/processTypes';

export function useProcessMining(logText: string) {
  const [processData, setProcessData] = useState<ProcessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!logText.trim()) {
      setProcessData(null);
      return;
    }

    const processLog = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Parse the log text to extract entities and relationships
        const result = await parseLogText(logText);
        setProcessData(result);
      } catch (err) {
        console.error('Error processing log:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while processing the log.');
      } finally {
        setLoading(false);
      }
    };

    processLog();
  }, [logText]);

  const clearData = () => {
    setProcessData(null);
    setError(null);
  };

  return { processData, loading, error, clearData };
}
