import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RefreshCw, Info } from "lucide-react";
import { useLocalFonts } from "@/lib/font-detector";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FontSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  size?: "default" | "sm";
}

export function FontSelector({ value, onValueChange, className, size = "default" }: FontSelectorProps) {
  const { fonts, isLoading, error, refresh } = useLocalFonts();
  const [showFontPreview, setShowFontPreview] = useState(false);

  // Fallback fonts if detection fails
  const fallbackFonts = [
    'Arial', 'Arial Black', 'Georgia', 'Times New Roman', 
    'Helvetica', 'Calibri', 'Verdana', 'Impact', 'Roboto'
  ];

  const availableFonts = fonts.length > 0 ? fonts : fallbackFonts;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className={size === "sm" ? "text-xs" : ""}>
          Font Family
          {isLoading && " (Detecting...)"}
        </Label>
        <div className="flex items-center space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh font list</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                {fonts.length > 0 
                  ? `${fonts.length} fonts detected from your system`
                  : "Using fallback fonts. For better detection, use Chrome 103+ and grant font access permission."
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={size === "sm" ? "h-7 text-xs" : ""}>
          <SelectValue>
            <span style={{ fontFamily: value }}>{value}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {availableFonts.map((font) => (
            <SelectItem 
              key={font} 
              value={font}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span style={{ fontFamily: font }}>{font}</span>
                <span className="text-xs text-muted-foreground ml-2">Aa</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* Font Preview */}
      <div className="mt-2">
        <div 
          className="text-sm p-2 bg-muted rounded border"
          style={{ fontFamily: value }}
        >
          Sample lyrics text in {value}
        </div>
      </div>
    </div>
  );
}