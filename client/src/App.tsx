import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ControlPanel from "@/pages/control-panel";
import LyricsLowerThird from "@/pages/lyrics-lower-third";
import LyricsFullscreen from "@/pages/lyrics-fullscreen";
import BibleLowerThird from "@/pages/bible-lower-third";
import BibleFullscreen from "@/pages/bible-fullscreen";
import OBSDock from "@/pages/obs-dock";
import Bible from "@/pages/bible";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ControlPanel} />
      <Route path="/control" component={ControlPanel} />
      <Route path="/display/lower-third" component={LyricsLowerThird} />
      <Route path="/display/fullscreen" component={LyricsFullscreen} />
      <Route path="/lyrics-lower-third" component={LyricsLowerThird} />
      <Route path="/lyrics-fullscreen" component={LyricsFullscreen} />
      <Route path="/bible-lower-third" component={BibleLowerThird} />
      <Route path="/bible-fullscreen" component={BibleFullscreen} />
      <Route path="/obs-dock" component={OBSDock} />
      <Route path="/bible" component={Bible} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;