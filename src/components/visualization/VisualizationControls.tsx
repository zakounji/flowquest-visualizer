
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Download, 
  Share2, 
  PlayCircle, 
  StopCircle, 
  Maximize, 
  Minimize, 
  Settings, 
  Eye, 
  EyeOff, 
  Filter, 
  Focus,
  Map,
  Trash2,
  Layers,
  BookOpen
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface VisualizationControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onExport: () => void;
  onShare: () => void;
  onToggleAnimation?: () => void;
  onToggleFullscreen?: () => void;
  onToggleDetails?: () => void;
  onFocusSelection?: () => void;
  onClearSelection?: () => void;
  onToggleMinimap?: () => void;
  isAnimating?: boolean;
  isFullscreen?: boolean;
  showDetails?: boolean;
  showMinimap?: boolean;
}

const VisualizationControls = ({ 
  onZoomIn, 
  onZoomOut, 
  onReset, 
  onExport, 
  onShare,
  onToggleAnimation,
  onToggleFullscreen,
  onToggleDetails,
  onFocusSelection,
  onClearSelection,
  onToggleMinimap,
  isAnimating = false,
  isFullscreen = false,
  showDetails = true,
  showMinimap = false
}: VisualizationControlsProps) => {
  return (
    <div className="absolute top-4 right-4 z-10">
      <TooltipProvider>
        <div className="flex flex-col gap-2">
          <div className="glass-panel backdrop-blur-md bg-white/40 rounded-lg p-1.5 shadow-sm">
            <div className="flex flex-col gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={onZoomIn} className="h-8 w-8">
                    <ZoomIn size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Zoom In</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={onZoomOut} className="h-8 w-8">
                    <ZoomOut size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Zoom Out</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={onReset} className="h-8 w-8">
                    <RefreshCw size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Reset View</p>
                </TooltipContent>
              </Tooltip>

              {onFocusSelection && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={onFocusSelection} className="h-8 w-8">
                      <Focus size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Focus on Selection</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {onToggleFullscreen && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={onToggleFullscreen} className="h-8 w-8">
                      {isFullscreen ? (
                        <Minimize size={16} />
                      ) : (
                        <Maximize size={16} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          
          <div className="glass-panel backdrop-blur-md bg-white/40 rounded-lg p-1.5 shadow-sm">
            <div className="flex flex-col gap-2">
              {onToggleAnimation && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant={isAnimating ? "default" : "ghost"} 
                      onClick={onToggleAnimation} 
                      className="h-8 w-8"
                    >
                      {isAnimating ? (
                        <StopCircle size={16} />
                      ) : (
                        <PlayCircle size={16} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{isAnimating ? "Stop Animation" : "Play Animation"}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {onToggleDetails && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant={showDetails ? "default" : "ghost"} 
                      onClick={onToggleDetails} 
                      className="h-8 w-8"
                    >
                      {showDetails ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{showDetails ? "Hide Details" : "Show Details"}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {onToggleMinimap && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant={showMinimap ? "default" : "ghost"} 
                      onClick={onToggleMinimap} 
                      className="h-8 w-8"
                    >
                      <Map size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{showMinimap ? "Hide Minimap" : "Show Minimap"}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <Separator className="my-1 bg-white/50" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={onExport} className="h-8 w-8">
                    <Download size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Export as SVG</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={onShare} className="h-8 w-8">
                    <Share2 size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Share Visualization</p>
                </TooltipContent>
              </Tooltip>

              {onClearSelection && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={onClearSelection} className="h-8 w-8 text-red-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Clear Selection</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default VisualizationControls;
