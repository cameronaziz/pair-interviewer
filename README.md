# Pair-Interviewer

A professional SaaS application for conducting technical interviews with real-time recording and LLM analysis.

## Architecture

This is a monorepo containing three packages:
- `packages/server` - Vercel serverless API
- `packages/website` - Next.js web application  
- `packages/extension` - VS Code extension for interview recording

## Development

```bash
# Install all dependencies
npm run install:all

# Start all services in development mode
npm run dev
```

## Features

- Interview template creation with GitHub integration
- VS Code extension for recording interview sessions
- Real-time rrweb recording with chunk-based streaming
- LLM analysis for detecting AI-assisted coding
- Role-based access (interviewer, global admin)
- Free and Pro subscription plans

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Vercel serverless functions
- **Database**: Neon (PostgreSQL)
- **Authentication**: Auth0
- **Storage**: Vercel Blob
- **Recording**: rrweb
- **LLM**: Google Gemini