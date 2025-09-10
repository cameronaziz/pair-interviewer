'use client';

import { useState, useEffect } from 'react';
import { Plus, Play, Calendar, BarChart3, ExternalLink, Users, Copy } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { User, InterviewTemplate, InterviewSession } from '@/types';
import CreateTemplateModal from './CreateTemplateModal';
import CreateSessionModal from './CreateSessionModal';

type DashboardContentProps = {
  user: User;
};

const DashboardContent: React.FC<DashboardContentProps> = ({ user }) => {
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InterviewTemplate | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [templatesRes, sessionsRes] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/sessions')
      ]);

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData);
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = (template: InterviewTemplate) => {
    setSelectedTemplate(template);
    setShowCreateSession(true);
  };

  const handleTemplateCreated = (newTemplate: InterviewTemplate) => {
    setTemplates(prev => [newTemplate, ...prev]);
    setShowCreateTemplate(false);
    toast.success('Template created successfully!');
  };

  const handleSessionCreated = (newSession: InterviewSession) => {
    setSessions(prev => [newSession, ...prev]);
    setShowCreateSession(false);
    toast.success('Interview session created successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user.firstName || user.email}! 
            You're on the <span className="font-semibold capitalize">{user.plan}</span> plan.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => 
                    new Date(s.createdAt).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Interview Templates</h2>
            <button
              onClick={() => setShowCreateTemplate(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
              disabled={user.plan === 'free' && templates.length >= 1}
            >
              <Plus className="w-4 h-4" />
              <span>New Template</span>
            </button>
          </div>

          {user.plan === 'free' && templates.length >= 1 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm">
                You've reached the template limit for the free plan. 
                <Link href="#pricing" className="font-medium underline ml-1">
                  Upgrade to Pro
                </Link> for unlimited templates.
              </p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm">
            {templates.length === 0 ? (
              <div className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first interview template to get started.
                </p>
                <button
                  onClick={() => setShowCreateTemplate(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Create Template
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {templates.map((template) => (
                  <div key={template.id} className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{template.templateName}</h3>
                      <p className="text-gray-600">{template.repoUrl}</p>
                      <p className="text-sm text-gray-500">
                        Branch: {template.branchName} • Commit: {template.commitHash.substring(0, 8)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCreateSession(template)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-1"
                      >
                        <Play className="w-4 h-4" />
                        <span>Create Interview</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Interviews */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Interviews</h2>
          <div className="bg-white rounded-lg shadow-sm">
            {sessions.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
                <p className="text-gray-600">
                  Create a template and start your first interview session.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {sessions.slice(0, 10).map((session) => {
                  const interviewUrl = `${window.location.origin}/interview/${session.sessionLink}`;
                  
                  return (
                    <div key={session.id} className="p-6 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {session.intervieweeName || 'Unnamed Session'}
                        </h3>
                        <p className="text-gray-600">{session.intervieweeEmail}</p>
                        <p className="text-sm text-gray-500">
                          Created {format(new Date(session.createdAt), 'MMM d, yyyy')}
                        </p>
                        <div className="mt-2 flex items-center space-x-2">
                          <p className="text-sm text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
                            {interviewUrl}
                          </p>
                          <button
                            onClick={() => navigator.clipboard.writeText(interviewUrl)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Copy URL"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(session.status)}`}>
                          {session.status}
                        </span>
                        {session.status === 'completed' && (
                          <Link
                            href={`/interview/${session.id}/results`}
                            className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>View Results</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateTemplate && (
        <CreateTemplateModal
          onClose={() => setShowCreateTemplate(false)}
          onSuccess={handleTemplateCreated}
        />
      )}

      {showCreateSession && selectedTemplate && (
        <CreateSessionModal
          template={selectedTemplate}
          onClose={() => {
            setShowCreateSession(false);
            setSelectedTemplate(null);
          }}
          onSuccess={handleSessionCreated}
        />
      )}
    </div>
  );
};

export default DashboardContent;