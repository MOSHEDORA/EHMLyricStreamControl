import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Monitor, Settings2 } from "lucide-react";
import {
  useLyricsLowerThirdSettings,
  useLyricsFullscreenSettings,
  useBibleLowerThirdSettings,
  useBibleFullscreenSettings
} from "@/hooks/use-display-settings";
import { RESOLUTION_PRESETS, createCustomResolution, type Resolution } from "@/settings/resolution";

export function DisplaySettingsPanel() {
  const lyricsLowerThird = useLyricsLowerThirdSettings();
  const lyricsFullscreen = useLyricsFullscreenSettings();
  const bibleLowerThird = useBibleLowerThirdSettings();
  const bibleFullscreen = useBibleFullscreenSettings();

  const [customResolution, setCustomResolution] = useState({ width: 1920, height: 1080 });

  const renderResolutionSelector = (
    currentResolution: Resolution,
    onResolutionChange: (resolution: Resolution) => void,
    displayType: string
  ) => {
    const presetKey = Object.keys(RESOLUTION_PRESETS).find(
      key => RESOLUTION_PRESETS[key].width === currentResolution.width && 
             RESOLUTION_PRESETS[key].height === currentResolution.height
    ) || 'custom';

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          <Label className="text-sm font-medium">Display Resolution</Label>
        </div>
        
        <Select 
          value={presetKey} 
          onValueChange={(value) => {
            if (value === 'custom') {
              onResolutionChange(createCustomResolution(customResolution.width, customResolution.height, currentResolution.scaleMode));
            } else {
              onResolutionChange(RESOLUTION_PRESETS[value]);
            }
          }}
          data-testid={`select-resolution-${displayType}`}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(RESOLUTION_PRESETS).map(([key, preset]) => (
              <SelectItem key={key} value={key}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {presetKey === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`width-${displayType}`}>Width</Label>
              <Input
                id={`width-${displayType}`}
                type="number"
                value={customResolution.width}
                onChange={(e) => {
                  const newWidth = parseInt(e.target.value) || 1920;
                  setCustomResolution(prev => ({ ...prev, width: newWidth }));
                  onResolutionChange(createCustomResolution(newWidth, customResolution.height, currentResolution.scaleMode));
                }}
                data-testid={`input-width-${displayType}`}
              />
            </div>
            <div>
              <Label htmlFor={`height-${displayType}`}>Height</Label>
              <Input
                id={`height-${displayType}`}
                type="number"
                value={customResolution.height}
                onChange={(e) => {
                  const newHeight = parseInt(e.target.value) || 1080;
                  setCustomResolution(prev => ({ ...prev, height: newHeight }));
                  onResolutionChange(createCustomResolution(customResolution.width, newHeight, currentResolution.scaleMode));
                }}
                data-testid={`input-height-${displayType}`}
              />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor={`scale-mode-${displayType}`}>Scale Mode</Label>
          <Select 
            value={currentResolution.scaleMode} 
            onValueChange={(value: Resolution['scaleMode']) => {
              onResolutionChange({ ...currentResolution, scaleMode: value });
            }}
            data-testid={`select-scale-mode-${displayType}`}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fit">Fit (letterbox/pillarbox)</SelectItem>
              <SelectItem value="fill">Fill (crop if needed)</SelectItem>
              <SelectItem value="stretch">Stretch (may distort)</SelectItem>
              <SelectItem value="1:1">1:1 (actual size)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderFontSettings = (
    fontSize: number,
    fontFamily: string,
    textColor: string,
    onUpdate: (updates: any) => void,
    displayType: string
  ) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`font-size-${displayType}`}>Font Size</Label>
        <Slider
          value={[fontSize]}
          onValueChange={([value]) => onUpdate({ fontSize: value })}
          min={12}
          max={200}
          step={2}
          className="mt-2"
          data-testid={`slider-font-size-${displayType}`}
        />
        <div className="text-sm text-muted-foreground mt-1">{fontSize}px</div>
      </div>

      <div>
        <Label htmlFor={`font-family-${displayType}`}>Font Family</Label>
        <Select 
          value={fontFamily} 
          onValueChange={(value) => onUpdate({ fontFamily: value })}
          data-testid={`select-font-family-${displayType}`}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Roboto">Roboto</SelectItem>
            <SelectItem value="Open Sans">Open Sans</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor={`text-color-${displayType}`}>Text Color</Label>
        <Input
          id={`text-color-${displayType}`}
          type="color"
          value={textColor}
          onChange={(e) => onUpdate({ textColor: e.target.value })}
          data-testid={`input-text-color-${displayType}`}
        />
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Display Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="lyrics-lower-third" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lyrics-lower-third" data-testid="tab-lyrics-lower-third">
              Lyrics Lower Third
            </TabsTrigger>
            <TabsTrigger value="lyrics-fullscreen" data-testid="tab-lyrics-fullscreen">
              Lyrics Fullscreen
            </TabsTrigger>
            <TabsTrigger value="bible-lower-third" data-testid="tab-bible-lower-third">
              Bible Lower Third
            </TabsTrigger>
            <TabsTrigger value="bible-fullscreen" data-testid="tab-bible-fullscreen">
              Bible Fullscreen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lyrics-lower-third" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Lyrics Lower Third Settings</h3>
              {renderResolutionSelector(
                lyricsLowerThird.settings.displayResolution,
                (resolution) => lyricsLowerThird.updateSettings({ displayResolution: resolution }),
                'lyrics-lower-third'
              )}
              
              <Separator className="my-6" />
              
              {renderFontSettings(
                lyricsLowerThird.settings.fontSize,
                lyricsLowerThird.settings.fontFamily,
                lyricsLowerThird.settings.textColor,
                lyricsLowerThird.updateSettings,
                'lyrics-lower-third'
              )}

              <div className="mt-6 flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={lyricsLowerThird.resetSettings}
                  data-testid="button-reset-lyrics-lower-third"
                >
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lyrics-fullscreen" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Lyrics Fullscreen Settings</h3>
              {renderResolutionSelector(
                lyricsFullscreen.settings.displayResolution,
                (resolution) => lyricsFullscreen.updateSettings({ displayResolution: resolution }),
                'lyrics-fullscreen'
              )}
              
              <Separator className="my-6" />
              
              {renderFontSettings(
                lyricsFullscreen.settings.fontSize,
                lyricsFullscreen.settings.fontFamily,
                lyricsFullscreen.settings.textColor,
                lyricsFullscreen.updateSettings,
                'lyrics-fullscreen'
              )}

              <div className="mt-6 flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={lyricsFullscreen.resetSettings}
                  data-testid="button-reset-lyrics-fullscreen"
                >
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bible-lower-third" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Bible Lower Third Settings</h3>
              {renderResolutionSelector(
                bibleLowerThird.settings.displayResolution,
                (resolution) => bibleLowerThird.updateSettings({ displayResolution: resolution }),
                'bible-lower-third'
              )}
              
              <Separator className="my-6" />
              
              {renderFontSettings(
                bibleLowerThird.settings.fontSize,
                bibleLowerThird.settings.fontFamily,
                bibleLowerThird.settings.textColor,
                bibleLowerThird.updateSettings,
                'bible-lower-third'
              )}

              <div className="mt-6 flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={bibleLowerThird.resetSettings}
                  data-testid="button-reset-bible-lower-third"
                >
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bible-fullscreen" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Bible Fullscreen Settings</h3>
              {renderResolutionSelector(
                bibleFullscreen.settings.displayResolution,
                (resolution) => bibleFullscreen.updateSettings({ displayResolution: resolution }),
                'bible-fullscreen'
              )}
              
              <Separator className="my-6" />
              
              {renderFontSettings(
                bibleFullscreen.settings.fontSize,
                bibleFullscreen.settings.fontFamily,
                bibleFullscreen.settings.textColor,
                bibleFullscreen.updateSettings,
                'bible-fullscreen'
              )}

              <div className="mt-6 flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={bibleFullscreen.resetSettings}
                  data-testid="button-reset-bible-fullscreen"
                >
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}