import React, { useState, useEffect, useRef } from 'react';
import Window from './Window';
import api from '../../services/api';
import './FileExplorer.css';

const FileExplorer = ({
  id,
  title = 'Files',
  initialPath = '/workspace',
  mode: initialMode = 'workspace',
  ...props
}) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(initialMode);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [creatingItem, setCreatingItem] = useState(null);
  const contextMenuRef = useRef(null);

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadFiles = async (path) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/files?path=${encodeURIComponent(path)}`);
      setFiles(response.data.files || []);
    } catch (err) {
      setError('Failed to load files');
      console.error('Error loading files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModeToggle = () => {
    const newMode = mode === 'workspace' ? 'container' : 'workspace';
    setMode(newMode);
    const newPath = newMode === 'workspace' ? '/workspace' : '/';
    setCurrentPath(newPath);
  };

  const navigateToPath = (path) => {
    setCurrentPath(path);
    setContextMenu(null);
  };

  const handleBreadcrumbClick = (index) => {
    const parts = currentPath.split('/').filter(Boolean);
    const newPath = index === -1 ? '/' : '/' + parts.slice(0, index + 1).join('/');
    navigateToPath(newPath);
  };

  const handleFileDoubleClick = (file) => {
    if (file.type === 'directory') {
      navigateToPath(file.path);
    } else {
      console.log('Open file:', file.path);
    }
  };

  const handleContextMenu = (event, file) => {
    event.preventDefault();
    setSelectedFile(file);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      file
    });
  };

  const handleCreateItem = async (type) => {
    setCreatingItem({ type, name: '' });
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    const name = event.target.elements.name.value.trim();
    if (!name) return;

    try {
      const newPath = currentPath.endsWith('/')
        ? currentPath + name
        : currentPath + '/' + name;

      await api.post('/api/files', {
        path: newPath,
        type: creatingItem.type
      });

      setCreatingItem(null);
      loadFiles(currentPath);
    } catch (err) {
      console.error('Error creating item:', err);
      alert('Failed to create ' + creatingItem.type);
    }
  };

  const handleRename = async () => {
    const newName = prompt('Enter new name:', selectedFile.name);
    if (!newName || newName === selectedFile.name) {
      setContextMenu(null);
      return;
    }

    try {
      const newPath = selectedFile.path.replace(
        new RegExp(selectedFile.name + '$'),
        newName
      );

      await api.put('/api/files', {
        oldPath: selectedFile.path,
        newPath
      });

      loadFiles(currentPath);
    } catch (err) {
      console.error('Error renaming file:', err);
      alert('Failed to rename file');
    }
    setContextMenu(null);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${selectedFile.name}"?`)) {
      setContextMenu(null);
      return;
    }

    try {
      await api.delete(`/api/files?path=${encodeURIComponent(selectedFile.path)}`);
      loadFiles(currentPath);
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete file');
    }
    setContextMenu(null);
  };

  const handleDownload = () => {
    window.open(`/api/files/download?path=${encodeURIComponent(selectedFile.path)}`, '_blank');
    setContextMenu(null);
  };

  const getFileIcon = (file) => {
    if (file.type === 'directory') {
      return 'folder';
    }

    const ext = file.name.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
      return 'image';
    }
    if (['txt', 'md', 'log'].includes(ext)) {
      return 'description';
    }
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json'].includes(ext)) {
      return 'code';
    }
    if (['pdf'].includes(ext)) {
      return 'picture_as_pdf';
    }
    if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) {
      return 'folder_zip';
    }

    return 'draft';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);

    return (
      <div className="breadcrumbs">
        <span
          className="breadcrumb-item"
          onClick={() => handleBreadcrumbClick(-1)}
        >
          <span className="material-symbols-outlined">home</span>
        </span>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span className="breadcrumb-separator">/</span>
            <span
              className="breadcrumb-item"
              onClick={() => handleBreadcrumbClick(index)}
            >
              {part}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <Window id={id} title={title} {...props}>
      <div className="file-explorer">
        <div className="file-explorer-toolbar">
          <div className="toolbar-left">
            <div className="mode-switcher">
              <button
                className={`mode-button ${mode === 'workspace' ? 'active' : ''}`}
                onClick={handleModeToggle}
                title="Switch to workspace mode"
              >
                <span className="material-symbols-outlined">work</span>
                Workspace
              </button>
              <button
                className={`mode-button ${mode === 'container' ? 'active' : ''}`}
                onClick={handleModeToggle}
                title="Switch to container mode"
              >
                <span className="material-symbols-outlined">dns</span>
                Container
              </button>
            </div>
          </div>

          <div className="toolbar-right">
            <button
              className="toolbar-button"
              onClick={() => handleCreateItem('file')}
              title="New file"
            >
              <span className="material-symbols-outlined">note_add</span>
            </button>
            <button
              className="toolbar-button"
              onClick={() => handleCreateItem('directory')}
              title="New folder"
            >
              <span className="material-symbols-outlined">create_new_folder</span>
            </button>
          </div>
        </div>

        <div className="file-explorer-breadcrumb">
          {renderBreadcrumbs()}
        </div>

        <div className="file-explorer-content">
          {loading && (
            <div className="empty-state">
              <span className="material-symbols-outlined loading-icon">progress_activity</span>
              <p>Loading files...</p>
            </div>
          )}

          {error && (
            <div className="empty-state error-state">
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
              <button onClick={() => loadFiles(currentPath)}>Retry</button>
            </div>
          )}

          {!loading && !error && files.length === 0 && (
            <div className="empty-state">
              <span className="material-symbols-outlined">folder_open</span>
              <p>This folder is empty</p>
            </div>
          )}

          {!loading && !error && files.length > 0 && (
            <table className="file-table">
              <thead>
                <tr>
                  <th className="col-icon"></th>
                  <th className="col-name">Name</th>
                  <th className="col-size">Size</th>
                  <th className="col-modified">Modified</th>
                </tr>
              </thead>
              <tbody>
                {currentPath !== '/' && (
                  <tr
                    className="file-row"
                    onDoubleClick={() => navigateToPath(currentPath.split('/').slice(0, -1).join('/') || '/')}
                  >
                    <td className="col-icon">
                      <span className="material-symbols-outlined">arrow_upward</span>
                    </td>
                    <td className="col-name">..</td>
                    <td className="col-size">-</td>
                    <td className="col-modified">-</td>
                  </tr>
                )}
                {creatingItem && (
                  <tr className="file-row creating">
                    <td className="col-icon">
                      <span className="material-symbols-outlined">
                        {creatingItem.type === 'directory' ? 'folder' : 'draft'}
                      </span>
                    </td>
                    <td className="col-name" colSpan="3">
                      <form onSubmit={handleCreateSubmit}>
                        <input
                          type="text"
                          name="name"
                          placeholder={`New ${creatingItem.type} name`}
                          autoFocus
                          onBlur={() => setCreatingItem(null)}
                        />
                      </form>
                    </td>
                  </tr>
                )}
                {files.map((file) => (
                  <tr
                    key={file.path}
                    className={`file-row ${file.type} ${selectedFile?.path === file.path ? 'selected' : ''}`}
                    onDoubleClick={() => handleFileDoubleClick(file)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                    onClick={() => setSelectedFile(file)}
                  >
                    <td className="col-icon">
                      <span className="material-symbols-outlined">
                        {getFileIcon(file)}
                      </span>
                    </td>
                    <td className="col-name">{file.name}</td>
                    <td className="col-size">{formatFileSize(file.size)}</td>
                    <td className="col-modified">{formatDate(file.modified)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {contextMenu && (
          <div
            ref={contextMenuRef}
            className="context-menu"
            style={{
              top: contextMenu.y,
              left: contextMenu.x
            }}
          >
            <button
              className="context-menu-item"
              onClick={() => handleFileDoubleClick(contextMenu.file)}
            >
              <span className="material-symbols-outlined">open_in_new</span>
              Open
            </button>
            <button
              className="context-menu-item"
              onClick={handleRename}
            >
              <span className="material-symbols-outlined">edit</span>
              Rename
            </button>
            <button
              className="context-menu-item"
              onClick={handleDelete}
            >
              <span className="material-symbols-outlined">delete</span>
              Delete
            </button>
            {contextMenu.file.type !== 'directory' && (
              <button
                className="context-menu-item"
                onClick={handleDownload}
              >
                <span className="material-symbols-outlined">download</span>
                Download
              </button>
            )}
          </div>
        )}
      </div>
    </Window>
  );
};

export default FileExplorer;
