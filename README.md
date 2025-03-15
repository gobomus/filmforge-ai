# FilmForge AI

A local AI-powered filmmaking suite that generates film concepts, screenplays, and eventually storyboards and visual elements.

## Features

- **Concept Generation**: Create detailed film concepts from simple premises
- **Screenplay Generation**: Generate full screenplays from concepts
- **Scene Generation**: Create individual scenes for existing projects
- **Script Editor**: A dedicated editor for screenplays with industry-standard formatting
- **Project Management**: Organize and manage your film projects

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- API key for an LLM provider (OpenAI, Anthropic, or a local LLM)

### Server Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory (copy from `.env.example`):
   ```
   cp .env.example .env
   ```

4. Edit the `.env` file to add your LLM API key and configure the provider.

5. Create necessary directories:
   ```
   mkdir -p ../data/projects
   ```

6. Start the server:
   ```
   npm run dev
   ```
   The server will run on http://localhost:3001 by default.

### Client Setup

1. Navigate to the client directory:
   ```
   cd ../client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```
   The client will run on http://localhost:3000 and communicate with the backend.

## Using FilmForge AI

1. **Generate a Film Concept**:
   - Click "New Concept" in the header
   - Enter a premise for your film
   - Optionally select genre, themes, and length
   - Click "Generate Concept"
   - Review and save your concept as a new project

2. **Generate a Screenplay**:
   - Open a project with a concept
   - Click "Generate Screenplay" 
   - Wait for the screenplay to be generated
   - Review and edit in the Script Editor

3. **Edit a Screenplay**:
   - Open the Script Editor
   - Use the formatting tools to apply standard screenplay formatting
   - Insert screenplay elements like scene headings, characters, and dialogue
   - Save your work

## Local LLM Integration

For greater privacy and offline use, FilmForge AI supports integration with local LLMs:

1. Set up a local LLM server like [llama.cpp](https://github.com/ggerganov/llama.cpp) or [text-generation-webui](https://github.com/oobabooga/text-generation-webui)

2. In your `.env` file, set the following:
   ```
   LLM_PROVIDER=localai
   LOCAL_LLM_ENDPOINT=http://localhost:8080/v1/completions
   ```

3. Adjust the endpoint URL to match your local LLM server.

## Project Structure

```
filmforge-ai/
├── client/               # React frontend
│   ├── public/
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page components
│       └── services/     # API services
├── server/               # Express backend
│   ├── prompts/          # LLM prompt templates
│   ├── routes/           # API routes
│   └── services/         # Business logic
└── data/                 # Project data storage
    └── projects/         # Individual project folders
```

## Expanding and Customizing

FilmForge AI is designed to be modular and expandable. Here are some areas for future development:

1. **Enhanced Script Analysis**: Add deeper screenplay analysis capabilities
2. **Storyboard Generation**: Implement image generation for storyboards
3. **Character Development**: Add more detailed character generation tools
4. **Visual Style Development**: Generate visual style guides and mood boards
5. **Export Options**: Add more export formats (PDF, Final Draft, etc.)

## Troubleshooting

- **API Key Issues**: Ensure your LLM API key is correctly set in the `.env` file
- **Storage Errors**: Check that the `data/projects` directory exists and is writable
- **Connection Issues**: Verify that both the server and client are running
