
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RefreshCw, Download, Share2, PlayCircle, StopCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VisualizationControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onExport: () => void;
  onShare: () => void;
  onToggleAnimation?: () => void;
  isAnimating?: boolean;
}

const VisualizationControls = ({ 
  onZoomIn, 
  onZoomOut, 
  onReset, 
  onExport, 
  onShare,
  onToggleAnimation,
  isAnimating = false
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
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default VisualizationControls;
