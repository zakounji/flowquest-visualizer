
import { useState, useEffect } from 'react';
import { parseLogText } from '../utils/logParser';
import { Entity, Relationship, ProcessData } from '../types/processTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useProcessMining(logText: string) {
  const [processData, setProcessData] = useState<ProcessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(true);

  useEffect(() => {
    if (!logText.trim()) {
      setProcessData(null);
      return;
    }

    const processLog = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let result: ProcessData;
        
        if (useAI) {
          console.log("Calling Gemini AI Edge Function with log text:", logText.substring(0, 100) + "...");
          
          // Use Gemini AI via Edge Function
          const { data, error: functionError } = await supabase.functions.invoke('parse-log', {
            body: { logText },
          });
          
          if (functionError) {
            console.error("Edge function error:", functionError);
            throw new Error(`AI parser error: ${functionError.message}`);
          }
          
          console.log("Received Edge Function response:", data);
          
          if (!data || !data.entities || !data.relationships) {
            console.error("Invalid data structure:", data);
            throw new Error('AI parser returned invalid data structure');
          }
          
          result = data as ProcessData;
          toast.success('Log processed with Gemini AI');
        } else {
          // Fallback to local parser
          result = await parseLogText(logText);
          toast.success('Log processed with local parser');
        }
        
        setProcessData(result);
      } catch (err) {
        console.error('Error processing log:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while processing the log.');
        
        // Try fallback to local parser
        if (useAI) {
          setUseAI(false);
          toast.error('AI parsing failed, switching to local parser');
        }
      } finally {
        setLoading(false);
      }
    };

    processLog();
  }, [logText, useAI]);

  const clearData = () => {
    setProcessData(null);
    setError(null);
  };

  const toggleAIParser = () => {
    setUseAI(!useAI);
    return !useAI;
  };

  return { processData, loading, error, clearData, useAI, toggleAIParser };
}
