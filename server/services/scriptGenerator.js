// server/services/scriptGenerator.js - Service for generating scripts using LLM
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config');

class ScriptGenerator {
  constructor() {
    // Load configuration from config file
    this.apiConfig = config.llm.api;
    this.promptTemplates = this._loadPromptTemplates();
  }

  /**
   * Load prompt templates from files
   */
  _loadPromptTemplates() {
    const templatesDir = path.join(__dirname, '../prompts');
    return {
      concept: fs.readFileSync(path.join(templatesDir, 'concept.prompt'), 'utf8'),
      screenplay: fs.readFileSync(path.join(templatesDir, 'screenplay.prompt'), 'utf8'),
      scene: fs.readFileSync(path.join(templatesDir, 'scene.prompt'), 'utf8'),
      analysis: fs.readFileSync(path.join(templatesDir, 'analysis.prompt'), 'utf8')
    };
  }

  /**
   * Call the LLM API with a prompt
   */
  async _callLLM(prompt, options = {}) {
    // Check which LLM provider to use based on config
    switch (this.apiConfig.provider) {
      case 'openai':
        return this._callOpenAI(prompt, options);
      case 'anthropic':
        return this._callAnthropic(prompt, options);
      case 'localai':
        return this._callLocalAI(prompt, options);
      default:
        throw new Error(`Unsupported LLM provider: ${this.apiConfig.provider}`);
    }
  }

  /**
   * Call OpenAI API
   */
  async _callOpenAI(prompt, options = {}) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: options.model || this.apiConfig.model || 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || this.apiConfig.temperature || 0.7,
          max_tokens: options.maxTokens || this.apiConfig.maxTokens || 4000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiConfig.apiKey}`
          }
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API call failed:', error.response?.data || error.message);
      throw new Error(`OpenAI API call failed: ${error.message}`);
    }
  }

  /**
   * Call Anthropic API
   */
  async _callAnthropic(prompt, options = {}) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: options.model || this.apiConfig.model || 'claude-3-opus-20240229',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens || this.apiConfig.maxTokens || 4000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiConfig.apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('Anthropic API call failed:', error.response?.data || error.message);
      throw new Error(`Anthropic API call failed: ${error.message}`);
    }
  }

  /**
   * Call local LLM API
   */
  async _callLocalAI(prompt, options = {}) {
    try {
      const response = await axios.post(
        this.apiConfig.endpoint,
        {
          prompt: prompt,
          max_tokens: options.maxTokens || this.apiConfig.maxTokens || 4000,
          temperature: options.temperature || this.apiConfig.temperature || 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error('Local AI call failed:', error.response?.data || error.message);
      throw new Error(`Local AI call failed: ${error.message}`);
    }
  }

  /**
   * Build a concept generation prompt
   */
  _buildConceptPrompt(premise, options = {}) {
    let prompt = this.promptTemplates.concept;
    
    // Replace placeholders in the template
    prompt = prompt.replace('{{PREMISE}}', premise);
    prompt = prompt.replace('{{GENRE}}', options.genre || 'Not specified');
    prompt = prompt.replace('{{THEMES}}', Array.isArray(options.themes) 
      ? options.themes.join(', ') 
      : (options.themes || 'Not specified'));
    prompt = prompt.replace('{{LENGTH}}', options.length || 'Feature film (approximately 90-120 minutes)');
    
    return prompt;
  }

  /**
   * Build a screenplay generation prompt
   */
  _buildScreenplayPrompt(concept, options = {}) {
    let prompt = this.promptTemplates.screenplay;
    
    // Convert concept to string if it's an object
    const conceptStr = typeof concept === 'object' 
      ? JSON.stringify(concept, null, 2) 
      : concept;
    
    // Replace placeholders in the template
    prompt = prompt.replace('{{CONCEPT}}', conceptStr);
    
    // Add character information if available
    if (options.characters && Array.isArray(options.characters)) {
      const charactersStr = options.characters.map(character => {
        return `Character: ${character.name}
Description: ${character.description}
Role: ${character.role}
Traits: ${character.traits || 'Not specified'}
`;
      }).join('\n');
      
      prompt = prompt.replace('{{CHARACTERS}}', charactersStr);
    } else {
      prompt = prompt.replace('{{CHARACTERS}}', 'Develop characters based on the concept.');
    }
    
    // Add structure preference if available
    prompt = prompt.replace('{{STRUCTURE}}', options.structure || 'Standard three-act structure');
    
    return prompt;
  }

  /**
   * Build a scene generation prompt
   */
  _buildScenePrompt(sceneDescription, characters, context) {
    let prompt = this.promptTemplates.scene;
    
    // Replace placeholders in the template
    prompt = prompt.replace('{{SCENE_DESCRIPTION}}', sceneDescription);
    
    // Add character information
    if (characters && Array.isArray(characters)) {
      const charactersStr = characters.map(character => {
        return `Character: ${character.name}
Description: ${character.description}
Traits: ${character.traits || 'Not specified'}
`;
      }).join('\n');
      
      prompt = prompt.replace('{{CHARACTERS}}', charactersStr);
    } else {
      prompt = prompt.replace('{{CHARACTERS}}', 'No specific character details provided.');
    }
    
    // Add context information
    if (context) {
      const contextStr = typeof context === 'object' 
        ? JSON.stringify(context, null, 2) 
        : context;
      
      prompt = prompt.replace('{{CONTEXT}}', contextStr);
    } else {
      prompt = prompt.replace('{{CONTEXT}}', 'No specific context provided.');
    }
    
    return prompt;
  }

  /**
   * Generate an expanded concept from a premise
   */
  async generateConcept(premise, options = {}) {
    const prompt = this._buildConceptPrompt(premise, options);
    
    const response = await this._callLLM(prompt, {
      temperature: 0.7,  // More creative
      maxTokens: 2000
    });
    
    // Parse the response - in a real implementation, we might do more sophisticated parsing
    try {
      // Check if the response is already in JSON format
      return JSON.parse(response);
    } catch (e) {
      // If not JSON, return as structured text
      return {
        premise,
        expanded: response,
        genre: options.genre,
        themes: options.themes,
        length: options.length
      };
    }
  }

  /**
   * Generate a screenplay from a concept
   */
  async generateScreenplay(concept, options = {}) {
    const prompt = this._buildScreenplayPrompt(concept, options);
    
    const response = await this._callLLM(prompt, {
      temperature: 0.5,  // Less random for structure
      maxTokens: 8000    // Screenplays are long
    });
    
    return response;
  }

  /**
   * Generate a scene from a description
   */
  async generateScene(sceneDescription, characters, context) {
    const prompt = this._buildScenePrompt(sceneDescription, characters, context);
    
    const response = await this._callLLM(prompt, {
      temperature: 0.6,
      maxTokens: 2000
    });
    
    return response;
  }

  /**
   * Analyze a screenplay for structure, pacing, etc.
   */
  async analyzeScreenplay(screenplay) {
    let prompt = this.promptTemplates.analysis;
    prompt = prompt.replace('{{SCREENPLAY}}', screenplay);
    
    const response = await this._callLLM(prompt, {
      temperature: 0.2,  // More analytical/less creative
      maxTokens: 3000
    });
    
    try {
      // Try to parse as JSON
      return JSON.parse(response);
    } catch (e) {
      // If not JSON, return as text
      return { 
        analysis: response 
      };
    }
  }
}

module.exports = ScriptGenerator;
