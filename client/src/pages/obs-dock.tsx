import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useBible } from "@/hooks/use-bible";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Settings2,
  BookOpen
} from "lucide-react";
import { BibleControls } from "@/components/bible-controls";

export default function OBSDock() {
  // Hardcoded settings
  const settings = {
    fontSize: 14,
    fontFamily: 'Arial',
    compactMode: false
  };
  const sessionId = "default";
  const { session, lyricsArray, totalLines, isConnected, updateLyrics, updatePosition, updateSettings, togglePlay, navigate } = useWebSocket(sessionId);
  const { currentChapter, loading: bibleLoading, loadChapter } = useBible();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("songs");
  const [lyricsText, setLyricsText] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [jumpToLine, setJumpToLine] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [bibleReference, setBibleReference] = useState("");
  
  // Apply OBS Dock settings
  const dockStyle = {
    fontSize: `${settings.fontSize}px`,
    fontFamily: settings.fontFamily,
  };
  const isCompact = settings.compactMode;

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
        case 'ArrowUp':
          e.preventDefault();
          navigate('previous');
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigate('next');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (session) {
            togglePlay(false); // Stop
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (session) {
            togglePlay(true); // Play
          }
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

  const handleBibleContentLoad = useCallback((content: string, title: string) => {
    updateLyrics(content, title);
    setActiveTab("lyrics");

    toast({
      title: "Bible content loaded",
      description: `${title} loaded to lyrics`,
    });
  }, [updateLyrics, toast]);

  const handleBibleVerseSelect = useCallback((verse: any, reference: string) => {
    toast({
      title: "Verse selected",
      description: reference,
    });
  }, [toast]);

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
    <div className="h-full bg-background text-foreground p-3 space-y-4 overflow-y-auto" style={dockStyle}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Music className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Content Control</h2>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lyrics" className="text-xs">
            <Music className="h-3 w-3 mr-1" />
            Lyrics
          </TabsTrigger>
          <TabsTrigger value="bible" className="text-xs">
            <BookOpen className="h-3 w-3 mr-1" />
            Bible
          </TabsTrigger>
        </TabsList>

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

      {/* All Lyrics Lines */}
      {lyricsArray.length > 0 && (
        <Card className="bg-card">
          <CardHeader className="p-2">
            <CardTitle className="text-sm">
              Lyrics Groups 
              <span className="text-xs font-normal text-muted-foreground ml-1">
                ({session.displayLines} line{session.displayLines > 1 ? 's' : ''} each)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 max-h-48 overflow-y-auto">
            <div className="space-y-1">
              {/* Group lyrics into navigation chunks */}
              {Array.from({ length: Math.ceil(lyricsArray.length / session.displayLines) }, (_, groupIndex) => {
                const startIndex = groupIndex * session.displayLines;
                const endIndex = Math.min(startIndex + session.displayLines, lyricsArray.length);
                const groupLines = lyricsArray.slice(startIndex, endIndex);
                const isCurrentGroup = session.currentLine >= startIndex && session.currentLine < endIndex;

                return (
                  <div
                    key={groupIndex}
                    className={`p-2 rounded cursor-pointer transition-colors border text-xs ${
                      isCurrentGroup
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted hover:bg-muted/80 border-transparent hover:border-muted-foreground/20'
                    }`}
                    onClick={() => updatePosition(startIndex)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">
                          {startIndex + 1}-{endIndex}
                          {isCurrentGroup && (
                            <span className="ml-1 px-1 rounded bg-primary-foreground/20 text-primary-foreground text-xs">
                              •
                            </span>
                          )}
                        </span>
                      </div>
                      {groupLines.map((line, lineIndex) => {
                        const actualIndex = startIndex + lineIndex;
                        const isActualCurrentLine = actualIndex === session.currentLine;

                        return (
                          <div 
                            key={actualIndex}
                            className={`text-xs px-1 truncate ${
                              isActualCurrentLine 
                                ? 'font-medium' 
                                : 'opacity-70'
                            }`}
                          >
                            {line || <em className="opacity-60">(empty)</em>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <TabsContent value="lyrics" className="space-y-4 mt-0">
          <Tabs defaultValue="controls" className="space-y-2">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="controls" className="text-xs">Controls</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="controls" className="mt-2">
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
            </TabsContent>
            
            <TabsContent value="settings" className="mt-2">
              <p className="text-sm text-muted-foreground p-2">Settings are now managed per URL. Configure display settings directly on each display page.</p>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="bible" className="space-y-4 mt-0">
          <Tabs defaultValue="controls" className="space-y-2">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="controls" className="text-xs">Controls</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="controls" className="mt-2">
              <BibleControls 
                onContentLoad={handleBibleContentLoad}
                onVerseSelect={handleBibleVerseSelect}
                showLoadButton={true}
                displayMode="bible"
                setDisplayMode={() => {}}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-2">
              <p className="text-sm text-muted-foreground p-2">Settings are now managed per URL. Configure display settings directly on each display page.</p>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

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

            {/* Font Family - Simple Input */}
            <div className="space-y-1">
              <Label className="text-xs">Font Family</Label>
              <Input
                value={session.fontFamily}
                onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                placeholder="Arial"
                className="h-7 text-xs"
              />
            </div>

            {/* Font Size */}
            <div className="space-y-1">
              <Label className="text-xs">Font Size: {session.fontSize}px</Label>
              <Slider
                value={[session.fontSize]}
                onValueChange={([value]) => updateSettings({ fontSize: value })}
                min={16}
                max={300}
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
            <div><kbd className="bg-secondary px-1 rounded">↑↓</kbd> Previous/Next</div>
            <div><kbd className="bg-secondary px-1 rounded">←→</kbd> Stop/Play</div>
            <div><kbd className="bg-secondary px-1 rounded">Home/End</kbd> First/Last</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}