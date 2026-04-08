import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraScreenProps {
  frameSrc: string;
  onPhotosTaken: (photos: string[]) => void;
  onBack: () => void;
}

const MAX_SHOTS = 2;

export const CameraScreen: React.FC<CameraScreenProps> = ({ frameSrc, onPhotosTaken, onBack }) => {
  const webcamRef = useRef<Webcam>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const capture = useCallback(() => {
    if (photos.length >= MAX_SHOTS) return;

    // Start 3 second countdown
    setCountdown(3);
  }, [photos.length]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown reached 0, take picture!
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 200);

      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        const newPhotos = [...photos, imageSrc];
        setPhotos(newPhotos);
        
        if (newPhotos.length === MAX_SHOTS) {
          setTimeout(() => {
            onPhotosTaken(newPhotos);
          }, 500);
        }
      }
      setCountdown(null);
    }
  }, [countdown, photos, onPhotosTaken]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '500px', marginBottom: '1rem' }}>
        <button className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} /> Đổi Frame
        </button>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold' }}>
          {photos.length} / {MAX_SHOTS}
        </div>
      </div>

      <div className="camera-wrapper">
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', zIndex: 10 }}>
          {/* Top Slot */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {photos.length === 0 ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                mirrored={true}
                screenshotFormat="image/jpeg"
                videoConstraints={{ width: 720, height: 1080, facingMode: "user" }}
                className="camera-feed"
              />
            ) : (
              <img src={photos[0]} alt="Shot 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>

          {/* Bottom Slot */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {photos.length === 1 ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                mirrored={true}
                screenshotFormat="image/jpeg"
                videoConstraints={{ width: 720, height: 1080, facingMode: "user" }}
                className="camera-feed"
              />
            ) : photos.length > 1 ? (
              <img src={photos[1]} alt="Shot 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : null}
          </div>
        </div>
        
        {/* Frame explicitly overlaid on top so they know how to pose */}
        <img src={frameSrc} className="camera-frame-overlay" alt="Frame Overlay" />

        <AnimatePresence>
          {isFlashing && (
            <motion.div 
              className="shutter"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {countdown !== null && countdown > 0 && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              key={countdown}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8rem',
                color: 'white',
                fontWeight: 900,
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                zIndex: 30
              }}
            >
              {countdown}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bottom-controls">
        <p style={{ opacity: 0.8, background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '12px', flex: 1, textAlign: 'center', marginRight: '1rem' }}>
          {photos.length === 0 ? 'Tạo dáng cho ảnh 1 nào! 📸' : 'Tạo dáng cho ảnh 2 nào! 📸'}
        </p>
        
        <button 
          className="btn-primary" 
          onClick={capture} 
          disabled={photos.length >= MAX_SHOTS || countdown !== null}
          style={{ width: '80px', height: '80px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <Camera size={32} />
        </button>
      </div>
    </div>
  );
};
