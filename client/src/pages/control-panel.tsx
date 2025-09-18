import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  Settings,
  Copy,
  Expand,
  Upload,
  Trash2,
  FileText,
  BookOpen,
  Monitor,
} from "lucide-react";
import { FontSelector } from "@/components/font-selector";
import { FontPermissionBanner } from "@/components/font-permission-banner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BibleControls } from "@/components/bible-controls";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";
import { DisplaySettings } from "@/components/display-settings";

export default function ControlPanel() {
  const sessionId = "default";
  const {
    session,
    lyricsArray,
    totalLines,
    isConnected,
    updateLyrics,
    updatePosition,
    updateSettings,
    togglePlay,
    navigate,
  } = useWebSocket(sessionId);
  const { toast } = useToast();

  const [lyricsText, setLyricsText] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [jumpToLine, setJumpToLine] = useState(1);
  const [displayMode, setDisplayMode] = useState<'lyrics' | 'bible'>('lyrics');
  const [activeTab, setActiveTab] = useState<'lyrics' | 'bible' | 'settings' | 'display'>('lyrics');

  // Update local state when session changes
  useEffect(() => {
    if (session) {
      setLyricsText(session.lyrics);
      setSongTitle(session.songTitle);
    }
  }, [session]);

  // Auto-scroll to current lyrics group
  useEffect(() => {
    if (session && lyricsArray.length > 0) {
      const currentGroupIndex = Math.floor(
        session.currentLine / session.displayLines,
      );
      const scrollContainer = document.getElementById(
        "lyrics-scroll-container",
      );
      const currentGroupElement = document.getElementById(
        `lyrics-group-${currentGroupIndex}`,
      );

      if (scrollContainer && currentGroupElement) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = currentGroupElement.getBoundingClientRect();

        // Check if element is not fully visible
        if (
          elementRect.top < containerRect.top ||
          elementRect.bottom > containerRect.bottom
        ) {
          currentGroupElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
  }, [session?.currentLine, session?.displayLines, lyricsArray.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      ) {
        return; // Don't handle shortcuts when typing in inputs
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (session) {
            togglePlay(!session.isPlaying);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          navigate("previous");
          break;
        case "ArrowDown":
          e.preventDefault();
          navigate("next");
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (session) {
            togglePlay(false); // Stop
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (session) {
            togglePlay(true); // Play
          }
          break;
        case "Home":
          e.preventDefault();
          navigate("first");
          break;
        case "End":
          e.preventDefault();
          navigate("last");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [session, togglePlay, navigate]);

  const handleLoadLyrics = useCallback(() => {
    if (lyricsText.trim()) {
      updateLyrics(lyricsText.trim(), songTitle.trim());
      toast({
        title: "Lyrics loaded",
        description: `${lyricsArray.length} lines ready for display`,
      });
    }
  }, [lyricsText, songTitle, updateLyrics, toast, lyricsArray.length]);

  const handleClearLyrics = useCallback(() => {
    setLyricsText("");
    setSongTitle("");
    updateLyrics("", "");
  }, [updateLyrics]);

  const handleJumpTo = useCallback(() => {
    const lineIndex = jumpToLine - 1; // Convert to 0-based index
    navigate("jump", lineIndex);
  }, [jumpToLine, navigate]);

  const copyOBSUrl = useCallback(async () => {
    const url = `${window.location.origin}/display`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL copied",
        description: "OBS browser source URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  }, [toast]);

  const openLowerThird = useCallback(() => {
    window.open("/display/lower-third", "_blank");
  }, []);

  const openFullscreen = useCallback(() => {
    window.open("/display/fullscreen", "_blank");
  }, []);

  const getCurrentDisplayLines = useCallback(() => {
    if (!session || !lyricsArray.length) return [];

    const startLine = session.currentLine;
    const endLine = Math.min(
      startLine + session.displayLines,
      lyricsArray.length,
    );
    return lyricsArray.slice(startLine, endLine);
  }, [session, lyricsArray]);

  const currentDisplayLines = getCurrentDisplayLines();

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Connecting to lyrics service...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Music className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">OBS Lyrics Controller</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                />
                <span
                  className={`text-sm ${isConnected ? "text-green-600" : "text-red-600"}`}
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `${window.location.origin}/display/lower-third`;
                  navigator.clipboard.writeText(url).then(() => {
                    toast({
                      title: "Lower Third URL copied",
                      description: "Use this URL for OBS browser source",
                    });
                  });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Lower Third
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `${window.location.origin}/display/fullscreen`;
                  navigator.clipboard.writeText(url).then(() => {
                    toast({
                      title: "Fullscreen URL copied",
                      description: "Use this URL for TV/second monitor",
                    });
                  });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Fullscreen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `${window.location.origin}/obs-dock`;
                  navigator.clipboard.writeText(url).then(() => {
                    toast({
                      title: "OBS Dock URL copied",
                      description: "Use this URL for OBS Custom Browser Docks",
                    });
                  });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Dock URL
              </Button>
            </div>
          </div>

          {/* Display URLs Info */}
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  OBS Lower Third URL:
                </p>
              </div>
              <code className="block bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200 text-xs">
                {window.location.origin}/display/lower-third
              </code>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  For OBS browser source - positions lyrics at the bottom of
                  screen
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openLowerThird}
                  className="h-6 text-xs"
                >
                  <Expand className="h-3 w-3 mr-1" />
                  Open
                </Button>
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Expand className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                  TV Fullscreen URL:
                </p>
              </div>
              <code className="block bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded text-purple-800 dark:text-purple-200 text-xs">
                {window.location.origin}/display/fullscreen
              </code>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  For second monitor/TV - full screen centered lyrics display
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openFullscreen}
                  className="h-6 text-xs"
                >
                  <Expand className="h-3 w-3 mr-1" />
                  Open
                </Button>
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="h-4 w-4 text-green-600" />
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                  OBS Control Dock URL:
                </p>
              </div>
              <code className="block bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200 text-xs">
                {window.location.origin}/obs-dock
              </code>
              <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                Add as Custom Browser Dock in OBS: View → Docks → Custom Browser
                Docks
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Lyrics/Bible Toggle above tabs */}
        <div className="flex items-center justify-center mb-6 gap-2">
          <button
            className={`px-4 py-2 rounded font-semibold ${displayMode === 'lyrics' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => {
              setDisplayMode('lyrics');
              setActiveTab('lyrics');
            }}
          >
            Lyrics
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold ${displayMode === 'bible' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => {
              setDisplayMode('bible');
              setActiveTab('bible');
            }}
          >
            Bible
          </button>
        </div>
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
            <TabsTrigger value="bible">Bible</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          {/* Left Panel - Lyrics Input & Management */}
          <TabsContent value="lyrics">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="xl:col-span-1 space-y-6">
                {/* Lyrics Input */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Music className="h-5 w-5 mr-2 text-primary" />
                        Lyrics Input
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearLyrics}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="songTitle">Song Title</Label>
                      <Input
                        id="songTitle"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        placeholder="Enter song title..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="lyrics">Lyrics</Label>
                      <Textarea
                        id="lyrics"
                        value={lyricsText}
                        onChange={(e) => setLyricsText(e.target.value)}
                        placeholder="Paste your song lyrics here... Each line will become a separate lyric line that you can navigate through."
                        className="min-h-[200px] font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Label>Lines to display:</Label>
                        <Select
                          value={session.displayLines.toString()}
                          onValueChange={(value) =>
                            updateSettings({ displayLines: parseInt(value) })
                          }
                        >
                          <SelectTrigger className="w-32">
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
                      <Button onClick={handleLoadLyrics}>
                        <Upload className="h-4 w-4 mr-2" />
                        Load Lyrics
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Navigation Controls</span>
                      <span className="text-sm text-muted-foreground">
                        Line {session.currentLine + 1} of {totalLines}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Main Controls */}
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("first")}
                        title="Go to first line"
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("previous")}
                        title="Previous line"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <Button
                        size="lg"
                        onClick={() => togglePlay(!session.isPlaying)}
                        className="px-8"
                      >
                        {session.isPlaying ? (
                          <Pause className="h-5 w-5 mr-2" />
                        ) : (
                          <Play className="h-5 w-5 mr-2" />
                        )}
                        {session.isPlaying ? "Pause" : "Play"}
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("next")}
                        title="Next line"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("last")}
                        title="Go to last line"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quick Jump */}
                    <div className="flex items-center space-x-4">
                      <Label>Jump to line:</Label>
                      <Input
                        type="number"
                        min="1"
                        max={totalLines}
                        value={jumpToLine}
                        onChange={(e) => setJumpToLine(parseInt(e.target.value))}
                        className="w-20"
                      />
                      <Button variant="outline" onClick={handleJumpTo}>
                        Go
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span>
                          {Math.round(
                            ((session.currentLine + 1) / totalLines) * 100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${((session.currentLine + 1) / totalLines) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Preview & Settings */}
              <div className="space-y-6">
                {/* Preview Area */}
                <Card className="bg-black border-2 border-gray-800 h-64">
                  <CardContent className="p-6 h-full">
                    <div
                      className="h-full flex items-center justify-center"
                      style={{
                        fontSize: `${session.fontSize}px`,
                        fontFamily: session.fontFamily,
                        color: session.textColor,
                        textAlign: session.textAlign as any,
                      }}
                    >
                      {currentDisplayLines.length > 0 ? (
                        <div className="space-y-2">
                          {currentDisplayLines.map((line, index) => (
                            <div
                              key={index}
                              className="leading-relaxed transition-all duration-300"
                              style={{
                                opacity: index === 0 ? 1 : 0.75,
                              }}
                            >
                              {line}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-center">
                          <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No lyrics loaded</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Lyrics Lines Selection */}
                {lyricsArray.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Lyrics Lines
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          (Navigate by {session.displayLines} line
                          {session.displayLines > 1 ? "s" : ""})
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent
                      className="max-h-64 overflow-y-auto"
                      id="lyrics-scroll-container"
                    >
                      <div className="space-y-2">
                        {/* Group lyrics into navigation chunks */}
                        {Array.from(
                          {
                            length: Math.ceil(
                              lyricsArray.length / session.displayLines,
                            ),
                          },
                          (_, groupIndex) => {
                            const startIndex = groupIndex * session.displayLines;
                            const endIndex = Math.min(
                              startIndex + session.displayLines,
                              lyricsArray.length,
                            );
                            const groupLines = lyricsArray.slice(
                              startIndex,
                              endIndex,
                            );
                            const isCurrentGroup =
                              session.currentLine >= startIndex &&
                              session.currentLine < endIndex;

                            return (
                              <div
                                key={groupIndex}
                                id={`lyrics-group-${groupIndex}`}
                                className={`p-3 rounded cursor-pointer transition-colors border ${
                                  isCurrentGroup
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted hover:bg-muted/80 border-transparent hover:border-muted-foreground/20"
                                }`}
                                onClick={() => updatePosition(startIndex)}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium">
                                      Lines {startIndex + 1}-{endIndex}
                                      {isCurrentGroup && (
                                        <span className="ml-2 px-1 rounded bg-primary-foreground/20 text-primary-foreground">
                                          current
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-xs opacity-70">
                                      Group {groupIndex + 1}
                                    </span>
                                  </div>
                                  {groupLines.map((line, lineIndex) => {
                                    const actualIndex = startIndex + lineIndex;
                                    const isActualCurrentLine =
                                      actualIndex === session.currentLine;

                                    return (
                                      <div
                                        key={actualIndex}
                                        className={`text-sm px-2 py-1 rounded ${
                                          isActualCurrentLine
                                            ? "bg-primary-foreground/20 font-medium"
                                            : "opacity-80"
                                        }`}
                                      >
                                        <span className="text-xs mr-2 opacity-60">
                                          {actualIndex + 1}.
                                        </span>
                                        {line || (
                                          <em className="opacity-60">
                                            (empty line)
                                          </em>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>

                      {/* Navigation info */}
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            Group{" "}
                            {Math.floor(
                              session.currentLine / session.displayLines,
                            ) + 1}{" "}
                            of{" "}
                            {Math.ceil(lyricsArray.length / session.displayLines)}
                            {session.displayLines > 1 && (
                              <span className="ml-1">
                                (showing {session.displayLines} lines each)
                              </span>
                            )}
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate("previous")}
                              disabled={session.currentLine === 0}
                              className="h-6 px-2 text-xs"
                            >
                              ← Prev Group
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate("next")}
                              disabled={
                                session.currentLine + session.displayLines >=
                                lyricsArray.length
                              }
                              className="h-6 px-2 text-xs"
                            >
                              Next Group →
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Hotkeys */}
                <Card>
                  <CardHeader>
                    <CardTitle>Hotkeys</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Next Line</span>
                        <kbd className="bg-muted px-2 py-1 rounded text-xs">↓</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Previous Line</span>
                        <kbd className="bg-muted px-2 py-1 rounded text-xs">↑</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Play</span>
                        <kbd className="bg-muted px-2 py-1 rounded text-xs">→</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Stop</span>
                        <kbd className="bg-muted px-2 py-1 rounded text-xs">←</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Play/Pause</span>
                        <kbd className="bg-muted px-2 py-1 rounded text-xs">
                          Space
                        </kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>First Line</span>
                        <kbd className="bg-muted px-2 py-1 rounded text-xs">
                          Home
                        </kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Line</span>
                        <kbd className="bg-muted px-2 py-1 rounded text-xs">
                          End
                        </kbd>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline">
                        <Link to="/obs-dock">
                          <Settings className="h-4 w-4 mr-2" />
                          OBS Dock Panel
                        </Link>
                      </Button>

                      <Button asChild variant="outline">
                        <Link to="/bible">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Bible Navigator
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Display Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-primary" />
                        Display Settings
                      </span>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="separateSettings"
                          checked={session?.separateDisplaySettings || false}
                          onCheckedChange={(checked) =>
                            updateSettings({
                              separateDisplaySettings: checked as boolean,
                            })
                          }
                        />
                        <Label htmlFor="separateSettings" className="text-sm">
                          Separate Settings for Each Display
                        </Label>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {session.separateDisplaySettings ? (
                      /* Separate display settings */
                      <div className="space-y-8">
                        {/* Lower Third Settings */}
                        <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Lower Third (OBS) Settings
                          </h4>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Lines to display:</Label>
                                <Select
                                  value={session.lowerThirdDisplayLines.toString()}
                                  onValueChange={(value) =>
                                    updateSettings({
                                      lowerThirdDisplayLines: parseInt(value),
                                    })
                                  }
                                >
                                  <SelectTrigger>
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
                              <div className="space-y-2">
                                <Label>
                                  Font Size: {session.lowerThirdFontSize}px
                                </Label>
                                <Slider
                                  value={[session.lowerThirdFontSize]}
                                  onValueChange={([value]) =>
                                    updateSettings({ lowerThirdFontSize: value })
                                  }
                                  min={16}
                                  max={300}
                                  step={2}
                                />
                              </div>
                            </div>
                            <FontSelector
                              value={session.lowerThirdFontFamily}
                              onValueChange={(value) =>
                                updateSettings({ lowerThirdFontFamily: value })
                              }
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Text Color</Label>
                                <input
                                  type="color"
                                  value={session.lowerThirdTextColor}
                                  onChange={(e) =>
                                    updateSettings({
                                      lowerThirdTextColor: e.target.value,
                                    })
                                  }
                                  className="w-full h-8 rounded border border-border"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Text Alignment</Label>
                                <Select
                                  value={session.lowerThirdTextAlign}
                                  onValueChange={(value) =>
                                    updateSettings({ lowerThirdTextAlign: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Fullscreen Settings */}
                        <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-950/30">
                          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center">
                            <Expand className="h-4 w-4 mr-2" />
                            Fullscreen (TV) Settings
                          </h4>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Lines to display:</Label>
                                <Select
                                  value={session.fullscreenDisplayLines.toString()}
                                  onValueChange={(value) =>
                                    updateSettings({
                                      fullscreenDisplayLines: parseInt(value),
                                    })
                                  }
                                >
                                  <SelectTrigger>
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
                              <div className="space-y-2">
                                <Label>
                                  Font Size: {session.fullscreenFontSize}px
                                </Label>
                                <Slider
                                  value={[session.fullscreenFontSize]}
                                  onValueChange={([value]) =>
                                    updateSettings({ fullscreenFontSize: value })
                                  }
                                  min={16}
                                  max={300}
                                  step={2}
                                />
                              </div>
                            </div>
                            <FontSelector
                              value={session.fullscreenFontFamily}
                              onValueChange={(value) =>
                                updateSettings({ fullscreenFontFamily: value })
                              }
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Text Color</Label>
                                <input
                                  type="color"
                                  value={session.fullscreenTextColor}
                                  onChange={(e) =>
                                    updateSettings({
                                      fullscreenTextColor: e.target.value,
                                    })
                                  }
                                  className="w-full h-8 rounded border border-border"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Text Alignment</Label>
                                <Select
                                  value={session.fullscreenTextAlign}
                                  onValueChange={(value) =>
                                    updateSettings({ fullscreenTextAlign: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Unified display settings */
                      <div className="space-y-6">
                        {/* Font Family */}
                        <FontSelector
                          value={session.fontFamily}
                          onValueChange={(value) =>
                            updateSettings({ fontFamily: value })
                          }
                        />

                        {/* Font Size */}
                        <div className="space-y-2">
                          <Label>Font Size: {session.fontSize}px</Label>
                          <Slider
                            value={[session.fontSize]}
                            onValueChange={([value]) =>
                              updateSettings({ fontSize: value })
                            }
                            min={16}
                            max={300}
                            step={2}
                          />
                        </div>

                        {/* Text Color */}
                        <div className="space-y-2">
                          <Label>Text Color</Label>
                          <div className="flex space-x-2">
                            <input
                              type="color"
                              value={session.textColor}
                              onChange={(e) =>
                                updateSettings({ textColor: e.target.value })
                              }
                              className="w-12 h-8 rounded border border-border"
                            />
                            <Input
                              value={session.textColor}
                              onChange={(e) =>
                                updateSettings({ textColor: e.target.value })
                              }
                              className="flex-1"
                            />
                          </div>
                        </div>

                        {/* Text Alignment */}
                        <div className="space-y-2">
                          <Label>Text Alignment</Label>
                          <Select
                            value={session.textAlign}
                            onValueChange={(value) =>
                              updateSettings({ textAlign: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Separator />

                        {/* Background Settings */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="showBackground"
                              checked={session.showBackground}
                              onCheckedChange={(checked) =>
                                updateSettings({ showBackground: !!checked })
                              }
                            />
                            <Label htmlFor="showBackground">Show Background</Label>
                          </div>

                          {session.showBackground && (
                            <>
                              <div className="space-y-2">
                                <Label>Background Color</Label>
                                <div className="flex space-x-2">
                                  <input
                                    type="color"
                                    value={session.backgroundColor}
                                    onChange={(e) =>
                                      updateSettings({
                                        backgroundColor: e.target.value,
                                      })
                                    }
                                    className="w-12 h-8 rounded border border-border"
                                  />
                                  <Input
                                    value={session.backgroundColor}
                                    onChange={(e) =>
                                      updateSettings({
                                        backgroundColor: e.target.value,
                                      })
                                    }
                                    className="flex-1"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>
                                  Background Opacity: {session.backgroundOpacity}%
                                </Label>
                                <Slider
                                  value={[session.backgroundOpacity]}
                                  onValueChange={([value]) =>
                                    updateSettings({ backgroundOpacity: value })
                                  }
                                  min={0}
                                  max={100}
                                  step={5}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bible">
            <BibleControls
              displayMode={displayMode}
              setDisplayMode={setDisplayMode}
              onContentLoad={(content, title) => {
                updateLyrics(content, title);
                updateSettings({ bibleOutputEnabled: content.trim().length > 0 });
                if (content.trim().length > 0) {
                  toast({
                    title: "Bible verse loaded",
                    description: `${title} loaded to display`,
                  });
                }
              }}
              onVerseSelect={(verse, reference) => {}}
              showLoadButton={true}
            />
          </TabsContent>

          <TabsContent value="help">
            <div className="space-y-6">
              {/* Documentation Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Documentation & Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Bible Resources</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        For downloading additional Bible versions:
                      </p>
                      <a 
                        href="https://github.com/Beblia/Holy-Bible-XML-Format" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                      >
                        Holy Bible XML Format Repository
                      </a>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Display Setup Guides</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Available setup guides:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>OBS_SETUP_GUIDE.md - General OBS integration setup</li>
                        <li>DUAL_DISPLAY_SETUP.md - Setting up dual displays</li>
                        <li>OBS_DOCK_SETUP.md - Configuring OBS dock interface</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Display URLs</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Access these URLs for different display modes:
                      </p>
                      <div className="space-y-1 text-sm">
                        <div><strong>Lower Third:</strong> /display/lower-third</div>
                        <div><strong>Fullscreen:</strong> /display/fullscreen</div>
                        <div><strong>OBS Dock:</strong> /obs-dock</div>
                        <div><strong>Standard Display:</strong> /display</div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Features</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Real-time WebSocket synchronization across all displays</li>
                        <li>Multi-language Bible support (Telugu and English)</li>
                        <li>Font detection and custom typography</li>
                        <li>Background customization and text effects</li>
                        <li>OBS integration with browser sources</li>
                        <li>Dual display support for projector and streaming</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="display">
            <div className="space-y-6">
              {/* Font Detection Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Font Detection Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <FontPermissionBanner />
                </CardContent>
              </Card>
              
              {/* Display Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Lyrics Display Settings</h3>
                  <DisplaySettings type="lyrics" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Bible Display Settings</h3>
                  <DisplaySettings type="bible" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}