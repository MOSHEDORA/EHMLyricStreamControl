# Dual Display Setup Guide - OBS Lower Third + TV Fullscreen

## Overview
This system provides two synchronized display outputs:
1. **Lower Third** for OBS streaming (positioned at bottom of screen)
2. **Fullscreen** for TV/second monitor (large centered display)

Both displays update simultaneously from one control interface.

## Quick Setup

### Step 1: OBS Lower Third Setup
1. **Add Browser Source in OBS**
   - Sources → Add → Browser Source
   - Name: "Lyrics Lower Third"
   - **URL**: `http://localhost:5000/display/lower-third`
   - Width: 1920, Height: 1080
   - Leave other settings default

2. **Position the Lower Third**
   - The lyrics automatically position at the bottom
   - Resize/reposition the browser source as needed
   - Perfect for streaming overlays

### Step 2: TV Fullscreen Setup
1. **Open Second Display**
   - Open `http://localhost:5000/display/fullscreen` in browser
   - Press F11 for fullscreen mode
   - Connect to TV/projector/second monitor

2. **Display Features**
   - Large, centered lyrics optimized for viewing
   - Auto-scaled fonts (1.5x larger than control panel setting)
   - Progress indicator shows song completion
   - Song title prominently displayed

### Step 3: Control Both Displays
1. **Use OBS Dock** (Recommended)
   - In OBS: View → Docks → Custom Browser Docks
   - Add dock with URL: `http://localhost:5000/obs-dock`
   - Control both displays from within OBS

2. **Or Use Main Control Panel**
   - Open `http://localhost:5000/control` in browser
   - Use "Copy Lower Third" and "Copy Fullscreen" buttons
   - Quick "Open" buttons test each display

## Display Differences

### Lower Third Display (`/display/lower-third`)
- **Position**: Bottom of screen with padding
- **Background**: Transparent with optional overlay
- **Font**: Standard size with text shadows for readability
- **Purpose**: OBS streaming overlay
- **Features**:
  - Automatic bottom positioning
  - Text shadows for visibility over video
  - Compact song title placement
  - OBS-optimized styling

### Fullscreen Display (`/display/fullscreen`)
- **Position**: Center screen, fullscreen optimized
- **Background**: Black with optional overlay
- **Font**: 1.5x larger for distance viewing
- **Purpose**: TV/projector/second monitor
- **Features**:
  - Large, readable text for audience
  - Progress bar for song tracking
  - Prominent song title at top
  - Optimized for large screen viewing

## Workflow Examples

### Live Streaming Setup
1. **OBS**: Add lower third browser source
2. **Second Monitor**: Open fullscreen display for performers
3. **Control**: Use OBS dock to control both simultaneously
4. **Result**: Stream viewers see lower third, performers see fullscreen

### Church/Worship Service
1. **Projector**: Fullscreen display for congregation
2. **Streaming**: Lower third for online viewers
3. **Control**: Operator controls from OBS dock or control panel
4. **Result**: Both in-person and online audiences see synchronized lyrics

### Concert/Performance
1. **Main Screen**: Fullscreen display for audience
2. **Confidence Monitor**: Lower third for performers
3. **Control**: Multiple operators can control if needed
4. **Result**: Audience and performers have optimized displays

## Advanced Configuration

### Font Scaling
- **Lower Third**: Uses exact font size from settings
- **Fullscreen**: Automatically scales to 1.5x for better visibility
- **Both**: Support all local fonts and custom styling

### Background Options
- **Lower Third**: Transparent background preserves video underneath
- **Fullscreen**: Black background with optional colored overlay
- **Settings**: Same background controls affect both displays appropriately

### Multiple Monitor Setup
1. **Primary**: OBS with lower third display
2. **Secondary**: Fullscreen browser in full screen mode
3. **Control**: OBS dock on primary monitor
4. **Optional**: Third monitor for control panel backup

## Technical Details

### URLs Reference
```
Control Panel:     http://localhost:5000/control
OBS Lower Third:   http://localhost:5000/display/lower-third
TV Fullscreen:     http://localhost:5000/display/fullscreen
OBS Control Dock:  http://localhost:5000/obs-dock
```

### Browser Source Settings (OBS)
```
Lower Third Source:
- URL: http://localhost:5000/display/lower-third
- Width: 1920
- Height: 1080
- Custom CSS: (optional for additional styling)
- Shutdown when not visible: No
- Refresh when active: No
```

### Fullscreen Display Settings
- **Recommended**: Use dedicated browser window
- **Keyboard**: F11 for fullscreen mode
- **Multiple Monitors**: Drag to second monitor before fullscreen
- **Performance**: Close unnecessary tabs for smooth operation

## Synchronization
- Both displays connect to the same WebSocket session
- Changes appear instantly on both outputs
- No delay between lower third and fullscreen
- All controls affect both displays simultaneously

## Troubleshooting

### Displays Not Updating
1. Check WebSocket connection (green indicator)
2. Refresh browser sources in OBS
3. Restart the application if needed

### Text Too Small/Large
- **Lower Third**: Adjust font size in settings
- **Fullscreen**: Font auto-scales 1.5x from setting
- **Different Needs**: Use separate sessions if different sizes needed

### Performance Issues
1. Close unnecessary browser tabs
2. Use dedicated computer for OBS if possible
3. Consider hardware acceleration in browsers

Your dual display system is now ready for professional use!