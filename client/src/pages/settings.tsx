import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Settings, Save, RotateCcw, Monitor, Tv, Smartphone, Dock, Upload, X } from "lucide-react";
import type { 
  LyricsLowerThirdSettings, 
  LyricsFullscreenSettings, 
  BibleLowerThirdSettings, 
  BibleFullscreenSettings, 
  ControlPanelSettings, 
  OBSDockSettings 
} from "@shared/schema";

type DisplayType = 'lyrics-lower-third' | 'lyrics-fullscreen' | 'bible-lower-third' | 'bible-fullscreen' | 'control-panel' | 'obs-dock';

// Helper function to make API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Component for common form fields
function FontSettings({ 
  settings, 
  updateSettings 
}: { 
  settings: any; 
  updateSettings: (updates: any) => void; 
}) {
  const [uploadedFonts, setUploadedFonts] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const commonFonts = [
    'Ramabhadra', 'Arial', 'Times New Roman', 'Verdana', 'Georgia', 'Trebuchet MS',
    'Tahoma', 'Impact', 'Comic Sans MS', 'Courier New', 'Palatino'
  ];

  // Load uploaded fonts from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('uploadedFonts');
    if (saved) {
      setUploadedFonts(JSON.parse(saved));
    }
  }, []);

  // Handle font file upload
  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['font/ttf', 'font/otf', 'font/woff', 'font/woff2', 'application/font-woff', 'application/font-woff2'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const validExtensions = ['ttf', 'otf', 'woff', 'woff2'];

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid font file (TTF, OTF, WOFF, WOFF2)",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Font file must be smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const fontName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        
        // Create font-face CSS
        const fontFormat = fileExtension === 'ttf' ? 'truetype' : 
                          fileExtension === 'otf' ? 'opentype' :
                          fileExtension === 'woff' ? 'woff' :
                          fileExtension === 'woff2' ? 'woff2' : 'truetype';
        
        const fontFaceCSS = `
          @font-face {
            font-family: '${fontName}';
            src: url('${dataUrl}') format('${fontFormat}');
            font-display: swap;
          }
        `;
        
        // Add CSS to document
        const styleElement = document.createElement('style');
        styleElement.textContent = fontFaceCSS;
        styleElement.id = `font-${fontName}`;
        document.head.appendChild(styleElement);
        
        // Save font info
        const newUploadedFonts = [...uploadedFonts, fontName];
        setUploadedFonts(newUploadedFonts);
        localStorage.setItem('uploadedFonts', JSON.stringify(newUploadedFonts));
        localStorage.setItem(`fontData-${fontName}`, dataUrl);
        localStorage.setItem(`fontFormat-${fontName}`, fontFormat);
        
        toast({
          title: "Font uploaded successfully",
          description: `${fontName} is now available in the font list`
        });
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload font file",
        variant: "destructive"
      });
    }
  };

  // Remove uploaded font
  const removeUploadedFont = (fontName: string) => {
    const newUploadedFonts = uploadedFonts.filter(f => f !== fontName);
    setUploadedFonts(newUploadedFonts);
    localStorage.setItem('uploadedFonts', JSON.stringify(newUploadedFonts));
    localStorage.removeItem(`fontData-${fontName}`);
    localStorage.removeItem(`fontFormat-${fontName}`);
    
    // Remove CSS
    const styleElement = document.getElementById(`font-${fontName}`);
    if (styleElement) {
      styleElement.remove();
    }
    
    toast({
      title: "Font removed",
      description: `${fontName} has been removed`
    });
  };

  // Load uploaded fonts on component mount
  useEffect(() => {
    uploadedFonts.forEach(fontName => {
      const dataUrl = localStorage.getItem(`fontData-${fontName}`);
      const fontFormat = localStorage.getItem(`fontFormat-${fontName}`);
      
      if (dataUrl && fontFormat && !document.getElementById(`font-${fontName}`)) {
        const fontFaceCSS = `
          @font-face {
            font-family: '${fontName}';
            src: url('${dataUrl}') format('${fontFormat}');
            font-display: swap;
          }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = fontFaceCSS;
        styleElement.id = `font-${fontName}`;
        document.head.appendChild(styleElement);
      }
    });
  }, [uploadedFonts]);

  // Combine common fonts with uploaded fonts
  const allFonts = [...commonFonts, ...uploadedFonts];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="fontFamily">Font Family</Label>
        <Select 
          value={settings.fontFamily} 
          onValueChange={(value) => updateSettings({ fontFamily: value })}
        >
          <SelectTrigger data-testid="select-font-family">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {allFonts.map((font) => (
              <SelectItem key={font} value={font}>
                <div className="flex items-center justify-between w-full">
                  <span>{font}</span>
                  {uploadedFonts.includes(font) && (
                    <span className="text-xs text-muted-foreground ml-2">(Custom)</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Font Upload Section */}
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload-font"
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload Font
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              onChange={handleFontUpload}
              className="hidden"
              data-testid="input-font-file"
            />
          </div>
          
          {/* Display uploaded fonts with remove option */}
          {uploadedFonts.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Custom Fonts:</Label>
              {uploadedFonts.map((font) => (
                <div key={font} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                  <span>{font}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUploadedFont(font)}
                    className="h-6 w-6 p-0"
                    data-testid={`button-remove-font-${font}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="fontSize">Font Size ({settings.fontSize}px)</Label>
        <Slider
          value={[settings.fontSize]}
          onValueChange={(value) => updateSettings({ fontSize: value[0] })}
          min={8}
          max={100}
          step={1}
          className="mt-2"
          data-testid="slider-font-size"
        />
      </div>

      <div>
        <Label htmlFor="textColor">Text Color</Label>
        <Input
          type="color"
          value={settings.textColor}
          onChange={(e) => updateSettings({ textColor: e.target.value })}
          data-testid="input-text-color"
        />
      </div>

      <div>
        <Label htmlFor="textAlign">Text Alignment</Label>
        <Select 
          value={settings.textAlign} 
          onValueChange={(value) => updateSettings({ textAlign: value })}
        >
          <SelectTrigger data-testid="select-text-align">
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
  );
}

// Component for layout settings
function LayoutSettings({ 
  settings, 
  updateSettings,
  showDisplayLines = true,
  showPadding = true,
  showMargin = false
}: { 
  settings: any; 
  updateSettings: (updates: any) => void;
  showDisplayLines?: boolean;
  showPadding?: boolean;
  showMargin?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {showDisplayLines && (
        <div>
          <Label htmlFor="displayLines">
            {settings.versesPerScreen !== undefined ? 'Verses per Screen' : 'Display Lines'} ({settings.displayLines || settings.versesPerScreen})
          </Label>
          <Slider
            value={[settings.displayLines || settings.versesPerScreen]}
            onValueChange={(value) => updateSettings(settings.versesPerScreen !== undefined ? { versesPerScreen: value[0] } : { displayLines: value[0] })}
            min={1}
            max={10}
            step={1}
            className="mt-2"
            data-testid="slider-display-lines"
          />
        </div>
      )}

      <div>
        <Label htmlFor="lineHeight">Line Height ({settings.lineHeight})</Label>
        <Slider
          value={[settings.lineHeight]}
          onValueChange={(value) => updateSettings({ lineHeight: value[0] })}
          min={0.5}
          max={3}
          step={0.1}
          className="mt-2"
          data-testid="slider-line-height"
        />
      </div>

      {showPadding && (
        <div>
          <Label htmlFor="padding">Padding ({settings.padding}px)</Label>
          <Slider
            value={[settings.padding]}
            onValueChange={(value) => updateSettings({ padding: value[0] })}
            min={0}
            max={100}
            step={5}
            className="mt-2"
            data-testid="slider-padding"
          />
        </div>
      )}

      {showMargin && (
        <div>
          <Label htmlFor="margin">Margin ({settings.margin}px)</Label>
          <Slider
            value={[settings.margin]}
            onValueChange={(value) => updateSettings({ margin: value[0] })}
            min={0}
            max={100}
            step={5}
            className="mt-2"
            data-testid="slider-margin"
          />
        </div>
      )}
    </div>
  );
}

// Individual setting components for each display type
export function LyricsLowerThirdSettings() {
  const displayType = 'lyrics-lower-third';
  const { toast } = useToast();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['display-settings', displayType],
    queryFn: () => apiRequest(`/api/display-settings/${displayType}`),
  });

  const mutation = useMutation({
    mutationFn: (settings: LyricsLowerThirdSettings) => 
      apiRequest(`/api/display-settings/${displayType}`, {
        method: 'POST',
        body: JSON.stringify({ settings }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['display-settings', displayType] });
      toast({ title: "Settings saved", description: "Lyrics Lower Third settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    },
  });

  const [settings, setSettings] = useState<LyricsLowerThirdSettings>({
    displayLines: 2,
    fontSize: 32,
    fontFamily: 'Ramabhadra',
    textColor: '#ffffff',
    textAlign: 'center',
    lineHeight: 1.2,
    fontWeight: 'normal',
    maxHeight: '200px',
    padding: 20,
  });

  useEffect(() => {
    if (settingsData?.settings) {
      setSettings(settingsData.settings);
    }
  }, [settingsData]);

  const updateSettings = (updates: Partial<LyricsLowerThirdSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    mutation.mutate(settings);
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Monitor className="h-5 w-5 mr-2" />
          Lyrics Lower Third Display
        </h3>
        <Button onClick={handleSave} disabled={mutation.isPending} data-testid="button-save-lyrics-lower-third">
          <Save className="h-4 w-4 mr-2" />
          {mutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <FontSettings settings={settings} updateSettings={updateSettings} />
      
      <LayoutSettings 
        settings={settings} 
        updateSettings={updateSettings}
        showDisplayLines={true}
        showPadding={true}
        showMargin={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fontWeight">Font Weight</Label>
          <Select value={settings.fontWeight} onValueChange={(value) => updateSettings({ fontWeight: value as 'normal' | 'bold' })}>
            <SelectTrigger data-testid="select-font-weight">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="maxHeight">Max Height</Label>
          <Input
            value={settings.maxHeight}
            onChange={(e) => updateSettings({ maxHeight: e.target.value })}
            placeholder="e.g., 200px"
            data-testid="input-max-height"
          />
        </div>
      </div>
    </div>
  );
}

export function LyricsFullscreenSettings() {
  const displayType = 'lyrics-fullscreen';
  const { toast } = useToast();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['display-settings', displayType],
    queryFn: () => apiRequest(`/api/display-settings/${displayType}`),
  });

  const mutation = useMutation({
    mutationFn: (settings: LyricsFullscreenSettings) => 
      apiRequest(`/api/display-settings/${displayType}`, {
        method: 'POST',
        body: JSON.stringify({ settings }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['display-settings', displayType] });
      toast({ title: "Settings saved", description: "Lyrics Fullscreen settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    },
  });

  const [settings, setSettings] = useState<LyricsFullscreenSettings>({
    displayLines: 4,
    fontSize: 48,
    fontFamily: 'Ramabhadra',
    textColor: '#ffffff',
    textAlign: 'center',
    lineHeight: 1.3,
    fontWeight: 'normal',
    textTransform: 'none',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    padding: 40,
    margin: 40,
  });

  useEffect(() => {
    if (settingsData?.settings) {
      setSettings(settingsData.settings);
    }
  }, [settingsData]);

  const updateSettings = (updates: Partial<LyricsFullscreenSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    mutation.mutate(settings);
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Tv className="h-5 w-5 mr-2" />
          Lyrics Fullscreen Display
        </h3>
        <Button onClick={handleSave} disabled={mutation.isPending} data-testid="button-save-lyrics-fullscreen">
          <Save className="h-4 w-4 mr-2" />
          {mutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <FontSettings settings={settings} updateSettings={updateSettings} />
      
      <LayoutSettings 
        settings={settings} 
        updateSettings={updateSettings}
        showDisplayLines={true}
        showPadding={true}
        showMargin={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fontWeight">Font Weight</Label>
          <Select value={settings.fontWeight} onValueChange={(value) => updateSettings({ fontWeight: value as 'normal' | 'bold' })}>
            <SelectTrigger data-testid="select-font-weight">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="textTransform">Text Transform</Label>
          <Select value={settings.textTransform} onValueChange={(value) => updateSettings({ textTransform: value as any })}>
            <SelectTrigger data-testid="select-text-transform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="uppercase">Uppercase</SelectItem>
              <SelectItem value="lowercase">Lowercase</SelectItem>
              <SelectItem value="capitalize">Capitalize</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="textShadow">Text Shadow</Label>
          <Input
            value={settings.textShadow}
            onChange={(e) => updateSettings({ textShadow: e.target.value })}
            placeholder="e.g., 2px 2px 4px rgba(0,0,0,0.8)"
            data-testid="input-text-shadow"
          />
        </div>
      </div>
    </div>
  );
}

export function BibleLowerThirdSettings() {
  const displayType = 'bible-lower-third';
  const { toast } = useToast();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['display-settings', displayType],
    queryFn: () => apiRequest(`/api/display-settings/${displayType}`),
  });

  const mutation = useMutation({
    mutationFn: (settings: BibleLowerThirdSettings) => 
      apiRequest(`/api/display-settings/${displayType}`, {
        method: 'POST',
        body: JSON.stringify({ settings }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['display-settings', displayType] });
      toast({ title: "Settings saved", description: "Bible Lower Third settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    },
  });

  const [settings, setSettings] = useState<BibleLowerThirdSettings>({
    displayLines: 2,
    fontSize: 32,
    fontFamily: 'Ramabhadra',
    textColor: '#ffffff',
    textAlign: 'center',
    lineHeight: 1.2,
    fontWeight: 'normal',
    maxHeight: '200px',
    padding: 20,
  });

  useEffect(() => {
    if (settingsData?.settings) {
      setSettings(settingsData.settings);
    }
  }, [settingsData]);

  const updateSettings = (updates: Partial<BibleLowerThirdSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    mutation.mutate(settings);
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Monitor className="h-5 w-5 mr-2" />
          Bible Lower Third Display
        </h3>
        <Button onClick={handleSave} disabled={mutation.isPending} data-testid="button-save-bible-lower-third">
          <Save className="h-4 w-4 mr-2" />
          {mutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <FontSettings settings={settings} updateSettings={updateSettings} />
      
      <LayoutSettings 
        settings={settings} 
        updateSettings={updateSettings}
        showDisplayLines={true}
        showPadding={true}
        showMargin={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fontWeight">Font Weight</Label>
          <Select value={settings.fontWeight} onValueChange={(value) => updateSettings({ fontWeight: value as 'normal' | 'bold' })}>
            <SelectTrigger data-testid="select-font-weight">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="maxHeight">Max Height</Label>
          <Input
            value={settings.maxHeight}
            onChange={(e) => updateSettings({ maxHeight: e.target.value })}
            placeholder="e.g., 200px"
            data-testid="input-max-height"
          />
        </div>
      </div>
    </div>
  );
}

export function BibleFullscreenSettings() {
  const displayType = 'bible-fullscreen';
  const { toast } = useToast();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['display-settings', displayType],
    queryFn: () => apiRequest(`/api/display-settings/${displayType}`),
  });

  const mutation = useMutation({
    mutationFn: (settings: BibleFullscreenSettings) => 
      apiRequest(`/api/display-settings/${displayType}`, {
        method: 'POST',
        body: JSON.stringify({ settings }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['display-settings', displayType] });
      toast({ title: "Settings saved", description: "Bible Fullscreen settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    },
  });

  const [settings, setSettings] = useState<BibleFullscreenSettings>({
    versesPerScreen: 4,
    fontSize: 48,
    fontFamily: 'Ramabhadra',
    textColor: '#ffffff',
    textAlign: 'center',
    lineHeight: 1.3,
    fontWeight: 'normal',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    padding: 40,
    margin: 40,
  });

  useEffect(() => {
    if (settingsData?.settings) {
      setSettings(settingsData.settings);
    }
  }, [settingsData]);

  const updateSettings = (updates: Partial<BibleFullscreenSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    mutation.mutate(settings);
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Tv className="h-5 w-5 mr-2" />
          Bible Fullscreen Display
        </h3>
        <Button onClick={handleSave} disabled={mutation.isPending} data-testid="button-save-bible-fullscreen">
          <Save className="h-4 w-4 mr-2" />
          {mutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <FontSettings settings={settings} updateSettings={updateSettings} />
      
      <LayoutSettings 
        settings={settings} 
        updateSettings={updateSettings}
        showDisplayLines={true}
        showPadding={true}
        showMargin={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fontWeight">Font Weight</Label>
          <Select value={settings.fontWeight} onValueChange={(value) => updateSettings({ fontWeight: value as 'normal' | 'bold' })}>
            <SelectTrigger data-testid="select-font-weight">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="textShadow">Text Shadow</Label>
          <Input
            value={settings.textShadow}
            onChange={(e) => updateSettings({ textShadow: e.target.value })}
            placeholder="e.g., 2px 2px 4px rgba(0,0,0,0.8)"
            data-testid="input-text-shadow"
          />
        </div>
      </div>
    </div>
  );
}

export function ControlPanelSettings() {
  const displayType = 'control-panel';
  const { toast } = useToast();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['display-settings', displayType],
    queryFn: () => apiRequest(`/api/display-settings/${displayType}`),
  });

  const mutation = useMutation({
    mutationFn: (settings: ControlPanelSettings) => 
      apiRequest(`/api/display-settings/${displayType}`, {
        method: 'POST',
        body: JSON.stringify({ settings }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['display-settings', displayType] });
      toast({ title: "Settings saved", description: "Control Panel settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    },
  });

  const [settings, setSettings] = useState<ControlPanelSettings>({
    fontSize: 14,
    fontFamily: 'Ramabhadra',
    backgroundColor: '#ffffff',
  });

  useEffect(() => {
    if (settingsData?.settings) {
      setSettings(settingsData.settings);
    }
  }, [settingsData]);

  const updateSettings = (updates: Partial<ControlPanelSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    mutation.mutate(settings);
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center">
          <Smartphone className="h-5 w-5 mr-2" />
          Control Panel
        </h3>
        <Button onClick={handleSave} disabled={mutation.isPending} data-testid="button-save-control-panel">
          <Save className="h-4 w-4 mr-2" />
          {mutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fontFamily">Font Family</Label>
          <Select value={settings.fontFamily} onValueChange={(value) => updateSettings({ fontFamily: value })}>
            <SelectTrigger data-testid="select-font-family">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['Ramabhadra', 'Arial', 'Times New Roman', 'Verdana', 'Georgia', 'Trebuchet MS'].map((font) => (
                <SelectItem key={font} value={font}>{font}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="fontSize">Font Size ({settings.fontSize}px)</Label>
          <Slider
            value={[settings.fontSize]}
            onValueChange={(value) => updateSettings({ fontSize: value[0] })}
            min={8}
            max={1000}
            step={1}
            className="mt-2"
            data-testid="slider-font-size"
          />
        </div>

        <div>
          <Label htmlFor="backgroundColor">Background Color</Label>
          <Input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
            data-testid="input-background-color"
          />
        </div>
      </div>
    </div>
  );
}

export function OBSDockSettings() {
  const displayType = 'obs-dock';
  const { toast } = useToast();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['display-settings', displayType],
    queryFn: () => apiRequest(`/api/display-settings/${displayType}`),
  });

  const mutation = useMutation({
    mutationFn: (settings: OBSDockSettings) => 
      apiRequest(`/api/display-settings/${displayType}`, {
        method: 'POST',
        body: JSON.stringify({ settings }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['display-settings', displayType] });
      toast({ title: "Settings saved", description: "OBS Dock settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    },
  });

  const [settings, setSettings] = useState<OBSDockSettings>({
    fontSize: 14,
    fontFamily: 'Ramabhadra',
    compactMode: false,
  });

  useEffect(() => {
    if (settingsData?.settings) {
      setSettings(settingsData.settings);
    }
  }, [settingsData]);

  const updateSettings = (updates: Partial<OBSDockSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    mutation.mutate(settings);
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Dock className="h-5 w-5 mr-2" />
          OBS Dock
        </h3>
        <Button onClick={handleSave} disabled={mutation.isPending} data-testid="button-save-obs-dock">
          <Save className="h-4 w-4 mr-2" />
          {mutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fontFamily">Font Family</Label>
          <Select value={settings.fontFamily} onValueChange={(value) => updateSettings({ fontFamily: value })}>
            <SelectTrigger data-testid="select-font-family">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['Ramabhadra', 'Arial', 'Times New Roman', 'Verdana', 'Georgia', 'Trebuchet MS'].map((font) => (
                <SelectItem key={font} value={font}>{font}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="fontSize">Font Size ({settings.fontSize}px)</Label>
          <Slider
            value={[settings.fontSize]}
            onValueChange={(value) => updateSettings({ fontSize: value[0] })}
            min={8}
            max={1000}
            step={1}
            className="mt-2"
            data-testid="slider-font-size"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="compactMode" className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.compactMode}
              onChange={(e) => updateSettings({ compactMode: e.target.checked })}
              data-testid="checkbox-compact-mode"
            />
            <span>Compact Mode</span>
          </Label>
        </div>
      </div>
    </div>
  );
}

export default function DisplaySettings() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Display Settings</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Configure settings for each display type. Changes will be applied immediately to all connected displays.
          </p>
        </div>

        <Tabs defaultValue="lyrics-lower-third" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="lyrics-lower-third" data-testid="tab-lyrics-lower-third">Lyrics Lower</TabsTrigger>
            <TabsTrigger value="lyrics-fullscreen" data-testid="tab-lyrics-fullscreen">Lyrics Full</TabsTrigger>
            <TabsTrigger value="bible-lower-third" data-testid="tab-bible-lower-third">Bible Lower</TabsTrigger>
            <TabsTrigger value="bible-fullscreen" data-testid="tab-bible-fullscreen">Bible Full</TabsTrigger>
            <TabsTrigger value="control-panel" data-testid="tab-control-panel">Control Panel</TabsTrigger>
            <TabsTrigger value="obs-dock" data-testid="tab-obs-dock">OBS Dock</TabsTrigger>
          </TabsList>

          <TabsContent value="lyrics-lower-third">
            <Card>
              <CardContent className="pt-6">
                <LyricsLowerThirdSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lyrics-fullscreen">
            <Card>
              <CardContent className="pt-6">
                <LyricsFullscreenSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bible-lower-third">
            <Card>
              <CardContent className="pt-6">
                <BibleLowerThirdSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bible-fullscreen">
            <Card>
              <CardContent className="pt-6">
                <BibleFullscreenSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="control-panel">
            <Card>
              <CardContent className="pt-6">
                <ControlPanelSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="obs-dock">
            <Card>
              <CardContent className="pt-6">
                <OBSDockSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}