import { useState, useRef, useEffect } from 'react';
import './App.css';
import { Camera, Palette, Image as ImageIcon, Download, Zap, Volume2, VolumeX } from 'lucide-react';
import { CameraScreen } from './components/CameraScreen';
import { StripPreview } from './components/StripPreview';

interface FrameConfig {
  src: string;
  slots: {
    top: { top: string; height: string; left: string; right: string };
    bottom: { top: string; height: string; left: string; right: string };
  };
}

const FRAMES: FrameConfig[] = [
  {
    // Valentine frame (black bg) - windows are higher and shorter
    src: '/frames/Frame Photo Booth Web (1) (1).png',
    slots: {
      top: { top: '7.5%', height: '40%', left: '7%', right: '7%' },
      bottom: { top: '48%', height: '48%', left: '7%', right: '7%' },
    }
  },
  {
    // Frame 1 - "Tự tin mọi lúc" text at TOP, closeup logo at BOTTOM
    src: '/frames/Đã xóa nền - Frame 1.png',
    slots: {
      top: { top: '11%', height: '40%', left: '7%', right: '7%' },
      bottom: { top: '49%', height: '40%', left: '7%', right: '7%' },
    }
  },
  {
    // Frame 2 - green bg, closeup at TOP, "Tự tin mọi lúc" at BOTTOM
    src: '/frames/Đã xóa nền - Frame 2.png',
    slots: {
      top: { top: '12%', height: '40%', left: '5%', right: '5%' },
      bottom: { top: '50%', height: '40%', left: '5%', right: '5%' },
    }
  },
  {
    // Frame 3 - blue border, closeup at TOP, "Tự tin mọi lúc" at BOTTOM
    src: '/frames/Đã xóa nền - Frame 3.png',
    slots: {
      top: { top: '11%', height: '40%', left: '10%', right: '10%' },
      bottom: { top: '48%', height: '40%', left: '10%', right: '10%' },
    }
  },
  {
    // Frame 4 - Newly added frame
    src: '/frames/Frame 4.png',
    slots: {
      top: { top: '10%', height: '35%', left: '10%', right: '10%' },
      bottom: { top: '50%', height: '35%', left: '10%', right: '10%' },
    }
  }
];

type AppState = 'HOME' | 'FRAME_SELECT' | 'CAMERA' | 'PREVIEW';

function App() {
  const [appState, setAppState] = useState<AppState>('HOME');
  const [selectedFrame, setSelectedFrame] = useState<FrameConfig | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  // Music state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        console.log("Autoplay blocked. Waiting for user interaction.");
      });
    }
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handlePhotosTaken = (capturedPhotos: string[]) => {
    setPhotos(capturedPhotos);
    setAppState('PREVIEW');
  };

  const resetFlow = () => {
    setAppState('HOME');
    setPhotos([]);
    setSelectedFrame(null);
  };

  const renderHome = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="camera-icon-wrapper">
        <Camera size={64} />
      </div>

      <div className="app-subtitle">CLOSEUP X PHOTOBOOTH</div>

      <h1 className="title-main">Tự tin<br />gần nhau hơn!</h1>
      <p className="title-sub">Chụp ảnh cực chất cùng Closeup</p>

      <div className="cards-row">
        <div className="info-card">
          <Palette size={32} color="#f28b82" />
          <p>Bộ lọc nghệ thuật</p>
        </div>
        <div className="info-card">
          <ImageIcon size={32} color="#fbbc04" />
          <p>Frame Closeup</p>
        </div>
        <div className="info-card">
          <Download size={32} color="#8ab4f8" />
          <p>Tải ảnh cực dễ</p>
        </div>
      </div>

      <button className="btn-primary" onClick={() => {
        if (!isPlaying && audioRef.current) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
        }
        setAppState('FRAME_SELECT');
      }}>
        Bắt Đầu Ngay
      </button>

      <div className="footer-text">
        <Zap size={16} /> 2 ảnh mỗi strip • Không cần đăng nhập
      </div>
    </div>
  );

  const renderFrameSelect = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Chọn Frame Yêu Thích</h2>

      <div className="frame-grid">
        {FRAMES.map((f, i) => (
          <div
            key={i}
            className={`frame-option ${selectedFrame?.src === f.src ? 'selected' : ''}`}
            onClick={() => setSelectedFrame(f)}
          >
            <img src={f.src} alt={`Frame ${i + 1}`} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
        <button className="btn-secondary" onClick={() => setAppState('HOME')}>
          Trở lại
        </button>
        <button
          className="btn-primary"
          style={{ width: 'auto', padding: '1rem 3rem' }}
          disabled={!selectedFrame}
          onClick={() => setAppState('CAMERA')}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="meteor meteor-1"></div>
      <div className="meteor meteor-2"></div>
      <div className="meteor meteor-3"></div>
      <div className="meteor meteor-4"></div>
      <div className="meteor meteor-5"></div>
      <div className="meteor meteor-6"></div>

      <audio ref={audioRef} src="/bgm.mp3" loop />

      <button
        onClick={toggleMusic}
        style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 100,
          background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
          backdropFilter: 'blur(10px)', color: 'white', padding: '10px',
          borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>

      <div className="app-container">
        {appState === 'HOME' && renderHome()}
        {appState === 'FRAME_SELECT' && renderFrameSelect()}
        {appState === 'CAMERA' && (
          <CameraScreen
            frameSrc={selectedFrame!.src}
            slotPositions={selectedFrame!.slots}
            onPhotosTaken={handlePhotosTaken}
            onBack={() => setAppState('FRAME_SELECT')}
          />
        )}
        {appState === 'PREVIEW' && (
          <StripPreview
            frameSrc={selectedFrame!.src}
            slotPositions={selectedFrame!.slots}
            photos={photos}
            onReset={resetFlow}
            onRetake={() => { setPhotos([]); setAppState('CAMERA'); }}
          />
        )}
      </div>
    </>
  );
}

export default App;
