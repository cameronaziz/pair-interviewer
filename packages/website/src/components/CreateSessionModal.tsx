'use client';

import { useState } from 'react';
import { X, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import type { InterviewTemplate, InterviewSession, CreateSessionForm } from '@/types';

type CreateSessionModalProps = {
  template: InterviewTemplate;
  onClose: () => void;
  onSuccess: (session: InterviewSession) => void;
};

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ template, onClose, onSuccess }) => {
  const [form, setForm] = useState<CreateSessionForm>({
    templateId: template.id,
    intervieweeName: '',
    intervieweeEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [createdSession, setCreatedSession] = useState<InterviewSession | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.intervieweeName.trim() || !form.intervieweeEmail.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        const newSession = await response.json();
        setCreatedSession(newSession);
        onSuccess(newSession);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create session');
      }
    } catch (error) {
      toast.error('Error creating session');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const getInterviewLink = (session: InterviewSession) => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.vercel.app' 
      : 'http://localhost:3000';
    return `${baseUrl}/interview/${session.sessionLink}`;
  };

  if (createdSession) {
    const interviewLink = getInterviewLink(createdSession);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Interview Session Created</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-green-900 mb-2">Success!</h3>
              <p className="text-green-700">
                Interview session created for {createdSession.intervieweeName}. 
                Send them the link below to start the interview.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={interviewLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-md text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(interviewLink)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Instructions for the interviewee:</h4>
                <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
                  <li>Click the interview link above</li>
                  <li>Confirm your name and email on the landing page</li>
                  <li>Click "Start Interview" to launch VS Code with the extension</li>
                  <li>The recording will begin automatically</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Requirements:</h4>
                <ul className="text-yellow-800 text-sm space-y-1 list-disc list-inside">
                  <li>VS Code must be installed on the interviewee's machine</li>
                  <li>The Pair Interviewer extension will be automatically installed</li>
                  <li>Recording is limited to 30 minutes for free tier</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <a
                href={interviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 flex items-center space-x-1"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Test Link</span>
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Interview Session</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-1">{template.templateName}</h3>
            <p className="text-sm text-gray-600">{template.repoUrl}</p>
            <p className="text-xs text-gray-500">
              Branch: {template.branchName} • Commit: {template.commitHash.substring(0, 8)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interviewee Name *
            </label>
            <input
              type="text"
              value={form.intervieweeName}
              onChange={(e) => setForm(prev => ({ ...prev, intervieweeName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interviewee Email *
            </label>
            <input
              type="email"
              value={form.intervieweeEmail}
              onChange={(e) => setForm(prev => ({ ...prev, intervieweeEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Creating...' : 'Create Session'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSessionModal;