// server/config.js - Configuration for FilmForge AI
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost'
  },
  
  // LLM API configuration
  llm: {
    api: {
      // Which provider to use: 'openai', 'anthropic', or 'localai'
      provider: process.env.LLM_PROVIDER || 'openai',
      
      // API key for the selected provider
      apiKey: process.env.LLM_API_KEY || '',
      
      // Model to use
      model: process.env.LLM_MODEL || 'gpt-4',
      
      // Default parameters
      temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4000'),
      
      // Local LLM endpoint (if using localai)
      endpoint: process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:8080/v1/completions'
    }
  },
  
  // Storage configuration
  storage: {
    // Directory to store projects and assets
    projectsDirectory: process.env.PROJECTS_DIRECTORY || path.join(__dirname, '../data/projects')
  }
};

module.exports = config;
