/**
 * Markdown Preview Component
 * 
 * A simple markdown preview component that can be used alongside
 * the Monaco Editor to provide markdown preview functionality.
 * This demonstrates the enhanced markdown capabilities we've added.
 */

import React, { useState, useEffect } from 'react';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, className = '' }) => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    // Simple markdown to HTML conversion
    // In a real implementation, you might want to use a proper markdown parser
    const convertMarkdownToHtml = (markdown: string): string => {
      return markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        // Code blocks
        .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
        // Inline code
        .replace(/`([^`]*)`/gim, '<code>$1</code>')
        // Links
        .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        // Line breaks
        .replace(/\n/gim, '<br>');
    };

    setHtmlContent(convertMarkdownToHtml(content));
  }, [content]);

  return (
    <div 
      className={`markdown-preview prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        padding: '16px',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: '14px',
        lineHeight: '1.5'
      }}
    />
  );
};

export default MarkdownPreview;
