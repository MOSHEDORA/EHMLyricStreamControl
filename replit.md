# EHMLyricStreamControl - Real-Time Lyrics Display System

## Overview

EHMLyricStreamControl is a professional lyrics display system designed for live streaming, worship services, concerts, and performances. The system provides dual synchronized display modes - a lower third overlay for OBS streaming and a fullscreen view for TV/projector displays - all controlled from a unified interface with real-time WebSocket synchronization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a modern React-based architecture built with TypeScript for type safety and enhanced developer experience:

- **Framework**: React 18 with TypeScript using Vite as the build tool for fast development and optimized production builds
- **UI Library**: Radix UI components with shadcn/ui styling system for accessible, customizable components
- **Styling**: Tailwind CSS with CSS custom properties for consistent theming and dark/light mode support
- **State Management**: TanStack Query for server state management and caching, React hooks for local component state
- **Routing**: Wouter for lightweight client-side routing with minimal bundle impact
- **Real-time Communication**: Custom WebSocket client implementation for bidirectional communication with automatic reconnection

### Backend Architecture
The server is built on Node.js with Express, emphasizing real-time capabilities and type-safe database operations:

- **Runtime**: Node.js with Express.js framework for HTTP API endpoints and static file serving
- **Database**: PostgreSQL with Drizzle ORM providing type-safe database operations and schema management
- **Real-time Communication**: WebSocket server using the 'ws' library for instant synchronization across all connected displays
- **Session Management**: In-memory storage with interface abstraction for easy database migration
- **Build System**: ESBuild for production bundling with tree-shaking and code splitting

### Display Architecture
The system implements multiple specialized display components for different use cases:

- **Lower Third Display** (`/display/lower-third`): Optimized for OBS streaming overlays, positioned at screen bottom with configurable styling
- **Fullscreen Display** (`/display/fullscreen`): Large-format display for TVs and projectors with 1.5x scaled fonts and progress indicators
- **OBS Dock** (`/obs-dock`): Compact control interface designed to integrate directly within OBS Studio's custom dock system
- **Control Panel** (`/control`): Full-featured management interface with lyrics editing, playback controls, and appearance customization

### Database Schema Design
The application uses a single `sessions` table with comprehensive settings management:

- **Session Management**: Stores session ID, song title, lyrics content, and playback state
- **Display Configuration**: Font settings (family, size, color, alignment) with local font detection support
- **Background Customization**: Optional background overlays with color and opacity controls
- **Separate Display Settings**: Independent configuration for lower third and fullscreen displays when needed
- **Playback Control**: Current line tracking, play/pause state, and auto-scroll functionality

### Real-time Synchronization
The WebSocket implementation ensures zero-delay updates across all connected displays:

- **Bidirectional Communication**: Control panel sends updates, displays receive instant synchronization
- **Automatic Reconnection**: Client-side reconnection logic with exponential backoff for reliability
- **Message Queuing**: Ensures message delivery order and handles connection interruptions
- **State Persistence**: Server maintains current state and broadcasts to newly connected clients

### Font System Integration
Advanced font detection and management for professional typography:

- **Local Font Detection**: Uses Font Access API when available with fallback to common system fonts
- **Font Preview**: Real-time font preview in control interface
- **Cross-platform Compatibility**: Extensive list of common fonts across Windows, macOS, and Linux
- **Performance Optimization**: Client-side font detection caching to minimize API calls

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, TypeScript for component architecture and type safety
- **Build Tools**: Vite for development server and production builds, ESBuild for backend compilation
- **UI Framework**: Radix UI primitives with shadcn/ui components for consistent, accessible interface design
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer for utility-first styling and browser compatibility

### State Management & Networking
- **TanStack Query**: Server state management, caching, and background synchronization
- **WebSocket**: Native WebSocket API for real-time bidirectional communication
- **Wouter**: Lightweight client-side routing with minimal performance impact

### Database & ORM
- **PostgreSQL**: Primary database for production deployments with ACID compliance
- **Drizzle ORM**: Type-safe database operations with TypeScript integration and migration support
- **Neon Database**: Serverless PostgreSQL provider for cloud deployments

### Development & Production
- **TSX**: TypeScript execution for development server hot reloading
- **Cross-env**: Environment variable management across different operating systems
- **Connect-pg-simple**: PostgreSQL session store integration for production environments

### External Services Integration
- **Bible API**: Integration with thiagobodruk/bible GitHub repository for scripture display functionality
- **Font Access API**: Browser-native font detection for enhanced typography options
- **OBS Studio**: Browser source integration for streaming overlay functionality