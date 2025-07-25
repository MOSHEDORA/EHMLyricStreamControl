# OBS Lyrics Display Setup Guide

## Overview
This application provides a real-time lyrics display system that's perfect for live streaming, church services, concerts, and other performances. You can control the lyrics from the control panel while displaying them in OBS.

## Step 1: Setting Up the Browser Source in OBS

1. **Add Browser Source**
   - In OBS, click the "+" button in the Sources panel
   - Select "Browser Source"
   - Name it "Lyrics Display" or whatever you prefer

2. **Configure Browser Source Settings**
   - **URL**: Copy the OBS URL from the control panel (it shows at the top)
     - It will be something like: `http://localhost:5000/display`
     - Or use the "Copy OBS URL" button in the control panel
   - **Width**: 1920
   - **Height**: 1080
   - **Custom CSS**: Leave blank (optional styling can be added here)
   - **Shutdown source when not visible**: Unchecked
   - **Refresh browser when scene becomes active**: Unchecked
   - **Control audio via OBS**: Unchecked

3. **Position and Size**
   - The lyrics will automatically center themselves
   - You can resize and position the browser source as needed
   - Consider creating multiple scenes for different display styles

## Step 2: Using the Control Panel

### Loading Lyrics
1. Open the control panel in your web browser
2. Enter the song title in the "Song Title" field
3. Paste your full song lyrics in the "Lyrics" text area
4. Choose how many lines to display at once (1-4 lines)
5. Click "Load Lyrics" to make them available

### Navigation Controls
- **Play/Pause Button**: Start or stop the display
- **Previous/Next Arrows**: Move between lyric lines
- **First/Last Buttons**: Jump to beginning or end
- **Jump to Line**: Enter a line number to jump directly to it

### Keyboard Shortcuts (when control panel is focused)
- **Spacebar**: Play/Pause
- **Left Arrow**: Previous line
- **Right Arrow**: Next line
- **Home**: First line
- **End**: Last line

### Display Settings
- **Font Family**: Choose from your locally installed fonts
- **Font Size**: Adjust text size (16-72px)
- **Text Color**: Change text color with color picker
- **Text Alignment**: Left, center, or right alignment
- **Background**: Enable/disable background with color and opacity
- **Lines to Display**: Show 1-4 lines at once

### Local Font Detection
The application automatically detects fonts installed on your system:
- **Chrome 103+**: Uses Font Access API for complete font detection
- **Other browsers**: Detects common system fonts
- **Refresh button**: Re-scan for newly installed fonts
- **Font preview**: See how text looks in each font

## Step 3: Live Performance Workflow

### Before the Performance
1. Start the application (`npm run dev`)
2. Set up the browser source in OBS using the display URL
3. Load all your song lyrics in advance
4. Test the display settings and positioning

### During the Performance
1. Keep the control panel open on a separate monitor or device
2. Load the current song's lyrics
3. Use the play button or spacebar to start displaying
4. Navigate through lyrics using arrow keys or buttons
5. The display in OBS updates instantly

### Advanced Tips
- **Multiple Songs**: Load new lyrics without stopping the stream
- **Backup Control**: Multiple people can open the control panel for redundancy
- **Preview**: Use the preview panel to see exactly what's displayed
- **Smooth Transitions**: Lines fade in/out for professional appearance

## Step 4: OBS Scene Setup Recommendations

### Basic Lyrics Scene
- Add the browser source
- Position it in the lower third of the screen
- Use a semi-transparent background for readability

### Full-Screen Lyrics Scene
- Make the browser source cover the entire screen
- Use for worship services or karaoke-style displays
- Consider adding your logo in a corner

### Picture-in-Picture
- Resize the browser source to a corner
- Perfect for live streams where you want lyrics visible but not dominant

## Troubleshooting

### Connection Issues
- Ensure the application is running (`npm run dev`)
- Check that the URL in OBS matches the one shown in the control panel
- Look for the green "Connected" indicator in the control panel

### Display Not Updating
- Refresh the browser source in OBS (right-click → Refresh)
- Check that lyrics are loaded and "Play" is activated
- Verify the WebSocket connection is active

### Performance Optimization
- Close unnecessary browser tabs
- Use a dedicated computer for OBS if possible
- Consider lowering the refresh rate if needed

## Integration with Other Software

The application works with any software that supports browser sources:
- **OBS Studio**: Primary recommendation
- **Streamlabs OBS**: Use browser source
- **XSplit**: Add web page source
- **vMix**: Add web browser input
- **Any streaming software**: That supports HTML/web content

## Custom Styling (Advanced)

You can add custom CSS in the OBS browser source settings for additional styling:

```css
/* Example: Add text shadow for better readability */
body {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
}

/* Example: Custom font */
body {
  font-family: 'Arial Black', sans-serif;
}
```

Your lyrics display system is now ready for professional use in OBS!