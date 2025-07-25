# Lyrics Display System

## Overview

This is a real-time lyrics display application built with React and Express, designed for live performances or presentations. The system features a control panel for managing lyrics and settings, with dual display outputs: lower third for OBS streaming and fullscreen for TV/second monitor. Real-time synchronization is achieved through WebSocket connections, with local font detection for enhanced typography.

## User Preferences

Preferred communication style: Simple, everyday language.
Control preference: OBS integration via Custom Browser Docks for in-OBS control.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: Custom WebSocket client for live updates

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server using the 'ws' library
- **Storage**: In-memory storage implementation with interface for future database integration
- **Build System**: ESBuild for production bundling

### Database Schema
The application uses a single `sessions` table with the following structure:
- Session management (sessionId, songTitle, lyrics)
- Display settings (fontSize, textColor, textAlign, displayLines)
- Background customization (showBackground, backgroundColor, backgroundOpacity)
- Playback control (currentLine, isPlaying, autoScroll)

## Key Components

### Control Panel (`/control`)
- Lyrics input and editing interface
- Real-time playback controls (play/pause, navigation)
- Display customization settings
- Keyboard shortcuts for efficient control
- Session management capabilities

### Display Views
- **Lower Third (`/display/lower-third`)**: OBS streaming overlay positioned at screen bottom
- **Fullscreen (`/display/fullscreen`)**: TV/second monitor with large centered lyrics
- **Original (`/display`)**: General purpose display (legacy support)
- Real-time synchronization across all display types
- Customizable appearance (fonts, colors, backgrounds)
- Local font detection and selection

### WebSocket System
- Bidirectional communication between control panel and display
- Message types for lyrics updates, position changes, and settings
- Automatic reconnection handling
- Session-based connection management

### Storage Layer
- Abstract storage interface (`IStorage`) for future extensibility
- Current implementation uses in-memory storage (`MemStorage`)
- Designed for easy migration to persistent database storage

## Data Flow

1. **Session Initialization**: Default session created with basic settings
2. **Control Input**: User enters lyrics and adjusts settings in control panel
3. **WebSocket Broadcasting**: Changes broadcast to all connected clients in the session
4. **Display Update**: Display view receives updates and renders accordingly
5. **Real-time Sync**: All connected clients stay synchronized through WebSocket messages

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (PostgreSQL) via `@neondatabase/serverless`
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **UI Components**: Extensive Radix UI component library
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **State Management**: TanStack React Query for server state
- **WebSockets**: Native WebSocket API with 'ws' library on server
- **Form Handling**: React Hook Form with Zod validation

### Development Dependencies
- **Build Tools**: Vite with React plugin and TypeScript support
- **Development**: tsx for running TypeScript in development

## Deployment Strategy

### Development Setup
- Use `npm run dev` to start development server with hot reloading
- TypeScript compilation with strict type checking
- Vite dev server handles both frontend and API proxying

### Production Build
- Frontend built with Vite to `dist/public`
- Backend bundled with ESBuild to `dist/index.js`
- Single production command serves both static files and API

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Drizzle migrations stored in `./migrations` directory
- Configuration for both development and production environments

### Database Management
- Schema defined in `shared/schema.ts` for type sharing
- Migrations managed through Drizzle Kit
- Push-based deployment with `npm run db:push`
