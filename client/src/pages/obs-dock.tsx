import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Music, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight,
  Upload,
  Trash2,
  Settings2
} from "lucide-react";
import { FontSelector } from "@/components/font-selector";

export default function OBSDock() {
  const sessionId = "default";
  const { session, lyricsArray, totalLines, isConnected, updateLyrics, updateSettings, togglePlay, navigate } = useWebSocket(sessionId);
  const { toast } = useToast();

  const [lyricsText, setLyricsText] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [jumpToLine, setJumpToLine] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // Update local state when session changes
  useEffect(() => {
    if (session) {
      setLyricsText(session.lyrics);
      setSongTitle(session.songTitle);
    }
  }, [session]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (session) {
            togglePlay(!session.isPlaying);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigate('next');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigate('previous');
          break;
        case 'Home':
          e.preventDefault();
          navigate('first');
          break;
        case 'End':
          e.preventDefault();
          navigate('last');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [session, togglePlay, navigate]);

  const handleLoadLyrics = useCallback(() => {
    if (lyricsText.trim()) {
      updateLyrics(lyricsText.trim(), songTitle.trim());
      toast({
        title: "Lyrics loaded",
        description: `${lyricsArray.length} lines ready`,
      });
    }
  }, [lyricsText, songTitle, updateLyrics, toast, lyricsArray.length]);

  const handleClearLyrics = useCallback(() => {
    setLyricsText("");
    setSongTitle("");
    updateLyrics("", "");
  }, [updateLyrics]);

  const handleJumpTo = useCallback(() => {
    const lineIndex = jumpToLine - 1;
    navigate('jump', lineIndex);
  }, [jumpToLine, navigate]);

  const getCurrentDisplayLines = useCallback(() => {
    if (!session || !lyricsArray.length) return [];
    
    const startLine = session.currentLine;
    const endLine = Math.min(startLine + session.displayLines, lyricsArray.length);
    return lyricsArray.slice(startLine, endLine);
  }, [session, lyricsArray]);

  const currentDisplayLines = getCurrentDisplayLines();

  if (!session) {
    return (
      <div className="h-full bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background text-foreground p-3 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Music className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Lyrics Control</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Current Song Info */}
      {session.songTitle && (
        <div className="bg-muted p-2 rounded text-sm">
          <div className="font-medium truncate">{session.songTitle}</div>
          <div className="text-muted-foreground">
            Line {session.currentLine + 1} of {totalLines}
          </div>
        </div>
      )}

      {/* Main Controls */}
      <Card className="bg-card">
        <CardContent className="p-3 space-y-3">
          {/* Navigation */}
          <div className="flex items-center justify-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('first')}
            >
              <SkipBack className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('previous')}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            
            <Button 
              size="sm"
              onClick={() => togglePlay(!session.isPlaying)}
              className="px-4"
            >
              {session.isPlaying ? (
                <Pause className="h-3 w-3 mr-1" />
              ) : (
                <Play className="h-3 w-3 mr-1" />
              )}
              {session.isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('next')}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('last')}
            >
              <SkipForward className="h-3 w-3" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(((session.currentLine + 1) / totalLines) * 100)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${((session.currentLine + 1) / totalLines) * 100}%` }}
              />
            </div>
          </div>

          {/* Quick Jump */}
          <div className="flex items-center space-x-2">
            <Label className="text-xs">Jump:</Label>
            <Input
              type="number"
              min="1"
              max={totalLines}
              value={jumpToLine}
              onChange={(e) => setJumpToLine(parseInt(e.target.value))}
              className="w-16 h-7 text-xs"
            />
            <Button variant="outline" size="sm" onClick={handleJumpTo}>
              Go
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Display Preview */}
      <Card className="bg-card">
        <CardHeader className="p-2">
          <CardTitle className="text-sm">Current Display</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div 
            className="bg-black rounded p-2 min-h-[60px] flex items-center justify-center text-center"
            style={{ 
              fontSize: `${Math.max(session.fontSize * 0.3, 10)}px`,
              fontFamily: session.fontFamily,
              color: session.textColor,
            }}
          >
            {currentDisplayLines.length > 0 ? (
              <div className="space-y-1">
                {currentDisplayLines.map((line, index) => (
                  <div key={index} className="leading-tight">
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-xs">No lyrics</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lyrics Management */}
      <Card className="bg-card">
        <CardHeader className="p-2">
          <CardTitle className="text-sm">Load Lyrics</CardTitle>
        </CardHeader>
        <CardContent className="p-2 space-y-2">
          <Input
            placeholder="Song title"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            className="h-7 text-xs"
          />
          <Textarea
            placeholder="Paste lyrics here..."
            value={lyricsText}
            onChange={(e) => setLyricsText(e.target.value)}
            className="min-h-[80px] text-xs"
          />
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleLoadLyrics} className="flex-1">
              <Upload className="h-3 w-3 mr-1" />
              Load
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearLyrics}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      {showSettings && (
        <Card className="bg-card">
          <CardHeader className="p-2">
            <CardTitle className="text-sm">Display Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-3">
            {/* Lines to Display */}
            <div className="space-y-1">
              <Label className="text-xs">Lines to display</Label>
              <Select 
                value={session.displayLines.toString()} 
                onValueChange={(value) => updateSettings({ displayLines: parseInt(value) })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 line</SelectItem>
                  <SelectItem value="2">2 lines</SelectItem>
                  <SelectItem value="3">3 lines</SelectItem>
                  <SelectItem value="4">4 lines</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font Family */}
            <FontSelector
              value={session.fontFamily}
              onValueChange={(value) => updateSettings({ fontFamily: value })}
              size="sm"
            />

            {/* Font Size */}
            <div className="space-y-1">
              <Label className="text-xs">Font Size: {session.fontSize}px</Label>
              <Slider
                value={[session.fontSize]}
                onValueChange={([value]) => updateSettings({ fontSize: value })}
                min={16}
                max={72}
                step={2}
                className="h-4"
              />
            </div>

            {/* Text Color */}
            <div className="space-y-1">
              <Label className="text-xs">Text Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={session.textColor}
                  onChange={(e) => updateSettings({ textColor: e.target.value })}
                  className="w-8 h-7 rounded border"
                />
                <Input
                  value={session.textColor}
                  onChange={(e) => updateSettings({ textColor: e.target.value })}
                  className="h-7 text-xs font-mono"
                />
              </div>
            </div>

            {/* Text Alignment */}
            <div className="space-y-1">
              <Label className="text-xs">Text Alignment</Label>
              <Select 
                value={session.textAlign} 
                onValueChange={(value) => updateSettings({ textAlign: value })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyboard Shortcuts Help */}
      <Card className="bg-card">
        <CardContent className="p-2">
          <div className="text-xs text-muted-foreground space-y-1">
            <div><kbd className="bg-secondary px-1 rounded">Space</kbd> Play/Pause</div>
            <div><kbd className="bg-secondary px-1 rounded">←→</kbd> Previous/Next</div>
            <div><kbd className="bg-secondary px-1 rounded">Home/End</kbd> First/Last</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}