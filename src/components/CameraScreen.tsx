import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import Cropper from 'react-easy-crop';
import { Camera, ArrowLeft, Upload, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import getCroppedImg from '../utils/cropImage';

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

  // Upload and Crop state
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const capture = useCallback(() => {
    if (photos.length >= MAX_SHOTS) return;
    setCountdown(3);
  }, [photos.length]);

  const handleUploadClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e: any) => {
      const file = e.target?.files[0];
      if (file) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          setUploadedImageSrc(reader.result?.toString() || null);
        });
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const confirmCrop = async () => {
    if (!uploadedImageSrc || !croppedAreaPixels) return;
    
    try {
      const croppedImage = await getCroppedImg(uploadedImageSrc, croppedAreaPixels);
      const newPhotos = [...photos, croppedImage];
      setPhotos(newPhotos);
      
      setUploadedImageSrc(null); // Reset cropper

      if (newPhotos.length === MAX_SHOTS) {
        setTimeout(() => {
          onPhotosTaken(newPhotos);
        }, 500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Live Camera Effect Callback
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
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
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', zIndex: 10, padding: '11% 7% 22% 7%', gap: '3%' }}>
          {/* Top Slot */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {photos.length === 0 ? (
              uploadedImageSrc ? (
                 <div style={{ position: 'absolute', inset: 0 }}>
                   <Cropper
                    image={uploadedImageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={4 / 3}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                   />
                 </div>
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  mirrored={true}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ width: 720, height: 1080, facingMode: "user" }}
                  className="camera-feed"
                />
              )
            ) : (
              <img src={photos[0]} alt="Shot 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>

          {/* Bottom Slot */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {photos.length === 1 ? (
              uploadedImageSrc ? (
                 <div style={{ position: 'absolute', inset: 0 }}>
                   <Cropper
                    image={uploadedImageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={4 / 3}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                   />
                 </div>
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  mirrored={true}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ width: 720, height: 1080, facingMode: "user" }}
                  className="camera-feed"
                />
              )
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

        {/* Cropper Slider Layer ensures it sits ABOVE the frame layer so touch events work inside the slot! */}
        {uploadedImageSrc && (
          <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', zIndex: 40, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px'}}>Zoom</span>
            <input 
              type="range" 
              value={zoom} 
              min={1} 
              max={3} 
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>
        )}
      </div>

      <div className="bottom-controls">
        {uploadedImageSrc ? (
          <>
            <button className="btn-secondary" onClick={() => setUploadedImageSrc(null)}>
              <X size={20} /> Hủy
            </button>
            <p style={{ margin: 0, flex: 1, textAlign: 'center', fontWeight: 'bold' }}>Chỉnh sửa ảnh ✂️</p>
            <button className="btn-primary" onClick={confirmCrop} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
              <Check size={20} /> Lưu
            </button>
          </>
        ) : (
          <>
            <button className="btn-secondary" onClick={handleUploadClick} disabled={photos.length >= MAX_SHOTS || countdown !== null}>
              <Upload size={20} /> Tải lên
            </button>
            
            <p style={{ opacity: 0.8, background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '12px', flex: 1, textAlign: 'center', margin: '0 1rem' }}>
              {photos.length === 0 ? 'Tạo dáng số 1 nào!' : 'Tạo dáng số 2 nào!'}
            </p>
            
            <button 
              className="btn-primary" 
              onClick={capture} 
              disabled={photos.length >= MAX_SHOTS || countdown !== null}
              style={{ width: '60px', height: '60px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <Camera size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
