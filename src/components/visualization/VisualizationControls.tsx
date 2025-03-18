
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, RotateCcw, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface VisualizationControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onExport: () => void;
  onShare: () => void;
}

const VisualizationControls = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onExport,
  onShare
}: VisualizationControlsProps) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <Card className="glass-panel p-2 flex flex-col gap-2">
        <Button variant="ghost" size="icon" onClick={onZoomIn} title="Zoom In">
          <ZoomIn size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onZoomOut} title="Zoom Out">
          <ZoomOut size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onReset} title="Reset View">
          <RotateCcw size={16} />
        </Button>
      </Card>
      
      <Card className="glass-panel p-2 flex flex-col gap-2 mt-2">
        <Button variant="ghost" size="icon" onClick={onExport} title="Export SVG">
          <Download size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onShare} title="Share">
          <Share2 size={16} />
        </Button>
      </Card>
    </div>
  );
};

export default VisualizationControls;
