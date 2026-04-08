import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, RefreshCw, Home } from 'lucide-react';

interface StripPreviewProps {
  frameSrc: string;
  photos: string[];
  onReset: () => void;
  onRetake: () => void;
}

export const StripPreview: React.FC<StripPreviewProps> = ({ frameSrc, photos, onReset, onRetake }) => {
  const stripRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (stripRef.current) {
      const canvas = await html2canvas(stripRef.current, {
        backgroundColor: null,
        useCORS: true,
        scale: 2 // High def output
      });
      const link = document.createElement('a');
      link.download = 'closeup-photobooth.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <h2 className="title-main" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Thành quả nè! ✨</h2>
      
      <div className="controls" style={{ marginBottom: '1.5rem', width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn-secondary" onClick={onRetake}>
          <RefreshCw size={18} /> Chụp lại
        </button>
        <button className="btn-secondary" onClick={onReset}>
          <Home size={18} /> Trang chủ
        </button>
      </div>

      <div className="strip-export-container" ref={stripRef}>
        <img src={frameSrc} className="strip-export-layer-frame" alt="Frame" />
        
        <div className="strip-export-layer-photos">
          {photos.map((photo, index) => (
            <div key={index} className="photo-slot">
              <img src={photo} alt={`Captured ${index + 1}`} />
            </div>
          ))}
          {/* Fill missing slot to keep layout intact if error happens */}
          {photos.length < 2 && (
             <div className="photo-slot" style={{ background: '#000' }}></div>
          )}
        </div>
      </div>

      <button className="btn-primary" onClick={handleDownload} style={{ marginTop: '3rem', width: '100%', maxWidth: '500px' }}>
        <Download size={24} style={{ display: 'inline', marginRight: '10px' }} /> Tải ảnh về
      </button>
    </div>
  );
};
