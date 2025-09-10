'use client';

import { FileData, TreeNode } from '@/types';
import { FC } from 'react';
import { getFileIcon } from './fileIcon';


type FileTreeProps = {
  nodes: TreeNode[];
  activeFile: FileData | null;
  onFileClick: (file: FileData) => void;
  level?: number;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  loadedFiles: Set<string>
  loadingFolders: Set<string>
  files: FileData[]

}

const FileTree: FC<FileTreeProps> = (props) => {
  const { nodes, loadedFiles, loadingFolders, files, activeFile, onFileClick, level = 0, expandedFolders, onToggleFolder } = props
  const isExpanded = (path: string) => expandedFolders.has(path);

  return (
    <div className="space-y-0">
      {nodes.map((node) => {
        const isActive = activeFile?.path === node.path;
        const hasChildren = node.children && node.children.length > 0;
        const expanded = isExpanded(node.path);
        const isLoaded = loadedFiles.has(node.path);
        const isFolderLoading = loadingFolders.has(node.path);

        return (
          <div key={node.path}>
            <div
              className={`flex items-center space-x-1 px-2 py-1 text-sm cursor-pointer rounded hover:bg-[#2a2d2e] ${isActive ? 'bg-[#37373d]' : ''
                }`}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={async () => {
                if (node.type === 'folder') {
                  await onToggleFolder(node.path);
                } else {
                  // Find the file data for this path
                  const fileData = files.find(f => f.path === node.path);
                  if (fileData) {
                    await onFileClick(fileData);
                  }
                }
              }}
            >
              {node.type === 'folder' && (
                <span className="text-xs w-3">
                  {isFolderLoading ? '⏳' : (expanded ? '📂' : '📁')}
                </span>
              )}
              {node.type === 'file' && (
                <span className="text-xs w-3">
                  {getFileIcon(node.path)}
                </span>
              )}
              <span className="text-gray-300 flex-1 truncate">
                {node.name}
                {/* {(isLoading || isFolderLoading) && (
                  <span className="text-xs text-blue-400 ml-1">
                    {isFolderLoading ? '(loading folder...)' : '(loading...)'}
                  </span>
                )} */}
              </span>
            </div>

            {node.type === 'folder' && expanded && hasChildren && (
              <FileTree
                nodes={node.children!}
                activeFile={activeFile}
                onFileClick={onFileClick}
                level={level + 1}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                // loadingFiles={loadingFiles}
                loadedFiles={loadedFiles}
                loadingFolders={loadingFolders}
                files={files}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FileTree;
