import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base paths for dual-mode support
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || path.join(__dirname, '..', 'workspace');
const CONTAINER_ROOT = process.env.CONTAINER_ROOT || '/';

/**
 * Validate and sanitize file path to prevent path traversal attacks
 * @param {string} inputPath - User-provided path
 * @param {string} baseDir - Base directory to restrict access
 * @returns {string} Sanitized absolute path
 * @throws {Error} If path is invalid or attempts traversal
 */
const sanitizePath = (inputPath, baseDir) => {
  if (!inputPath) {
    throw new Error('Path is required');
  }

  // Resolve the absolute path
  const resolvedPath = path.resolve(baseDir, inputPath);

  // Ensure the resolved path is within the base directory
  if (!resolvedPath.startsWith(baseDir)) {
    throw new Error('Invalid path: Path traversal detected');
  }

  return resolvedPath;
};

/**
 * Determine base directory based on path prefix
 * @param {string} inputPath - User-provided path
 * @returns {Object} Object containing baseDir and relativePath
 */
const getBasePath = (inputPath) => {
  if (inputPath.startsWith('/workspace/')) {
    return {
      baseDir: WORKSPACE_ROOT,
      relativePath: inputPath.substring('/workspace/'.length)
    };
  } else if (inputPath.startsWith('/workspace')) {
    return {
      baseDir: WORKSPACE_ROOT,
      relativePath: inputPath.substring('/workspace'.length) || '.'
    };
  } else {
    return {
      baseDir: CONTAINER_ROOT,
      relativePath: inputPath
    };
  }
};

/**
 * Check if path exists and get stats
 * @param {string} filePath - File path
 * @returns {Object|null} Stats object or null if doesn't exist
 */
const getPathStats = async (filePath) => {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

/**
 * GET /api/files?path=...
 * List files and directories at the specified path
 */
router.get('/', async (req, res) => {
  try {
    const { path: requestedPath = '.' } = req.query;

    // Determine base directory and get sanitized path
    const { baseDir, relativePath } = getBasePath(requestedPath);
    const fullPath = sanitizePath(relativePath, baseDir);

    // Check if path exists
    const stats = await getPathStats(fullPath);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Path not found'
      });
    }

    // If it's a file, return file info
    if (stats.isFile()) {
      return res.json({
        success: true,
        data: {
          type: 'file',
          name: path.basename(fullPath),
          path: requestedPath,
          size: stats.size,
          modified: stats.mtime,
          created: stats.birthtime
        }
      });
    }

    // If it's a directory, list contents
    if (stats.isDirectory()) {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });

      const items = await Promise.all(
        entries.map(async (entry) => {
          const entryPath = path.join(fullPath, entry.name);
          const entryStats = await fs.stat(entryPath);

          return {
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: entryStats.size,
            modified: entryStats.mtime,
            created: entryStats.birthtime
          };
        })
      );

      return res.json({
        success: true,
        data: {
          type: 'directory',
          path: requestedPath,
          items
        }
      });
    }

    // Unknown type
    return res.status(400).json({
      success: false,
      error: 'Path is neither a file nor a directory'
    });

  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list files'
    });
  }
});

/**
 * GET /api/files/read?path=...
 * Read file content
 */
router.get('/read', async (req, res) => {
  try {
    const { path: requestedPath } = req.query;

    if (!requestedPath) {
      return res.status(400).json({
        success: false,
        error: 'Path parameter is required'
      });
    }

    // Determine base directory and get sanitized path
    const { baseDir, relativePath } = getBasePath(requestedPath);
    const fullPath = sanitizePath(relativePath, baseDir);

    // Check if file exists and is a file
    const stats = await getPathStats(fullPath);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    if (!stats.isFile()) {
      return res.status(400).json({
        success: false,
        error: 'Path is not a file'
      });
    }

    // Read file content
    const content = await fs.readFile(fullPath, 'utf-8');

    res.json({
      success: true,
      data: {
        path: requestedPath,
        content,
        size: stats.size,
        modified: stats.mtime
      }
    });

  } catch (error) {
    console.error('Error reading file:', error);

    // Handle encoding errors (binary files)
    if (error.code === 'ERR_INVALID_ARG_TYPE' || error.message.includes('invalid')) {
      return res.status(400).json({
        success: false,
        error: 'File appears to be binary and cannot be read as text'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to read file'
    });
  }
});

/**
 * POST /api/files
 * Create new file or directory
 * Body: { path: string, content?: string, type: 'file'|'directory' }
 */
router.post('/', async (req, res) => {
  try {
    const { path: requestedPath, content = '', type = 'file' } = req.body;

    if (!requestedPath) {
      return res.status(400).json({
        success: false,
        error: 'Path is required'
      });
    }

    // Determine base directory and get sanitized path
    const { baseDir, relativePath } = getBasePath(requestedPath);
    const fullPath = sanitizePath(relativePath, baseDir);

    // Check if already exists
    const stats = await getPathStats(fullPath);

    if (stats) {
      return res.status(409).json({
        success: false,
        error: 'Path already exists'
      });
    }

    // Create parent directories if they don't exist
    const parentDir = path.dirname(fullPath);
    await fs.mkdir(parentDir, { recursive: true });

    // Create file or directory
    if (type === 'directory') {
      await fs.mkdir(fullPath, { recursive: true });

      res.status(201).json({
        success: true,
        data: {
          path: requestedPath,
          type: 'directory',
          message: 'Directory created successfully'
        }
      });
    } else {
      await fs.writeFile(fullPath, content, 'utf-8');

      const newStats = await fs.stat(fullPath);

      res.status(201).json({
        success: true,
        data: {
          path: requestedPath,
          type: 'file',
          size: newStats.size,
          message: 'File created successfully'
        }
      });
    }

  } catch (error) {
    console.error('Error creating file/directory:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create file/directory'
    });
  }
});

/**
 * PUT /api/files
 * Update file content
 * Body: { path: string, content: string }
 */
router.put('/', async (req, res) => {
  try {
    const { path: requestedPath, content } = req.body;

    if (!requestedPath) {
      return res.status(400).json({
        success: false,
        error: 'Path is required'
      });
    }

    if (content === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }

    // Determine base directory and get sanitized path
    const { baseDir, relativePath } = getBasePath(requestedPath);
    const fullPath = sanitizePath(relativePath, baseDir);

    // Check if file exists
    const stats = await getPathStats(fullPath);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    if (!stats.isFile()) {
      return res.status(400).json({
        success: false,
        error: 'Path is not a file'
      });
    }

    // Update file content
    await fs.writeFile(fullPath, content, 'utf-8');

    const newStats = await fs.stat(fullPath);

    res.json({
      success: true,
      data: {
        path: requestedPath,
        size: newStats.size,
        modified: newStats.mtime,
        message: 'File updated successfully'
      }
    });

  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update file'
    });
  }
});

/**
 * DELETE /api/files?path=...
 * Delete file or directory
 */
router.delete('/', async (req, res) => {
  try {
    const { path: requestedPath, recursive = false } = req.query;

    if (!requestedPath) {
      return res.status(400).json({
        success: false,
        error: 'Path parameter is required'
      });
    }

    // Determine base directory and get sanitized path
    const { baseDir, relativePath } = getBasePath(requestedPath);
    const fullPath = sanitizePath(relativePath, baseDir);

    // Check if exists
    const stats = await getPathStats(fullPath);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Path not found'
      });
    }

    // Delete file or directory
    if (stats.isFile()) {
      await fs.unlink(fullPath);

      res.json({
        success: true,
        data: {
          path: requestedPath,
          type: 'file',
          message: 'File deleted successfully'
        }
      });
    } else if (stats.isDirectory()) {
      // Check if recursive flag is set for directories
      const shouldRecurse = recursive === 'true' || recursive === true;

      if (!shouldRecurse) {
        // Try to delete empty directory
        try {
          await fs.rmdir(fullPath);
        } catch (error) {
          if (error.code === 'ENOTEMPTY') {
            return res.status(400).json({
              success: false,
              error: 'Directory is not empty. Use recursive=true to delete non-empty directories'
            });
          }
          throw error;
        }
      } else {
        // Delete directory recursively
        await fs.rm(fullPath, { recursive: true, force: true });
      }

      res.json({
        success: true,
        data: {
          path: requestedPath,
          type: 'directory',
          message: 'Directory deleted successfully'
        }
      });
    }

  } catch (error) {
    console.error('Error deleting file/directory:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete file/directory'
    });
  }
});

export default router;
