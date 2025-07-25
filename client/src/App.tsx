import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ControlPanel from "@/pages/control-panel";
import Display from "@/pages/display";
import DisplayLowerThird from "@/pages/display-lower-third";
import DisplayFullscreen from "@/pages/display-fullscreen";
import OBSDock from "@/pages/obs-dock";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ControlPanel} />
      <Route path="/control" component={ControlPanel} />
      <Route path="/display" component={Display} />
      <Route path="/display/lower-third" component={DisplayLowerThird} />
      <Route path="/display/fullscreen" component={DisplayFullscreen} />
      <Route path="/obs-dock" component={OBSDock} />
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
