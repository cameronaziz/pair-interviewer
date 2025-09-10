'use client';

import type { InterviewSession, InterviewTemplate } from '@/types';
import { Clock, RotateCcw, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import EmbeddedVSCode from './EmbeddedVSCode';


type RecordingInterfaceProps = {
  session: InterviewSession;
  template: InterviewTemplate;
};

const RecordingInterface: React.FC<RecordingInterfaceProps> = ({ session, template }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const MAX_RECORDING_TIME = 30 * 60; // 30 minutes in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;

          // Auto-stop at 30 minutes for free tier
          if (newTime >= MAX_RECORDING_TIME) {
            handleStopRecording();
            toast('Maximum recording time reached (30 minutes)', { icon: '⚠️' });
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    // Auto-start recording when component mounts
    handleStartRecording();
  }, []);


  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      toast.success('Recording started!');

      // Here you would integrate with actual recording logic
      // For now, we'll simulate the recording

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);

      // End the session
      const response = await fetch(`/api/interview/${session.sessionLink}/end-recording`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endTime: new Date().toISOString(),
          duration: timeElapsed
        })
      });

      if (response.ok) {
        toast.success('Recording stopped successfully!');


        // Redirect to completion page
        window.location.href = `/interview/${session.sessionLink}/complete`;
      } else {
        throw new Error('Failed to stop recording');
      }

    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Failed to stop recording');
      setIsRecording(true); // Resume recording on error
    }
  };

  const handleRestartSession = async () => {
    try {
      setIsRestarting(true);

      const response = await fetch(`/api/interview/${session.sessionLink}/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        toast.success('Session restarted successfully!');

        // Reset local state
        setTimeElapsed(0);
        setIsRecording(false);

        // Reload the page to reset everything
        window.location.reload();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to restart session');
      }

    } catch (error) {
      console.error('Error restarting session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to restart session');
      setIsRestarting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (timeElapsed / MAX_RECORDING_TIME) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Interview Recording</h1>
            <p className="text-sm text-gray-600">{template.templateName}</p>
          </div>

          <div className="flex items-center space-x-6">
            {/* Timer */}
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-lg font-mono font-semibold text-gray-900">
                {formatTime(timeElapsed)} / {formatTime(MAX_RECORDING_TIME)}
              </span>
            </div>

            {/* Recording Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className={`text-sm font-medium ${isRecording ? 'text-red-600' : 'text-gray-600'}`}>
                {isRecording ? 'Recording' : 'Stopped'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRestartSession}
                disabled={isRestarting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isRestarting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Restarting...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Restart</span>
                  </>
                )}
              </button>
              <button
                onClick={handleStopRecording}
                disabled={!isRecording}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Square className="w-4 h-4" />
                <span>Stop Recording</span>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>
      <div className="h-full flex flex-col">
        <div className="flex-1 px-6 pb-6">
          <EmbeddedVSCode
            template={template}
            sessionId={session.sessionLink}
          />
        </div>
      </div>
    </div>
  );
};

export default RecordingInterface;