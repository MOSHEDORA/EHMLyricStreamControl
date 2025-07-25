# OBS Control Dock Setup Guide

## Overview
This guide shows you how to control your lyrics directly from within OBS Studio using Custom Browser Docks. This means you don't need a separate window - everything is built right into OBS!

## Step 1: Add the Lyrics Display to OBS

First, set up the lyrics display as a browser source:

1. **Add Browser Source**
   - In OBS Sources, click "+" → "Browser Source"
   - Name it "Lyrics Display"
   - **URL**: `http://localhost:5000/display` (copy from control panel)
   - **Width**: 1920, **Height**: 1080
   - Click OK

2. **Position the Display**
   - Resize and position where you want lyrics to appear
   - Test with some sample lyrics to check positioning

## Step 2: Add the Control Dock to OBS

Now add the control interface directly inside OBS:

1. **Open Custom Browser Docks**
   - In OBS, go to **View** → **Docks** → **Custom Browser Docks**

2. **Add New Dock**
   - Click "+" to add a new dock
   - **Dock Name**: "Lyrics Controller"
   - **URL**: `http://localhost:5000/obs-dock` (copy from control panel)
   - Click "Apply"

3. **Position the Dock**
   - The new dock will appear in your OBS interface
   - Drag it to where you want it (sidebar, bottom panel, etc.)
   - Resize as needed - it's designed to work in narrow spaces

## Step 3: Using the Control Dock

### Loading Lyrics
1. In the dock, enter your song title
2. Paste your full lyrics in the text area
3. Click "Load" to make them available
4. The display will update automatically

### Live Control
- **Play/Pause**: Start/stop the display
- **Navigation**: Use arrow buttons to move between lines
- **Jump**: Enter a line number to jump directly
- **Progress Bar**: Shows your position in the song

### Settings (Click the gear icon)
- **Lines to Display**: Choose 1-4 lines at once
- **Font Size**: Adjust text size for your screen
- **Text Color**: Change color with color picker
- **Text Alignment**: Left, center, or right

### Keyboard Shortcuts (when dock is focused)
- **Spacebar**: Play/Pause
- **Left/Right Arrows**: Previous/Next line
- **Home/End**: First/Last line

## Step 4: Advanced Setup Tips

### Multiple Docks
You can create multiple control docks for:
- **Main Controller**: Full control interface
- **Quick Controls**: Just navigation buttons
- **Monitor**: Preview-only display

### Dock Positioning Ideas
- **Side Panel**: Narrow dock on left/right for controls
- **Bottom Strip**: Wide dock at bottom for full interface
- **Floating**: Separate window that you can move around
- **Second Monitor**: Place dock on secondary display

### Scene-Specific Setup
- Create different scenes with different lyric positioning
- Use the same control dock across all scenes
- Switch scenes while keeping lyrics synchronized

## Step 5: Workflow for Live Performance

### Preparation
1. Start the lyrics application
2. Set up your OBS scenes with the browser source
3. Add the control dock to your OBS interface
4. Load all your songs' lyrics in advance

### During Performance
1. Load the current song's lyrics in the dock
2. Click "Play" when ready to display
3. Use navigation controls to move through lyrics
4. Switch between songs without stopping your stream
5. Everything updates in real-time

### Tips for Smooth Operation
- **Test First**: Practice with the interface before going live
- **Backup**: Have lyrics printed as backup
- **Multiple Operators**: Multiple people can control if needed
- **Quick Access**: Pin frequently used songs

## Troubleshooting

### Dock Not Loading
- Check that the application is running (`npm run dev`)
- Verify the URL matches what's shown in the control panel
- Refresh the dock: Right-click dock → Refresh

### Controls Not Working
- Click inside the dock to ensure it has focus
- Check WebSocket connection (green dot in dock header)
- Restart the application if needed

### Display Not Updating
- Verify browser source URL is correct
- Check that both dock and display are connected
- Look for error messages in the dock

## Benefits of Using OBS Dock

✅ **Integrated Control**: Everything in one interface
✅ **No Alt-Tabbing**: Stay in OBS during performance
✅ **Compact Design**: Works in small dock spaces
✅ **Real-Time Sync**: Instant updates to display
✅ **Multiple Operators**: Several people can control
✅ **Professional Look**: Clean, OBS-native appearance

## Alternative Layouts

### Minimal Setup
- Small dock with just play/pause and navigation
- Perfect for simple performances

### Full Control Setup
- Large dock with all lyrics management
- Best for complex productions with many songs

### Multi-Monitor Setup
- Control dock on secondary monitor
- Full-screen lyrics display on main monitor
- Separate preview window for operator

Your lyrics are now fully integrated into OBS! You can control everything without leaving OBS Studio.