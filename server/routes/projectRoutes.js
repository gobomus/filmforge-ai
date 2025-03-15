// server/routes/projectRoutes.js - Routes for project management
const express = require('express');
const router = express.Router();
const ProjectManager = require('../services/projectManager');

// Initialize project manager
const projectManager = new ProjectManager();

/**
 * Create a new project
 * 
 * Request body:
 * {
 *   title: string,
 *   description: string,
 *   author: string
 * }
 */
router.post('/create', async (req, res) => {
  try {
    const { title, description, author } = req.body;
    
    // Validate input
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Create project
    const projectId = await projectManager.createProject(title, description, author);
    
    res.json({ success: true, projectId });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project', details: error.message });
  }
});

/**
 * Get all projects
 */
router.get('/', async (req, res) => {
  try {
    const projects = await projectManager.getAllProjects();
    res.json({ success: true, projects });
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: 'Failed to get projects', details: error.message });
  }
});

/**
 * Get a specific project by ID
 */
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await projectManager.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Failed to get project', details: error.message });
  }
});

/**
 * Update a project
 */
router.put('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;
    
    const success = await projectManager.updateProject(projectId, updates);
    
    if (!success) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project', details: error.message });
  }
});

/**
 * Delete a project
 */
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const success = await projectManager.deleteProject(projectId);
    
    if (!success) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project', details: error.message });
  }
});

/**
 * Add an asset to a project
 */
router.post('/:projectId/assets', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { assetType, assetData, metadata } = req.body;
    
    // Validate input
    if (!assetType || !assetData) {
      return res.status(400).json({ error: 'Asset type and data are required' });
    }
    
    const assetId = await projectManager.addAsset(projectId, assetType, assetData, metadata);
    
    if (!assetId) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ success: true, assetId });
  } catch (error) {
    console.error('Error adding asset:', error);
    res.status(500).json({ error: 'Failed to add asset', details: error.message });
  }
});

/**
 * Get assets for a project
 */
router.get('/:projectId/assets', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { assetType } = req.query;
    
    const assets = await projectManager.getAssets(projectId, assetType);
    
    if (!assets) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ success: true, assets });
  } catch (error) {
    console.error('Error getting assets:', error);
    res.status(500).json({ error: 'Failed to get assets', details: error.message });
  }
});

/**
 * Get a specific asset
 */
router.get('/:projectId/assets/:assetId', async (req, res) => {
  try {
    const { projectId, assetId } = req.params;
    
    const asset = await projectManager.getAsset(projectId, assetId);
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json({ success: true, asset });
  } catch (error) {
    console.error('Error getting asset:', error);
    res.status(500).json({ error: 'Failed to get asset', details: error.message });
  }
});

module.exports = router;
