// server/services/projectManager.js - Service for managing film projects
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

class ProjectManager {
  constructor() {
    // Get project storage directory from config
    this.projectsDir = config.storage.projectsDirectory || path.join(__dirname, '../../data/projects');
    this.ensureDirectoryExists();
  }

  /**
   * Ensure the projects directory exists
   */
  async ensureDirectoryExists() {
    try {
      await fs.access(this.projectsDir);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(this.projectsDir, { recursive: true });
      console.log(`Created projects directory: ${this.projectsDir}`);
    }
  }

  /**
   * Create a new project
   */
  async createProject(title, description, author) {
    const projectId = `proj_${uuidv4().substring(0, 8)}`;
    const timestamp = new Date().toISOString();
    
    const projectData = {
      id: projectId,
      title,
      description,
      author,
      createdAt: timestamp,
      updatedAt: timestamp,
      assets: {},
      metadata: {}
    };

    // Create project directory
    const projectDir = path.join(this.projectsDir, projectId);
    await fs.mkdir(projectDir, { recursive: true });
    
    // Create assets directory
    await fs.mkdir(path.join(projectDir, 'assets'), { recursive: true });
    
    // Save project metadata
    await this.saveProjectData(projectId, projectData);
    
    return projectId;
  }

  /**
   * Get all projects
   */
  async getAllProjects() {
    // Get a list of all project directories
    const directories = await fs.readdir(this.projectsDir);
    
    // Filter out non-directories and load each project's metadata
    const projects = [];
    
    for (const dir of directories) {
      // Skip if not a directory or doesn't start with 'proj_'
      if (!dir.startsWith('proj_')) continue;
      
      try {
        const stats = await fs.stat(path.join(this.projectsDir, dir));
        if (!stats.isDirectory()) continue;
        
        // Load the project metadata
        const projectData = await this.loadProjectData(dir);
        if (projectData) {
          // Only include essential information for the list
          projects.push({
            id: projectData.id,
            title: projectData.title,
            description: projectData.description,
            author: projectData.author,
            createdAt: projectData.createdAt,
            updatedAt: projectData.updatedAt
          });
        }
      } catch (error) {
        console.error(`Error loading project ${dir}:`, error);
      }
    }
    
    // Sort by creation date (newest first)
    return projects.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  /**
   * Get a specific project by ID
   */
  async getProject(projectId) {
    try {
      return await this.loadProjectData(projectId);
    } catch (error) {
      console.error(`Error loading project ${projectId}:`, error);
      return null;
    }
  }

  /**
   * Update a project
   */
  async updateProject(projectId, updates) {
    try {
      // Load current project data
      const projectData = await this.loadProjectData(projectId);
      
      if (!projectData) {
        return false;
      }
      
      // Apply updates
      Object.assign(projectData, updates, {
        updatedAt: new Date().toISOString()
      });
      
      // Save updated project data
      await this.saveProjectData(projectId, projectData);
      
      return true;
    } catch (error) {
      console.error(`Error updating project ${projectId}:`, error);
      return false;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId) {
    try {
      const projectDir = path.join(this.projectsDir, projectId);
      
      // Check if project exists
      try {
        await fs.access(projectDir);
      } catch (error) {
        return false;
      }
      
      // Delete project directory recursively
      await fs.rm(projectDir, { recursive: true, force: true });
      
      return true;
    } catch (error) {
      console.error(`Error deleting project ${projectId}:`, error);
      return false;
    }
  }

  /**
   * Add an asset to a project
   */
  async addAsset(projectId, assetType, assetData, metadata = {}) {
    try {
      // Load project data
      const projectData = await this.loadProjectData(projectId);
      
      if (!projectData) {
        return null;
      }
      
      // Create asset ID
      const assetId = `asset_${uuidv4().substring(0, 8)}`;
      const timestamp = new Date().toISOString();
      
      // Initialize asset type collection if it doesn't exist
      if (!projectData.assets[assetType]) {
        projectData.assets[assetType] = {};
      }
      
      // Create asset metadata
      const asset = {
        id: assetId,
        type: assetType,
        createdAt: timestamp,
        updatedAt: timestamp,
        metadata: { ...metadata }
      };
      
      // Determine how to store the asset based on type and size
      if (typeof assetData === 'string' && assetData.length < 10000) {
        // Small string data can be stored directly in the project metadata
        asset.data = assetData;
      } else {
        // Larger data gets stored in a separate file
        const assetFilename = `${assetId}.json`;
        const assetPath = path.join(this.projectsDir, projectId, 'assets', assetFilename);
        
        await fs.writeFile(assetPath, JSON.stringify(assetData, null, 2));
        asset.dataFile = assetFilename;
      }
      
      // Add asset to project
      projectData.assets[assetType][assetId] = asset;
      
      // Update project
      projectData.updatedAt = timestamp;
      await this.saveProjectData(projectId, projectData);
      
      return assetId;
    } catch (error) {
      console.error(`Error adding asset to project ${projectId}:`, error);
      return null;
    }
  }

  /**
   * Get assets for a project
   */
  async getAssets(projectId, assetType = null) {
    try {
      // Load project data
      const projectData = await this.loadProjectData(projectId);
      
      if (!projectData) {
        return null;
      }
      
      // If assetType is specified, return only those assets
      if (assetType) {
        return projectData.assets[assetType] || {};
      }
      
      // Otherwise return all assets
      return projectData.assets;
    } catch (error) {
      console.error(`Error getting assets for project ${projectId}:`, error);
      return null;
    }
  }

  /**
   * Get a specific asset
   */
  async getAsset(projectId, assetId) {
    try {
      // Load project data
      const projectData = await this.loadProjectData(projectId);
      
      if (!projectData) {
        return null;
      }
      
      // Find the asset
      let asset = null;
      for (const type in projectData.assets) {
        if (projectData.assets[type][assetId]) {
          asset = projectData.assets[type][assetId];
          break;
        }
      }
      
      if (!asset) {
        return null;
      }
      
      // If asset data is stored in a separate file, load it
      if (asset.dataFile) {
        const assetPath = path.join(this.projectsDir, projectId, 'assets', asset.dataFile);
        const assetData = JSON.parse(await fs.readFile(assetPath, 'utf8'));
        
        // Create a copy of the asset with the loaded data
        return {
          ...asset,
          data: assetData
        };
      }
      
      // Data is already in the asset object
      return asset;
    } catch (error) {
      console.error(`Error getting asset ${assetId} from project ${projectId}:`, error);
      return null;
    }
  }

  /**
   * Update an asset
   */
  async updateAsset(projectId, assetId, assetData, metadata = {}) {
    try {
      // Load project data
      const projectData = await this.loadProjectData(projectId);
      
      if (!projectData) {
        return false;
      }
      
      // Find the asset
      let asset = null;
      let assetType = null;
      
      for (const type in projectData.assets) {
        if (projectData.assets[type][assetId]) {
          asset = projectData.assets[type][assetId];
          assetType = type;
          break;
        }
      }
      
      if (!asset) {
        return false;
      }
      
      // Update metadata
      asset.metadata = { ...asset.metadata, ...metadata };
      asset.updatedAt = new Date().toISOString();
      
      // Update data
      if (asset.dataFile) {
        // Save to separate file
        const assetPath = path.join(this.projectsDir, projectId, 'assets', asset.dataFile);
        await fs.writeFile(assetPath, JSON.stringify(assetData, null, 2));
      } else if (typeof assetData === 'string' && assetData.length < 10000) {
        // Small string data can stay in the project metadata
        asset.data = assetData;
      } else {
        // Data is now too large, move to a separate file
        const assetFilename = `${assetId}.json`;
        const assetPath = path.join(this.projectsDir, projectId, 'assets', assetFilename);
        
        await fs.writeFile(assetPath, JSON.stringify(assetData, null, 2));
        asset.dataFile = assetFilename;
        delete asset.data;
      }
      
      // Update project
      projectData.updatedAt = new Date().toISOString();
      await this.saveProjectData(projectId, projectData);
      
      return true;
    } catch (error) {
      console.error(`Error updating asset ${assetId} in project ${projectId}:`, error);
      return false;
    }
  }

  /**
   * Delete an asset
   */
  async deleteAsset(projectId, assetId) {
    try {
      // Load project data
      const projectData = await this.loadProjectData(projectId);
      
      if (!projectData) {
        return false;
      }
      
      // Find the asset
      let asset = null;
      let assetType = null;
      
      for (const type in projectData.assets) {
        if (projectData.assets[type][assetId]) {
          asset = projectData.assets[type][assetId];
          assetType = type;
          break;
        }
      }
      
      if (!asset) {
        return false;
      }
      
      // If asset data is stored in a separate file, delete it
      if (asset.dataFile) {
        const assetPath = path.join(this.projectsDir, projectId, 'assets', asset.dataFile);
        try {
          await fs.unlink(assetPath);
        } catch (error) {
          console.error(`Error deleting asset file ${assetPath}:`, error);
          // Continue even if file deletion fails
        }
      }
      
      // Remove asset from project
      delete projectData.assets[assetType][assetId];
      
      // Update project
      projectData.updatedAt = new Date().toISOString();
      await this.saveProjectData(projectId, projectData);
      
      return true;
    } catch (error) {
      console.error(`Error deleting asset ${assetId} from project ${projectId}:`, error);
      return false;
    }
  }

  /**
   * Save project data to the filesystem
   */
  async saveProjectData(projectId, projectData) {
    const projectPath = path.join(this.projectsDir, projectId, 'project.json');
    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));
  }

  /**
   * Load project data from the filesystem
   */
  async loadProjectData(projectId) {
    const projectPath = path.join(this.projectsDir, projectId, 'project.json');
    
    try {
      const data = await fs.readFile(projectPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist
        return null;
      }
      throw error;
    }
  }
}

module.exports = ProjectManager;
