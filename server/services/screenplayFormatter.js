// server/services/screenplayFormatter.js - Service for formatting screenplays
class ScreenplayFormatter {
  constructor() {
    // Regular expressions for identifying screenplay elements
    this.regex = {
      sceneHeading: /^(INT|EXT|INT\/EXT|EXT\/INT)[\s\.]+(.*?)[\s\.-]+(DAY|NIGHT|MORNING|EVENING|DUSK|DAWN|CONTINUOUS|LATER|SAME TIME|MOMENTS LATER)$/i,
      character: /^[A-Z][A-Z0-9\s\(\)]*$/,
      parenthetical: /^\(.+\)$/,
      dialogue: /^(?!INT|EXT|FADE|CUT)[\w\s,\.'"\-:;\?\!]+$/,
      transition: /^(FADE|CUT|DISSOLVE|SMASH|WIPE|FADE TO BLACK|MATCH CUT|TIME CUT).*$/i
    };
  }

  /**
   * Format a raw screenplay text into properly formatted screenplay
   */
  formatScreenplay(rawScreenplay) {
    // Split the screenplay into lines
    const lines = rawScreenplay.split('\n');
    let formattedLines = [];
    let currentElement = null;
    let lineBuffer = [];
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        if (lineBuffer.length > 0) {
          formattedLines.push(this._formatElement(currentElement, lineBuffer.join(' ')));
          lineBuffer = [];
          currentElement = null;
        }
        formattedLines.push('');
        continue;
      }
      
      // Detect the type of line
      const elementType = this._detectElementType(line);
      
      // If this is a new element type or we're switching types
      if (elementType !== currentElement) {
        // Format and add the previous element if we have one
        if (lineBuffer.length > 0) {
          formattedLines.push(this._formatElement(currentElement, lineBuffer.join(' ')));
          lineBuffer = [];
        }
        
        currentElement = elementType;
      }
      
      // Add the current line to the buffer
      lineBuffer.push(line);
    }
    
    // Don't forget to process the last element
    if (lineBuffer.length > 0) {
      formattedLines.push(this._formatElement(currentElement, lineBuffer.join(' ')));
    }
    
    // Return the formatted screenplay
    return formattedLines.join('\n');
  }

  /**
   * Format a single scene
   */
  formatScene(rawScene) {
    // We can use the same formatter as for the whole screenplay
    return this.formatScreenplay(rawScene);
  }

  /**
   * Detect the type of element a line represents
   */
  _detectElementType(line) {
    if (this.regex.sceneHeading.test(line)) {
      return 'scene_heading';
    } else if (this.regex.character.test(line) && line.length < 50) {
      return 'character';
    } else if (this.regex.parenthetical.test(line)) {
      return 'parenthetical';
    } else if (this.regex.transition.test(line)) {
      return 'transition';
    } else if (line === line.toUpperCase() && line.length > 3) {
      // Could be a transition or technical direction
      return 'technical';
    } else {
      // Default to either dialogue or action
      return 'action';
    }
  }

  /**
   * Format an element based on its type
   */
  _formatElement(type, text) {
    switch (type) {
      case 'scene_heading':
        return this._formatSceneHeading(text);
      case 'character':
        return this._formatCharacter(text);
      case 'parenthetical':
        return this._formatParenthetical(text);
      case 'dialogue':
        return this._formatDialogue(text);
      case 'transition':
        return this._formatTransition(text);
      case 'technical':
        return this._formatTechnical(text);
      case 'action':
      default:
        return this._formatAction(text);
    }
  }

  /**
   * Format a scene heading
   */
  _formatSceneHeading(text) {
    // Scene headings are uppercase
    return text.toUpperCase();
  }

  /**
   * Format a character name
   */
  _formatCharacter(text) {
    // Character names are uppercase and indented
    return text.toUpperCase();
  }

  /**
   * Format a parenthetical direction
   */
  _formatParenthetical(text) {
    // Ensure it has parentheses
    if (!text.startsWith('(')) {
      text = '(' + text;
    }
    if (!text.endsWith(')')) {
      text = text + ')';
    }
    return text;
  }

  /**
   * Format dialogue
   */
  _formatDialogue(text) {
    // Dialogue is plain text, but we need to wrap long lines
    return this._wrapText(text, 35);
  }

  /**
   * Format a transition
   */
  _formatTransition(text) {
    // Transitions are uppercase and right-aligned
    return text.toUpperCase();
  }

  /**
   * Format a technical direction
   */
  _formatTechnical(text) {
    // Technical directions are uppercase and centered
    return text.toUpperCase();
  }

  /**
   * Format action description
   */
  _formatAction(text) {
    // Action is plain text, wrap long lines
    return this._wrapText(text, 60);
  }

  /**
   * Wrap text to a specified width
   */
  _wrapText(text, width) {
    if (text.length <= width) {
      return text;
    }
    
    const words = text.split(' ');
    let result = '';
    let line = '';
    
    for (const word of words) {
      if ((line + word).length > width) {
        result += line.trim() + '\n';
        line = word + ' ';
      } else {
        line += word + ' ';
      }
    }
    
    result += line.trim();
    return result;
  }

  /**
   * Validate screenplay format
   */
  validateFormat(screenplay) {
    // Split into lines for analysis
    const lines = screenplay.split('\n');
    let issues = [];
    
    // Placeholder for a more detailed validator
    // In a real implementation, this would check for proper formatting,
    // scene heading consistency, character name consistency, etc.
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Fix common formatting issues
   */
  fixFormatIssues(screenplay, issues) {
    // Placeholder for a format fixer
    // In a real implementation, this would automatically correct common issues
    
    return screenplay;
  }
}

module.exports = ScreenplayFormatter;
