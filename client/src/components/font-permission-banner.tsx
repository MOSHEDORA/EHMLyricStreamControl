import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Download, Info } from "lucide-react";

export function FontPermissionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [canRequestPermission, setCanRequestPermission] = useState(false);

  useEffect(() => {
    // Check if Font Access API is available
    // @ts-ignore
    const hasFontAPI = 'queryLocalFonts' in window;
    setCanRequestPermission(hasFontAPI);

    // Show banner if API is available but we haven't checked permission yet
    if (hasFontAPI) {
      const hasCheckedPermission = localStorage.getItem('font-permission-checked');
      if (!hasCheckedPermission) {
        setIsVisible(true);
      }
    }
  }, []);

  const requestFontAccess = async () => {
    try {
      // @ts-ignore
      if ('queryLocalFonts' in window) {
        // @ts-ignore
        await window.queryLocalFonts();
        localStorage.setItem('font-permission-checked', 'true');
        setIsVisible(false);
      }
    } catch (error) {
      console.log('Font access permission denied or failed');
    }
  };

  const dismissBanner = () => {
    setIsVisible(false);
    localStorage.setItem('font-permission-checked', 'true');
  };

  if (!isVisible || !canRequestPermission) {
    return null;
  }

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Enhanced Font Detection Available!</strong> Allow access to your local fonts for better typography options.
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            size="sm"
            onClick={requestFontAccess}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="h-3 w-3 mr-1" />
            Enable
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissBanner}
            className="text-blue-600 hover:text-blue-700"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}