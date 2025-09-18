
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Eye, 
  EyeOff,
  Download,
  Upload,
  RotateCcw
} from "lucide-react";

interface DisplaySettings {
  // Text styling
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  textColor: string;
  strokeWidth: number;
  strokeColor: string;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right';
  
  // Background settings
  backgroundEnabled: boolean;
  backgroundType: 'color' | 'gradient' | 'image';
  backgroundColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: string;
  backgroundImage: string;
  backgroundOpacity: number;
  backgroundSize: 'cover' | 'contain' | 'auto';
  backgroundPosition: string;
  
  // Shadow and effects
  textShadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

interface DisplaySettingsProps {
  type: 'bible' | 'lyrics';
  onSettingsChange?: (settings: DisplaySettings) => void;
}

const defaultSettings: DisplaySettings = {
  fontSize: 24,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  textColor: '#ffffff',
  strokeWidth: 0,
  strokeColor: '#000000',
  lineHeight: 1.5,
  letterSpacing: 0,
  textAlign: 'center',
  
  backgroundEnabled: false,
  backgroundType: 'color',
  backgroundColor: '#000000',
  gradientStart: '#000000',
  gradientEnd: '#333333',
  gradientDirection: 'to bottom',
  backgroundImage: '',
  backgroundOpacity: 100,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  
  textShadow: false,
  shadowColor: '#000000',
  shadowBlur: 4,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
};

const fontFamilies = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
  'Trebuchet MS', 'Arial Black', 'Impact', 'Courier New', 'Lucida Console'
];

const fontWeights = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
  { value: '100', label: 'Thin' },
  { value: '300', label: 'Light' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' },
];

const gradientDirections = [
  { value: 'to bottom', label: 'Top to Bottom' },
  { value: 'to top', label: 'Bottom to Top' },
  { value: 'to right', label: 'Left to Right' },
  { value: 'to left', label: 'Right to Left' },
  { value: 'to bottom right', label: 'Diagonal ↘' },
  { value: 'to bottom left', label: 'Diagonal ↙' },
  { value: 'to top right', label: 'Diagonal ↗' },
  { value: 'to top left', label: 'Diagonal ↖' },
];

const backgroundPositions = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top left', label: 'Top Left' },
  { value: 'top right', label: 'Top Right' },
  { value: 'bottom left', label: 'Bottom Left' },
  { value: 'bottom right', label: 'Bottom Right' },
];

export function DisplaySettings({ type, onSettingsChange }: DisplaySettingsProps) {
  const [settings, setSettings] = useState<DisplaySettings>(defaultSettings);
  const [previewVisible, setPreviewVisible] = useState(true);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem(`display-settings-${type}`);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, [type]);

  const updateSetting = <K extends keyof DisplaySettings>(
    key: K,
    value: DisplaySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem(`display-settings-${type}`, JSON.stringify(newSettings));
    
    // Notify parent component
    onSettingsChange?.(newSettings);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(`display-settings-${type}`);
    onSettingsChange?.(defaultSettings);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateSetting('backgroundImage', result);
        updateSetting('backgroundType', 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const getPreviewStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      fontSize: `${settings.fontSize}px`,
      fontFamily: settings.fontFamily,
      fontWeight: settings.fontWeight,
      color: settings.textColor,
      lineHeight: settings.lineHeight,
      letterSpacing: `${settings.letterSpacing}px`,
      textAlign: settings.textAlign,
      padding: '20px',
      minHeight: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: settings.textAlign === 'center' ? 'center' : settings.textAlign === 'right' ? 'flex-end' : 'flex-start',
    };

    // Text stroke
    if (settings.strokeWidth > 0) {
      style.WebkitTextStroke = `${settings.strokeWidth}px ${settings.strokeColor}`;
    }

    // Text shadow
    if (settings.textShadow) {
      style.textShadow = `${settings.shadowOffsetX}px ${settings.shadowOffsetY}px ${settings.shadowBlur}px ${settings.shadowColor}`;
    }

    // Background
    if (settings.backgroundEnabled) {
      switch (settings.backgroundType) {
        case 'color':
          style.backgroundColor = settings.backgroundColor;
          break;
        case 'gradient':
          style.background = `linear-gradient(${settings.gradientDirection}, ${settings.gradientStart}, ${settings.gradientEnd})`;
          break;
        case 'image':
          if (settings.backgroundImage) {
            style.backgroundImage = `url(${settings.backgroundImage})`;
            style.backgroundSize = settings.backgroundSize;
            style.backgroundPosition = settings.backgroundPosition;
            style.backgroundRepeat = 'no-repeat';
          }
          break;
      }
      
      if (settings.backgroundOpacity < 100) {
        style.opacity = settings.backgroundOpacity / 100;
      }
    }

    return style;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Palette className="h-5 w-5 mr-2 text-primary" />
              {type === 'bible' ? 'Bible' : 'Lyrics'} Display Settings
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewVisible(!previewVisible)}
              >
                {previewVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetSettings}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="text" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text">Text Style</TabsTrigger>
              <TabsTrigger value="background">Background</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              {/* Font Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select value={settings.fontFamily} onValueChange={(value) => updateSetting('fontFamily', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Font Weight</Label>
                  <Select value={settings.fontWeight} onValueChange={(value) => updateSetting('fontWeight', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontWeights.map((weight) => (
                        <SelectItem key={weight.value} value={weight.value}>
                          {weight.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label>Font Size: {settings.fontSize}px</Label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting('fontSize', value)}
                  min={12}
                  max={100}
                  step={1}
                />
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={settings.textColor}
                    onChange={(e) => updateSetting('textColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={settings.textColor}
                    onChange={(e) => updateSetting('textColor', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Text Alignment */}
              <div className="space-y-2">
                <Label>Text Alignment</Label>
                <Select value={settings.textAlign} onValueChange={(value: 'left' | 'center' | 'right') => updateSetting('textAlign', value)}>
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

              {/* Line Height */}
              <div className="space-y-2">
                <Label>Line Height: {settings.lineHeight}</Label>
                <Slider
                  value={[settings.lineHeight]}
                  onValueChange={([value]) => updateSetting('lineHeight', value)}
                  min={0.8}
                  max={3}
                  step={0.1}
                />
              </div>

              {/* Letter Spacing */}
              <div className="space-y-2">
                <Label>Letter Spacing: {settings.letterSpacing}px</Label>
                <Slider
                  value={[settings.letterSpacing]}
                  onValueChange={([value]) => updateSetting('letterSpacing', value)}
                  min={-5}
                  max={20}
                  step={0.5}
                />
              </div>
            </TabsContent>

            <TabsContent value="background" className="space-y-4">
              {/* Background Enable/Disable */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.backgroundEnabled}
                  onCheckedChange={(checked) => updateSetting('backgroundEnabled', checked)}
                />
                <Label>Enable Background</Label>
              </div>

              {settings.backgroundEnabled && (
                <>
                  {/* Background Type */}
                  <div className="space-y-2">
                    <Label>Background Type</Label>
                    <Select value={settings.backgroundType} onValueChange={(value: 'color' | 'gradient' | 'image') => updateSetting('backgroundType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="color">Solid Color</SelectItem>
                        <SelectItem value="gradient">Gradient</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Solid Color */}
                  {settings.backgroundType === 'color' && (
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={settings.backgroundColor}
                          onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={settings.backgroundColor}
                          onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Gradient */}
                  {settings.backgroundType === 'gradient' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Color</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={settings.gradientStart}
                              onChange={(e) => updateSetting('gradientStart', e.target.value)}
                              className="w-16 h-8"
                            />
                            <Input
                              type="text"
                              value={settings.gradientStart}
                              onChange={(e) => updateSetting('gradientStart', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>End Color</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={settings.gradientEnd}
                              onChange={(e) => updateSetting('gradientEnd', e.target.value)}
                              className="w-16 h-8"
                            />
                            <Input
                              type="text"
                              value={settings.gradientEnd}
                              onChange={(e) => updateSetting('gradientEnd', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Direction</Label>
                        <Select value={settings.gradientDirection} onValueChange={(value) => updateSetting('gradientDirection', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {gradientDirections.map((dir) => (
                              <SelectItem key={dir.value} value={dir.value}>
                                {dir.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  {settings.backgroundType === 'image' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Background Image</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="flex-1"
                          />
                          {settings.backgroundImage && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateSetting('backgroundImage', '')}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>

                      {settings.backgroundImage && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Image Size</Label>
                              <Select value={settings.backgroundSize} onValueChange={(value: 'cover' | 'contain' | 'auto') => updateSetting('backgroundSize', value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cover">Cover</SelectItem>
                                  <SelectItem value="contain">Contain</SelectItem>
                                  <SelectItem value="auto">Auto</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Position</Label>
                              <Select value={settings.backgroundPosition} onValueChange={(value) => updateSetting('backgroundPosition', value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {backgroundPositions.map((pos) => (
                                    <SelectItem key={pos.value} value={pos.value}>
                                      {pos.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Background Opacity */}
                  <div className="space-y-2">
                    <Label>Background Opacity: {settings.backgroundOpacity}%</Label>
                    <Slider
                      value={[settings.backgroundOpacity]}
                      onValueChange={([value]) => updateSetting('backgroundOpacity', value)}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="effects" className="space-y-4">
              {/* Text Stroke */}
              <div className="space-y-4">
                <h4 className="font-medium">Text Stroke</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stroke Width: {settings.strokeWidth}px</Label>
                    <Slider
                      value={[settings.strokeWidth]}
                      onValueChange={([value]) => updateSetting('strokeWidth', value)}
                      min={0}
                      max={10}
                      step={0.5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stroke Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={settings.strokeColor}
                        onChange={(e) => updateSetting('strokeColor', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={settings.strokeColor}
                        onChange={(e) => updateSetting('strokeColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Text Shadow */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.textShadow}
                    onCheckedChange={(checked) => updateSetting('textShadow', checked)}
                  />
                  <Label>Text Shadow</Label>
                </div>

                {settings.textShadow && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Shadow Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={settings.shadowColor}
                          onChange={(e) => updateSetting('shadowColor', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={settings.shadowColor}
                          onChange={(e) => updateSetting('shadowColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Blur: {settings.shadowBlur}px</Label>
                      <Slider
                        value={[settings.shadowBlur]}
                        onValueChange={([value]) => updateSetting('shadowBlur', value)}
                        min={0}
                        max={20}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Offset X: {settings.shadowOffsetX}px</Label>
                      <Slider
                        value={[settings.shadowOffsetX]}
                        onValueChange={([value]) => updateSetting('shadowOffsetX', value)}
                        min={-20}
                        max={20}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Offset Y: {settings.shadowOffsetY}px</Label>
                      <Slider
                        value={[settings.shadowOffsetY]}
                        onValueChange={([value]) => updateSetting('shadowOffsetY', value)}
                        min={-20}
                        max={20}
                        step={1}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview */}
      {previewVisible && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              style={getPreviewStyle()}
              className="border rounded-lg"
            >
              {type === 'bible' 
                ? "ప్రభువు నా కాపరి; నేను లేమిపడడను. తన మంచి కొలిమలలో ఆయన నన్ను పండుకొనిస్తాడు."
                : "యేసు నామమున ప్రార్థన చేస్తాను\nఅతని కృపలో నా నమ్మకం ఉంది"
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
