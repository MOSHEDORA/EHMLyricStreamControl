
import { useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { BibleControls } from "@/components/bible-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Send, ArrowLeft, Settings } from "lucide-react";
import { Link } from "wouter";

export default function Bible() {
  // Hardcoded settings
  const settings = {
    fontSize: 16,
    fontFamily: 'Arial',
    textColor: '#000000',
    backgroundColor: '#ffffff'
  };
  const sessionId = "default";
  const { updateLyrics } = useWebSocket(sessionId);
  const { toast } = useToast();
  const [selectedContent, setSelectedContent] = useState<{content: string, title: string} | null>(null);

  const handleContentLoad = (content: string, title: string) => {
    setSelectedContent({ content, title });
    // Auto-send to display when content is loaded
    updateLyrics(content, title);
  };

  const sendToDisplay = () => {
    if (!selectedContent) return;
    
    updateLyrics(selectedContent.content, selectedContent.title);
  };

  const handleVerseSelect = (verse: any, reference: string) => {
    // Removed toast to prevent continuous popups
  };

  // Apply Bible Navigator settings
  const navigationStyle = {
    fontSize: `${settings.fontSize}px`,
    fontFamily: settings.fontFamily,
    color: settings.textColor,
    backgroundColor: settings.backgroundColor,
  };

  return (
    <div className="min-h-screen bg-background p-4" style={navigationStyle}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Telugu Bible</h1>
                <p className="text-muted-foreground">Browse, search, and display Bible content</p>
              </div>
            </div>
          </div>
          
          {selectedContent && (
            <Button onClick={sendToDisplay} className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Send to Display</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bible Controls and Settings */}
          <div>
            <Tabs defaultValue="controls" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="controls">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Bible Controls
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Display Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="controls">
                <BibleControls 
                  onContentLoad={handleContentLoad}
                  onVerseSelect={handleVerseSelect}
                  showLoadButton={false}
                  displayMode="bible"
                  setDisplayMode={() => {}}
                />
              </TabsContent>
              
              <TabsContent value="settings">
                <div className="p-4">
                  <p className="text-muted-foreground">Display settings are now managed individually per URL. Visit the specific Bible display pages (/bible-lower-third or /bible-fullscreen) to configure their appearance settings.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Selected Content Preview */}
          <div>
            {selectedContent ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Selected Content</span>
                    <Button onClick={sendToDisplay} size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Send to Display
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="font-medium text-lg">{selectedContent.title}</div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        {selectedContent.content.split('\n').map((line, index) => (
                          <div key={index} className="text-sm leading-relaxed">
                            {line.trim() && (
                              <div className="p-2 bg-muted rounded">
                                {line}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No content selected</h3>
                  <p className="text-muted-foreground">
                    Select a book, chapter, or verse from the Bible controls to preview it here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">1. Navigate</h4>
                <p className="text-muted-foreground">
                  Use the search box or dropdowns to find specific books, chapters, and verses.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. Select</h4>
                <p className="text-muted-foreground">
                  Click on any chapter or verse to load it. The content will appear in the preview.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">3. Display</h4>
                <p className="text-muted-foreground">
                  Click "Send to Display" to show the selected content on your main display or OBS.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
