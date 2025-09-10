'use client';

import { useState } from 'react';
import { X, Github, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import type { InterviewTemplate, CreateTemplateForm } from '@/types';

type CreateTemplateModalProps = {
  onClose: () => void;
  onSuccess: (template: InterviewTemplate) => void;
};

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState<CreateTemplateForm>({
    templateName: '',
    repoUrl: '',
    branchName: 'main',
    commitHash: ''
  });
  const [loading, setLoading] = useState(false);
  const [validatingRepo, setValidatingRepo] = useState(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [commits, setCommits] = useState<Array<{ sha: string; message: string }>>([]);

  const handleRepoChange = async (url: string) => {
    setForm(prev => ({ ...prev, repoUrl: url, branchName: 'main', commitHash: '' }));
    setBranches([]);
    setCommits([]);

    if (!url.includes('github.com')) return;

    setValidatingRepo(true);
    try {
      const response = await fetch('/api/github/validate-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: url })
      });

      if (response.ok) {
        const data = await response.json();
        setBranches(data.branches || []);
        toast.success('Repository validated successfully!');
      } else {
        toast.error('Unable to access repository. Please check the URL or your permissions.');
      }
    } catch (error) {
      toast.error('Error validating repository');
    } finally {
      setValidatingRepo(false);
    }
  };

  const handleBranchChange = async (branchName: string) => {
    setForm(prev => ({ ...prev, branchName, commitHash: '' }));
    
    if (!form.repoUrl || !branchName) return;

    try {
      const response = await fetch('/api/github/commits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: form.repoUrl, branchName })
      });

      if (response.ok) {
        const data = await response.json();
        setCommits(data.commits || []);
        // Auto-select latest commit
        if (data.commits.length > 0) {
          setForm(prev => ({ ...prev, commitHash: data.commits[0].sha }));
        }
      }
    } catch (error) {
      toast.error('Error fetching commits');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.templateName.trim() || !form.repoUrl.trim() || !form.branchName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Get latest commit if not specified
      let commitHash = form.commitHash;
      if (!commitHash && form.repoUrl && form.branchName) {
        const response = await fetch('/api/github/latest-commit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoUrl: form.repoUrl, branchName: form.branchName })
        });
        
        if (response.ok) {
          const data = await response.json();
          commitHash = data.commitHash;
        }
      }

      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          commitHash
        })
      });

      if (response.ok) {
        const newTemplate = await response.json();
        onSuccess(newTemplate);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create template');
      }
    } catch (error) {
      toast.error('Error creating template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Interview Template</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={form.templateName}
              onChange={(e) => setForm(prev => ({ ...prev, templateName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., React Frontend Interview"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Repository URL *
            </label>
            <div className="relative">
              <input
                type="url"
                value={form.repoUrl}
                onChange={(e) => handleRepoChange(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://github.com/username/repository"
                required
              />
              <Github className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              {validatingRepo && (
                <RefreshCw className="w-5 h-5 text-primary-600 absolute right-3 top-2.5 animate-spin" />
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Make sure you have access to this private repository
            </p>
          </div>

          {branches.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch
              </label>
              <select
                value={form.branchName}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
          )}

          {commits.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commit (Optional)
              </label>
              <select
                value={form.commitHash}
                onChange={(e) => setForm(prev => ({ ...prev, commitHash: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Use latest commit</option>
                {commits.map(commit => (
                  <option key={commit.sha} value={commit.sha}>
                    {commit.sha.substring(0, 8)} - {commit.message.substring(0, 60)}
                    {commit.message.length > 60 ? '...' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              disabled={loading || validatingRepo}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Creating...' : 'Create Template'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplateModal;