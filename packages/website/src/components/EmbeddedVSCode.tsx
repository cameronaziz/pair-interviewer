'use client';

import useFetchRepo from '@/hooks/useFetchRepo';
import useFiles from '@/hooks/useFiles';
import { getEditorOptions } from '@/lib/monaco-loader';
import { pyodideManager, PythonExecutionResult } from '@/lib/pyodide-manager';
import { FileData, InterviewTemplate, TreeNode } from '@/types';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getFileIcon } from './IDE/fileIcon';
import FileTree from './IDE/FileTree';
import Loading from './IDE/Loading';
import PythonOutputPanel from './PythonOutputPanel';

type EmbeddedVSCodeProps = {
  template: InterviewTemplate;
  sessionId: string;
  onReady?: () => void;
};


const EmbeddedVSCode: React.FC<EmbeddedVSCodeProps> = ({ template, sessionId }) => {
  // Use simple hook to get files
  const [isLoading, getFiles] = useFiles(template, sessionId);
  // Local state
  const [files, setFiles] = useState<FileData[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<FileData | null>(null);
  const [openTabs, setOpenTabs] = useState<FileData[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loadedFiles, setLoadedFiles] = useState<Set<string>>(new Set());
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
  const [extensionsLoaded, setExtensionsLoaded] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const [isFetchingRepo, fetchRepo] = useFetchRepo(template.repoUrl, template.commitHash);
  const initializedRef = useRef(false);
  
  // Python execution state
  const [pythonOutputTab, setPythonOutputTab] = useState<FileData | null>(null);
  const [pythonExecutionResult, setPythonExecutionResult] = useState<PythonExecutionResult | null>(null);
  const [isExecutingPython, setIsExecutingPython] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  // const renderCountRef = useRef(0);
  // const nodesRef = useRef<any>([]);

  useEffect(() => {
    let isCancelled = false;

    const loadRepository = async () => {
      try {
        const fetchedFiles = await fetchRepo();

        if (isCancelled || !isMountedRef.current) {
          return;
        }

        setFiles(fetchedFiles);

        const rootFiles = fetchedFiles.filter((file: any) => {
          const pathParts = file.path.split('/');
          return file.type === 'file' && pathParts.length === 1;
        });

        if (rootFiles.length > 0) {
          const rootFilePaths = rootFiles.map((f: any) => f.path);
          const loadedFiles = await getFiles(rootFilePaths);

          if (isCancelled || !isMountedRef.current) {
            return;
          }

          // Update files with content
          const updatedFiles = fetchedFiles.map(file => {
            const loadedFile = loadedFiles.find((f: any) => f.path === file.path);
            if (loadedFile && !(loadedFile as any).error) {
              return {
                ...file,
                content: loadedFile.content,
                language: loadedFile.language
              };
            }
            return file;
          });
          
          setFiles(updatedFiles);

          // Mark files as loaded
          loadedFiles.forEach((file: any) => {
            if (!file.error) {
              setLoadedFiles(prev => new Set(prev).add(file.path));
            }
          });

          // Initialize Pyodide and sync files
          try {
            await pyodideManager.waitForInitialization();
            setPyodideReady(true);
            await pyodideManager.syncFiles(updatedFiles);
          } catch (error) {
            console.error('Failed to initialize Pyodide:', error);
          }
        }
      } catch (error) {
        if (!isCancelled && isMountedRef.current) {
          console.error('Error fetching repository:', error);
          setLoadError('Failed to fetch repository structure');
        }
      }
    };

    loadRepository();

    return () => {
      isCancelled = true;
    };
  }, [template.repoUrl, template.commitHash, fetchRepo, getFiles]);

  const loadFileContent = useCallback(async (filePath: string): Promise<string> => {
    if (!isMountedRef.current) {
      return '';
    }

    if (loadedFiles.has(filePath)) {
      const file = files.find(f => f.path === filePath);
      return file?.content || '';
    }

    if (loadingFiles.has(filePath)) {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50;

        const checkLoaded = () => {
          if (!isMountedRef.current) {
            reject(new Error('Component unmounted'));
            return;
          }

          attempts++;
          if (loadedFiles.has(filePath)) {
            const file = files.find(f => f.path === filePath);
            resolve(file?.content || '');
          } else if (attempts >= maxAttempts) {
            reject(new Error('File loading timeout'));
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    setLoadingFiles(prev => new Set(prev).add(filePath));

    try {
      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const response = await fetch('/api/github/file-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: template.repoUrl,
          commitHash: template.commitHash,
          filePath: filePath
        }),
        signal: abortController.signal
      });

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        return '';
      }

      if ((response as any).ok) {
        const data = await (response as any).json();

        // Update the file in the files state with the loaded content
        setFiles(prevFiles =>
          prevFiles.map(file =>
            file.path === filePath
              ? { ...file, content: data.content, language: data.language }
              : file
          )
        );

        // Mark file as loaded
        setLoadedFiles(prev => new Set(prev).add(filePath));

        return data.content;
      } else {
        const errorData = await (response as any).json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load file content');
      }
    } catch (error) {
      console.error('Error loading file content:', error);

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setLoadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(filePath);
          return newSet;
        });
      }

      if (error instanceof Error && error.name === 'AbortError') {
        return '';
      }

      throw error;
    } finally {
      // Clear the abort controller reference
      if (abortControllerRef.current) {
        abortControllerRef.current = null;
      }
    }
  }, [template.repoUrl, template.commitHash, loadedFiles, loadingFiles, files]);

  const recordFileWrite = useCallback((path: string, content: string) => {
    fetch('/api/recording/file-change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        type: 'file_write',
        path,
        content,
        timestamp: Date.now()
      })
    }).catch(console.error);
  }, [sessionId]);

  const openFile = useCallback(async (file: FileData) => {
    try {
      if (file.type === 'file' && !loadedFiles.has(file.path)) {
        await loadFileContent(file.path);

        // Check if component is still mounted before updating state
        if (!isMountedRef.current) {
          return;
        }

        // The loadFileContent function will update the files state
        // We need to wait for the state to update, then find the updated file
        setTimeout(() => {
          if (!isMountedRef.current) {
            return;
          }

          const updatedFile = files.find(f => f.path === file.path);
          if (updatedFile) {
            setActiveFile(updatedFile);
          } else {
            setActiveFile(file);
          }
        }, 100);
      } else {
        setActiveFile(file);
      }

      if (!openTabs.find(tab => tab.path === file.path)) {
        setOpenTabs(prev => [...prev, file]);
      }

      if (editorRef.current) {
        try {
          editorRef.current.focus();
        } catch (error) {
          console.warn('Could not focus editor:', error);
        }
      }
    } catch (error) {
      console.error('Error opening file:', error);

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setActiveFile(file);
        if (!openTabs.find(tab => tab.path === file.path)) {
          setOpenTabs(prev => [...prev, file]);
        }
      }
    }
  }, [loadedFiles, openTabs, loadFileContent, files]);

  const closeTab = useCallback((file: FileData) => {
    const newTabs = openTabs.filter(tab => tab.path !== file.path);
    setOpenTabs(newTabs);

    if (activeFile?.path === file.path) {
      setActiveFile(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null);
    }
  }, [openTabs, activeFile]);

  const toggleFolder = useCallback(async (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  // Removed parseFilesToTree - using nodes useMemo instead

  const handleContentChange = useCallback((value: string) => {
    if (activeFile && value !== activeFile.content) {
      const updatedFile = { ...activeFile, content: value };
      setActiveFile(updatedFile);

      // Also update the file in the files array
      setFiles(prevFiles =>
        prevFiles.map(file =>
          file.path === activeFile.path
            ? { ...file, content: value }
            : file
        )
      );

      recordFileWrite(activeFile.path, value);

      // Update Pyodide virtual file system if it's a Python file
      if (activeFile.language === 'python' && pyodideReady) {
        pyodideManager.updateFile(activeFile.path, value);
      }
    }
  }, [activeFile, recordFileWrite, pyodideReady]);

  const executePythonFile = useCallback(async (filePath: string) => {
    if (!pyodideReady) {
      console.error('Pyodide not ready');
      return;
    }

    setIsExecutingPython(true);
    
    try {
      const result = await pyodideManager.executeFile(filePath);
      setPythonExecutionResult(result);
      
      // Record the execution
      recordFileWrite('python_execution', JSON.stringify({
        filePath,
        result: {
          output: result.output,
          error: result.error,
          executionTime: result.executionTime
        },
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Python execution failed:', error);
      setPythonExecutionResult({
        output: '',
        error: error instanceof Error ? error.message : String(error),
        returnValue: null,
        executionTime: 0
      });
    } finally {
      setIsExecutingPython(false);
    }
  }, [pyodideReady, recordFileWrite]);

  const openPythonOutput = useCallback(() => {
    if (!pythonOutputTab) {
      const outputFile: FileData = {
        path: 'python_output',
        content: '',
        language: 'python-output',
        size: 0,
        type: 'file'
      };
      setPythonOutputTab(outputFile);
      setOpenTabs(prev => [...prev, outputFile]);
    }
    setActiveFile(pythonOutputTab);
  }, [pythonOutputTab]);

  const closePythonOutput = useCallback(() => {
    if (pythonOutputTab) {
      setOpenTabs(prev => prev.filter(tab => tab.path !== 'python_output'));
      setPythonOutputTab(null);
      if (activeFile?.path === 'python_output') {
        setActiveFile(openTabs.find(tab => tab.path !== 'python_output') || null);
      }
    }
  }, [pythonOutputTab, activeFile, openTabs]);

  const clearPythonOutput = useCallback(() => {
    setPythonExecutionResult(null);
    pyodideManager.clearExecutionHistory();
  }, []);



  useEffect(() => {
    return () => {
      // Cleanup editor
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
          editorRef.current = null;
        } catch (error) {
          console.warn('Error disposing editor:', error);
        }
      }

      // Mark component as unmounted
      isMountedRef.current = false;

      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);



  const handleEditorDidMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    console.log('🛠️ Editor mounted  ');
    try {
      if (!editor) {
        console.warn('Editor not available in mount handler');
        return;
      }

      editorRef.current = editor;

      // Add Python execution command
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        if (activeFile?.language === 'python') {
          executePythonFile(activeFile.path);
          openPythonOutput();
        }
      });

      // Add command palette action
      editor.addAction({
        id: 'execute-python-file',
        label: 'Execute Python File',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
        contextMenuGroupId: 'python',
        run: () => {
          if (activeFile?.language === 'python') {
            executePythonFile(activeFile.path);
            openPythonOutput();
          }
        }
      });

      // Focus the editor if it has a model
      try {
        if (editor && typeof editor.getModel === 'function') {
          const model = editor.getModel();
          if (model) {
            editor.focus();
          }
        }
      } catch (error) {
        console.warn('Could not focus editor on mount:', error);
      }

    } catch (error) {
      console.error('Error setting up Monaco Editor:', error);
    }
  }, [activeFile, executePythonFile, openPythonOutput]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (activeFile && value !== undefined && value !== activeFile.content) {
      handleContentChange(value);
    }
  }, [activeFile, handleContentChange]);


  const nodes = useMemo((): TreeNode[] => {
    const root: TreeNode = { name: '', path: '', type: 'folder', children: [], isExpanded: true };

    files.forEach(file => {
      const pathParts = file.path.split('/').filter((part: string) => part.length > 0);
      let current = root;

      pathParts.forEach((part: string, index: number) => {
        const isLast = index === pathParts.length - 1;
        const currentPath = pathParts.slice(0, index + 1).join('/');

        if (!current.children) {
          current.children = [];
        }

        let existingNode = current.children.find((child: TreeNode) => child.name === part);

        if (!existingNode) {
          // Determine if this is a file or folder based on the file data
          const isFile = isLast && file.type === 'file';
          existingNode = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'folder',
            children: isFile ? undefined : [],
            isExpanded: true // All folders start expanded
          };
          current.children.push(existingNode);
        }

        current = existingNode;
      });
    });

    return root.children || [];
  }, [files])

  // Debug logging (commented out to prevent infinite rerenders)
  // useEffect(() => {
  //   if (nodesRef.current.filesCount !== files.length) {
  //     console.log(`📁 File tree updated: ${files.length} files`);
  //   }
  //   if (nodesRef.current.openTabs !== openTabs.length) {
  //     console.log(`🗂️ Open tabs changed: ${openTabs.length} tabs`);
  //   }
  //   if (nodesRef.current.activeFile !== activeFile?.path) {
  //     console.log(`📝 Active file changed: ${activeFile?.path || 'none'}`)
  //   }
  //   if (nodesRef.current.isLoading !== isLoading) {
  //     console.log(`⏳ Loading state: ${isLoading ? 'loading' : 'idle'}`)
  //   };

  //   if (nodesRef.current.extensionsLoaded !== extensionsLoaded) {
  //     console.log(`🔌 Extensions loaded: ${extensionsLoaded}`);
  //   }

  //   if (JSON.stringify(nodesRef.current.nodes) !== JSON.stringify(nodes)) {
  //     console.log('🗂️ File tree structure changed');
  //   }

  //   nodesRef.current = {
  //     isLoading,
  //     extensionsLoaded,
  //     activeFile: activeFile?.path,
  //     filesCount: files.length,
  //     openTabs: openTabs.length,
  //     nodes,
  //   };
  // }, [isLoading, extensionsLoaded, activeFile, files, openTabs, nodes]);

  // renderCountRef.current += 1;
  // console.log(`🎨 EmbeddedVSCode render #${renderCountRef.current}`,);

  const options = useMemo(() => getEditorOptions(activeFile?.language), [activeFile]);

  if (isLoading) {
    return (
      <Loading />
    );
  }

  // console.log('🎨 Rendering main editor interface...');
  return (
    <div className="w-full h-full min-h-[600px] bg-[#1e1e1e] text-white flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
      {/* VSCode-like header */}
      <div className="h-8 bg-[#2d2d30] border-b border-[#3e3e42] flex items-center px-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#28ca42]"></div>
        </div>
        <div className="ml-4 text-sm text-gray-300">Monaco Editor - Interview Session</div>
        {loadError && (
          <div className="ml-4 flex items-center space-x-2 text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded">
            <span>⚠️ {loadError}</span>
            {/* <button
              onClick={retryLoad}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Retry
            </button> */}
          </div>
        )}
      </div>

      <div className="flex flex-1">
        {/* File Explorer */}
        <div className="w-64 bg-[#252526] border-r border-[#3e3e42] p-2">
          <div className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Explorer</div>
          <FileTree
            nodes={nodes}
            activeFile={activeFile}
            onFileClick={openFile}
            expandedFolders={expandedFolders}
            onToggleFolder={toggleFolder}
            loadingFolders={loadingFolders}
            loadedFiles={loadedFiles}
            files={files}
          />
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          {openTabs.length > 0 && (
            <div className="h-9 bg-[#2d2d30] border-b border-[#3e3e42] flex">
              {openTabs.map((tab) => (
                <div
                  key={tab.path}
                  className={`flex items-center px-3 py-2 border-r border-[#3e3e42] cursor-pointer text-sm ${activeFile?.path === tab.path
                    ? 'bg-[#1e1e1e] text-white'
                    : 'bg-[#2d2d30] text-gray-400 hover:text-white'
                    }`}
                  onClick={() => setActiveFile(tab)}
                >
                  <span className="mr-2 text-xs">{getFileIcon(tab.path)}</span>
                  <span>{tab.path.split('/').pop()}</span>
                  <button
                    className="ml-2 text-gray-500 hover:text-gray-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Editor */}
          <div className="flex-1">
            {activeFile ? (
              activeFile.path === 'python_output' ? (
                <PythonOutputPanel
                  executionResult={pythonExecutionResult}
                  isExecuting={isExecutingPython}
                  onClear={clearPythonOutput}
                />
              ) : (
                <Editor
                  key={`${activeFile.path}-${activeFile.language}`}
                  height="100%"
                  language={activeFile.language}
                  value={activeFile.content}
                  theme="vs-dark"
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  beforeMount={(monaco) => {
                    // try {
                    //   // Configure Monaco before mounting
                    //   if (monaco && monaco.editor) {
                    //     monaco.editor.setTheme('vs-dark');
                    //   }
                    // } catch (error) {
                    //   console.warn('Could not set Monaco theme:', error);
                    // }
                  }}
                  loading={
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <div>Loading Monaco Editor...</div>
                      </div>
                    </div>
                  }
                  options={options}
                />
              )
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <div>Select a file to start editing</div>
                  {pyodideReady && (
                    <div className="mt-4 text-sm text-green-400">
                      🐍 Python execution ready! Press Ctrl+Enter to run Python files.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#007acc] text-white text-xs flex items-center px-4 justify-between">
        <div className="flex items-center space-x-4">
          <span>Monaco Editor</span>
          {activeFile && (
            <>
              <span>•</span>
              <span>{activeFile.language}</span>
              <span>•</span>
              <span>{activeFile.path}</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {activeFile?.language === 'python' && pyodideReady && (
            <button
              onClick={() => {
                executePythonFile(activeFile.path);
                openPythonOutput();
              }}
              disabled={isExecutingPython}
              className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-xs"
            >
              {isExecutingPython ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <span>🐍</span>
                  <span>Run Python</span>
                </>
              )}
            </button>
          )}
          <span>Session: {sessionId}</span>
        </div>
      </div>
    </div>
  );
};

export default EmbeddedVSCode;