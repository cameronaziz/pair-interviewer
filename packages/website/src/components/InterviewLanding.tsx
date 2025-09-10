'use client';

import type { InterviewSession, InterviewTemplate } from '@/types';
import { AlertCircle, CheckCircle, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

type InterviewLandingProps = {
  session: InterviewSession;
  template: InterviewTemplate;
};

const InterviewLanding: React.FC<InterviewLandingProps> = ({ session, template }) => {
  const [confirmedName, setConfirmedName] = useState(session.intervieweeName || '');
  const [confirmedEmail, setConfirmedEmail] = useState(session.intervieweeEmail || '');
  const [launching, setLaunching] = useState(false);
  const [restarting, setRestarting] = useState(false);

  const handleStartInterview = async () => {
    if (!confirmedName.trim() || !confirmedEmail.trim()) {
      toast.error('Please confirm your name and email');
      return;
    }

    setLaunching(true);

    try {
      // Update session with confirmed details
      const response = await fetch(`/api/interview/${session.sessionLink}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: confirmedName,
          email: confirmedEmail
        })
      });

      if (!response.ok) {
        throw new Error('Failed to confirm details');
      }

      // Redirect directly to recording interface with embedded VS Code
      toast.success('Starting interview with embedded VS Code...');
      
      // Start recording session
      await startRecording();
      
      setLaunching(false);

    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview');
      setLaunching(false);
    }
  };

  const launchVSCodeWeb = async () => {
    try {
      // Create VS Code Web URL with the repository loaded
      const vscodeWebUrl = `https://vscode.dev/${template.repoUrl.replace('https://github.com/', 'github/')}/tree/${template.commitHash}`;

      // Open VS Code Web in a new window
      const vscodeWindow = window.open(vscodeWebUrl, '_blank', 'width=1400,height=900');

      if (!vscodeWindow) {
        throw new Error('Popup blocked');
      }

      // Show success message
      toast.success('VS Code Web opened! Interview recording will start automatically.');

      // Start recording in our application
      await startRecording();

      setLaunching(false);

    } catch (error) {
      console.error('Error launching VS Code Web:', error);
      toast.error('Failed to open VS Code Web. Please allow popups and try again.');
      setLaunching(false);
    }
  };

  const startRecording = async () => {
    try {
      // Start the recording session in our system
      const response = await fetch(`/api/interview/${session.sessionLink}/start-recording`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to start recording');
      }

      // Redirect to recording interface
      window.location.href = `/interview/${session.sessionLink}/recording`;

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording session');
    }
  };

  const downloadExtension = () => {
    // In a real implementation, this would download the .vsix file
    toast('Extension download will be available soon', { icon: 'ℹ️' });
  };

  const handleRestartSession = async () => {
    try {
      setRestarting(true);
      
      const response = await fetch(`/api/interview/${session.sessionLink}/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        toast.success('Session restarted successfully!');
        // Reload the page to show the active session UI
        window.location.reload();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to restart session');
      }
      
    } catch (error) {
      console.error('Error restarting session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to restart session');
      setRestarting(false);
    }
  };

  // Show status info but allow users to continue regardless
  const showStatusInfo = session.status === 'completed' || session.status === 'in-progress';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 ${showStatusInfo ? 'bg-blue-600' : 'bg-primary-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {showStatusInfo ? <RotateCcw className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {showStatusInfo ? 'Continue Your Interview' : 'Welcome to Your Technical Interview'}
            </h1>
            <p className="text-gray-600">
              {showStatusInfo 
                ? `This session was previously ${session.status}. You can continue or restart.`
                : 'You\'re about to start a recorded coding session using VS Code'
              }
            </p>
          </div>

          {/* Status Banner */}
          {showStatusInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800 mb-1">Session Status</h3>
                  <p className="text-sm text-blue-700">
                    Status: <span className="font-semibold capitalize">{session.status}</span>
                    {session.startTime && (
                      <span className="block">
                        Started: {new Date(session.startTime).toLocaleString()}
                      </span>
                    )}
                    {session.endTime && (
                      <span className="block">
                        Ended: {new Date(session.endTime).toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Your Name
              </label>
              <input
                type="text"
                value={confirmedName}
                onChange={(e) => setConfirmedName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Your Email
              </label>
              <input
                type="email"
                value={confirmedEmail}
                onChange={(e) => setConfirmedEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-2">How it works</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• VS Code Web will open in a new tab (no installation required)</li>
                  <li>• The repository will be loaded automatically</li>
                  <li>• Your coding activity will be recorded during the session</li>
                  <li>• Maximum session duration: 30 minutes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {showStatusInfo && (
              <button
                onClick={handleRestartSession}
                disabled={restarting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {restarting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Restarting...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-5 h-5" />
                    <span>Restart Session</span>
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleStartInterview}
              disabled={launching || !confirmedName.trim() || !confirmedEmail.trim()}
              className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {launching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>{showStatusInfo ? 'Continue Interview' : 'Start Interview'}</span>
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Having trouble? Make sure VS Code is installed and try refreshing this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewLanding;