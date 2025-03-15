// server/routes/scriptRoutes.js - Routes for script generation and manipulation
const express = require('express');
const router = express.Router();
const ScriptGenerator = require('../services/scriptGenerator');
const ScreenplayFormatter = require('../services/screenplayFormatter');

// Initialize services
const scriptGenerator = new ScriptGenerator();
const screenplayFormatter = new ScreenplayFormatter();

/**
 * Generate a screenplay concept from a premise
 * 
 * Request body:
 * {
 *   premise: string,        // The basic film premise/idea
 *   genre: string,          // Optional genre
 *   themes: array<string>,  // Optional themes to explore
 *   length: string          // Optional target length (short, feature, etc.)
 * }
 */
router.post('/generate-concept', async (req, res) => {
  try {
    const { premise, genre, themes, length } = req.body;
    
    // Validate input
    if (!premise) {
      return res.status(400).json({ error: 'Premise is required' });
    }
    
    // Generate concept
    const concept = await scriptGenerator.generateConcept(premise, { genre, themes, length });
    
    res.json({ success: true, concept });
  } catch (error) {
    console.error('Error generating concept:', error);
    res.status(500).json({ error: 'Failed to generate concept', details: error.message });
  }
});

/**
 * Generate a screenplay from a concept
 * 
 * Request body:
 * {
 *   concept: object,         // The expanded concept
 *   characters: array,       // Optional character details
 *   structure: string        // Optional story structure preference
 * }
 */
router.post('/generate-screenplay', async (req, res) => {
  try {
    const { concept, characters, structure } = req.body;
    
    // Validate input
    if (!concept) {
      return res.status(400).json({ error: 'Concept is required' });
    }
    
    // Generate raw screenplay
    const rawScreenplay = await scriptGenerator.generateScreenplay(concept, { characters, structure });
    
    // Format the screenplay
    const formattedScreenplay = screenplayFormatter.formatScreenplay(rawScreenplay);
    
    res.json({ 
      success: true, 
      screenplay: {
        raw: rawScreenplay,
        formatted: formattedScreenplay
      }
    });
  } catch (error) {
    console.error('Error generating screenplay:', error);
    res.status(500).json({ error: 'Failed to generate screenplay', details: error.message });
  }
});

/**
 * Generate a single scene
 * 
 * Request body:
 * {
 *   sceneDescription: string, // Description of the scene to generate
 *   characters: array,        // Characters in the scene
 *   context: object           // Context from the larger screenplay
 * }
 */
router.post('/generate-scene', async (req, res) => {
  try {
    const { sceneDescription, characters, context } = req.body;
    
    // Validate input
    if (!sceneDescription) {
      return res.status(400).json({ error: 'Scene description is required' });
    }
    
    // Generate scene
    const rawScene = await scriptGenerator.generateScene(sceneDescription, characters, context);
    
    // Format the scene
    const formattedScene = screenplayFormatter.formatScene(rawScene);
    
    res.json({ 
      success: true, 
      scene: {
        raw: rawScene,
        formatted: formattedScene
      }
    });
  } catch (error) {
    console.error('Error generating scene:', error);
    res.status(500).json({ error: 'Failed to generate scene', details: error.message });
  }
});

/**
 * Analyze a screenplay for structure, pacing, etc.
 * 
 * Request body:
 * {
 *   screenplay: string // The screenplay to analyze
 * }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { screenplay } = req.body;
    
    // Validate input
    if (!screenplay) {
      return res.status(400).json({ error: 'Screenplay is required' });
    }
    
    // Analyze screenplay
    const analysis = await scriptGenerator.analyzeScreenplay(screenplay);
    
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Error analyzing screenplay:', error);
    res.status(500).json({ error: 'Failed to analyze screenplay', details: error.message });
  }
});

module.exports = router;
