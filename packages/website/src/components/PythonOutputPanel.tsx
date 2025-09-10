import React, { useEffect, useRef } from 'react';
import { PythonExecutionResult } from '@/lib/pyodide-manager';

interface PythonOutputPanelProps {
  executionResult: PythonExecutionResult | null;
  isExecuting: boolean;
  onClear: () => void;
}

const PythonOutputPanel: React.FC<PythonOutputPanelProps> = ({
  executionResult,
  isExecuting,
  onClear
}) => {
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [executionResult]);

  const formatExecutionTime = (time: number): string => {
    if (time < 1000) {
      return `${time}ms`;
    }
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatError = (error: string): string => {
    // Format Python traceback for better readability
    return error
      .split('\n')
      .map((line, index) => {
        if (line.includes('Traceback')) {
          return `\x1b[31m${line}\x1b[0m`; // Red for traceback
        }
        if (line.includes('File') && line.includes('line')) {
          return `\x1b[33m${line}\x1b[0m`; // Yellow for file info
        }
        if (line.trim().startsWith('^')) {
          return `\x1b[36m${line}\x1b[0m`; // Cyan for error pointer
        }
        if (line.includes('Error:') || line.includes('Exception:')) {
          return `\x1b[31m${line}\x1b[0m`; // Red for error messages
        }
        return line;
      })
      .join('\n');
  };

  return (
    <div className="h-full bg-[#1e1e1e] text-white flex flex-col">
      {/* Header */}
      <div className="h-8 bg-[#2d2d30] border-b border-[#3e3e42] flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Python Output</span>
          {isExecuting && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Executing...</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {executionResult && (
            <span className="text-xs text-gray-400">
              {formatExecutionTime(executionResult.executionTime)}
            </span>
          )}
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-[#3e3e42]"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Output Content */}
      <div 
        ref={outputRef}
        className="flex-1 p-4 overflow-auto font-mono text-sm leading-relaxed"
        style={{ 
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {isExecuting ? (
          <div className="flex items-center space-x-2 text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span>Executing Python code...</span>
          </div>
        ) : executionResult ? (
          <div className="space-y-2">
            {/* Output */}
            {executionResult.output && (
              <div className="text-green-400">
                {executionResult.output}
              </div>
            )}

            {/* Error */}
            {executionResult.error && (
              <div 
                className="text-red-400"
                dangerouslySetInnerHTML={{
                  __html: formatError(executionResult.error).replace(/\x1b\[[0-9;]*m/g, (match) => {
                    switch (match) {
                      case '\x1b[31m': return '<span style="color: #ff6b6b">';
                      case '\x1b[33m': return '<span style="color: #ffd93d">';
                      case '\x1b[36m': return '<span style="color: #6bcf7f">';
                      case '\x1b[0m': return '</span>';
                      default: return match;
                    }
                  })
                }}
              />
            )}

            {/* Return Value */}
            {executionResult.returnValue !== null && executionResult.returnValue !== undefined && (
              <div className="text-yellow-400">
                <span className="text-gray-500">Return value: </span>
                {typeof executionResult.returnValue === 'object' 
                  ? JSON.stringify(executionResult.returnValue, null, 2)
                  : String(executionResult.returnValue)
                }
              </div>
            )}

            {/* Execution Summary */}
            <div className="pt-2 border-t border-[#3e3e42] text-xs text-gray-500">
              Execution completed in {formatExecutionTime(executionResult.executionTime)}
              {executionResult.error ? ' (with errors)' : ' (successfully)'}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            <div className="text-4xl mb-4">🐍</div>
            <div>Python output will appear here</div>
            <div className="text-sm mt-2">Execute a Python file to see results</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PythonOutputPanel;
