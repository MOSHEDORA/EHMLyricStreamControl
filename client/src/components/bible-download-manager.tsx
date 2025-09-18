
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AvailableBible {
  name: string;
  downloadUrl: string;
  size: number;
}

interface BibleDownloadManagerProps {
  onDownloadComplete?: () => void;
}

export function BibleDownloadManager({ onDownloadComplete }: BibleDownloadManagerProps) {
  const [availableBibles, setAvailableBibles] = useState<AvailableBible[]>([]);
  const [selectedBibles, setSelectedBibles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [installedBibles, setInstalledBibles] = useState<string[]>([]);

  useEffect(() => {
    fetchAvailableBibles();
    fetchInstalledBibles();
  }, []);

  const fetchAvailableBibles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bibles/available');
      if (!response.ok) throw new Error('Failed to fetch available Bibles');
      const bibles = await response.json();
      setAvailableBibles(bibles);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load available Bible versions' });
    } finally {
      setLoading(false);
    }
  };

  const fetchInstalledBibles = async () => {
    try {
      const response = await fetch('/api/bibles');
      if (!response.ok) throw new Error('Failed to fetch installed Bibles');
      const bibles = await response.json();
      setInstalledBibles(bibles.map((bible: any) => `${bible.id}.xml`));
    } catch (error) {
      console.error('Failed to fetch installed Bibles:', error);
    }
  };

  const downloadDefaults = async () => {
    setDownloading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/bibles/download-defaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to download default Bibles');
      
      const result = await response.json();
      setMessage({ type: 'success', text: result.message });
      await fetchInstalledBibles();
      onDownloadComplete?.();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download default Bible versions' });
    } finally {
      setDownloading(false);
    }
  };

  const downloadSelected = async () => {
    if (selectedBibles.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one Bible version to download' });
      return;
    }

    setDownloading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/bibles/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bibleNames: selectedBibles })
      });
      
      if (!response.ok) throw new Error('Failed to download selected Bibles');
      
      const result = await response.json();
      setMessage({ type: 'success', text: result.message });
      setSelectedBibles([]);
      await fetchInstalledBibles();
      onDownloadComplete?.();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download selected Bible versions' });
    } finally {
      setDownloading(false);
    }
  };

  const toggleBibleSelection = (bibleName: string) => {
    setSelectedBibles(prev => 
      prev.includes(bibleName) 
        ? prev.filter(name => name !== bibleName)
        : [...prev, bibleName]
    );
  };

  const getBibleLanguage = (bibleName: string): string => {
    const name = bibleName.toLowerCase();
    if (name.includes('telugu')) return 'Telugu';
    if (name.includes('english') || name.includes('kjv') || name.includes('esv') || name.includes('niv')) return 'English';
    if (name.includes('hindi')) return 'Hindi';
    if (name.includes('arabic')) return 'Arabic';
    if (name.includes('chinese')) return 'Chinese';
    if (name.includes('spanish')) return 'Spanish';
    if (name.includes('french')) return 'French';
    if (name.includes('german')) return 'German';
    return 'Other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isInstalled = (bibleName: string) => installedBibles.includes(bibleName);

  const groupedBibles = availableBibles.reduce((groups, bible) => {
    const language = getBibleLanguage(bible.name);
    if (!groups[language]) groups[language] = [];
    groups[language].push(bible);
    return groups;
  }, {} as Record<string, AvailableBible[]>);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Bible Version Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? 
              <CheckCircle className="h-4 w-4" /> : 
              <AlertCircle className="h-4 w-4" />
            }
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={downloadDefaults} 
            disabled={downloading || loading}
            className="flex items-center gap-2"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download Defaults (Telugu + English KJV)
          </Button>
          
          <Button 
            onClick={downloadSelected} 
            disabled={downloading || loading || selectedBibles.length === 0}
            variant="secondary"
            className="flex items-center gap-2"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download Selected ({selectedBibles.length})
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading available Bible versions...</span>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(groupedBibles).map(([language, bibles]) => (
              <div key={language} className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">{language}</h3>
                <div className="grid gap-2">
                  {bibles.map((bible) => (
                    <div
                      key={bible.name}
                      className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={bible.name}
                          checked={selectedBibles.includes(bible.name)}
                          onCheckedChange={() => toggleBibleSelection(bible.name)}
                          disabled={isInstalled(bible.name)}
                        />
                        <div className="flex flex-col">
                          <label
                            htmlFor={bible.name}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {bible.name.replace('.xml', '').replace('Bible', '')}
                          </label>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(bible.size)}
                          </span>
                        </div>
                      </div>
                      {isInstalled(bible.name) && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Installed
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
