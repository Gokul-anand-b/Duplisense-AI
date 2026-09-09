import { useState, useEffect } from 'react';

const STEPS = [
  { progress: 20, text: 'Booting Semantic Vector Engine & Neural Embeddings...' },
  { progress: 50, text: 'Connecting to FAISS 512-dim Similarity Index...' },
  { progress: 80, text: 'Calibrating AST Code Parser & Graph Architecture...' },
  { progress: 100, text: 'DupliSense AI Online. Initializing Workspace...' },
];

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Total animation runs for ~2.2s
    const startTime = Date.now();
    const duration = 2100;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(pct);

      if (pct < 30) setCurrentStepIndex(0);
      else if (pct < 65) setCurrentStepIndex(1);
      else if (pct < 90) setCurrentStepIndex(2);
      else setCurrentStepIndex(3);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            if (onFinish) onFinish();
          }, 450);
        }, 300);
      }
    }, 40);

    // Escape or Space to skip immediately
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 250);
  };

  return (
    <div
      onClick={handleSkip}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        cursor: 'pointer',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.03)' : 'scale(1)',
        transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        overflow: 'hidden',
      }}
      title="Click anywhere or press ESC to skip"
    >
      {/* Background Animated Grid & Spotlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)',
          pointerEvents: 'none',
        }}
      />

      {/* Ambient Radial Core Glow */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Center Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '560px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Animated Cybernetic AI Hexagon / Diamond Core */}
        <div
          style={{
            position: 'relative',
            width: '110px',
            height: '110px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem',
          }}
        >
          {/* Outer Rotating Dotted Tech Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-10px',
              border: '2px dashed rgba(255, 255, 255, 0.25)',
              borderRadius: '50%',
              animation: 'splashSpin 12s linear infinite',
            }}
          />

          {/* Middle Pulse Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-2px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '24px',
              transform: 'rotate(45deg)',
              animation: 'splashPulse 2.5s ease-in-out infinite',
              boxShadow: '0 0 25px rgba(255, 255, 255, 0.1)',
            }}
          />

          {/* Inner Core Obsidian Shield */}
          <div
            style={{
              width: '84px',
              height: '84px',
              background: '#09090b',
              border: '2px solid #ffffff',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Sweeping Laser Scan Line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
                boxShadow: '0 0 8px #ffffff',
                animation: 'splashScan 1.6s ease-in-out infinite alternate',
              }}
            />

            {/* Core Neural Icon */}
            <span
              style={{
                fontSize: '2.5rem',
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))',
                transform: 'scale(1.05)',
              }}
            >
              ✦
            </span>
          </div>
        </div>

        {/* Brand Tag Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.9rem',
            borderRadius: '99px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '0.08em',
            marginBottom: '1rem',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffffff', animation: 'splashBlink 1s infinite' }} />
          NEURAL CODE INTELLIGENCE
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            margin: '0 0 0.5rem 0',
            lineHeight: 1.1,
            textShadow: '0 0 30px rgba(255, 255, 255, 0.25)',
          }}
        >
          DupliSense <span style={{ color: '#ffffff', borderBottom: '3px solid #ffffff' }}>AI</span>
        </h1>

        <p
          style={{
            fontSize: '0.9rem',
            color: '#a1a1aa',
            margin: '0 0 2.25rem 0',
            letterSpacing: '0.02em',
            fontWeight: 500,
          }}
        >
          Autonomous Semantic Detection & Code Reuse Governance
        </p>

        {/* Progress Bar Container */}
        <div style={{ width: '100%', maxWidth: '420px', marginBottom: '1.25rem' }}>
          {/* Progress Track */}
          <div
            style={{
              width: '100%',
              height: '5px',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '99px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: '#ffffff',
                boxShadow: '0 0 12px rgba(255, 255, 255, 0.9), 0 0 20px rgba(255, 255, 255, 0.5)',
                transition: 'width 0.08s linear',
                borderRadius: '99px',
              }}
            />
          </div>

          {/* Status Label & Percentage Counter */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.75rem',
              fontSize: '0.76rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span style={{ color: '#e4e4e7', fontWeight: 600, letterSpacing: '0.01em' }}>
              {STEPS[currentStepIndex]?.text}
            </span>
            <span style={{ color: '#ffffff', fontWeight: 800, minWidth: '40px', textAlign: 'right' }}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Skip Hint */}
        <div
          style={{
            fontSize: '0.72rem',
            color: '#71717a',
            marginTop: '1.5rem',
            letterSpacing: '0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span>Press</span>
          <kbd
            style={{
              padding: '0.15rem 0.4rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              color: '#a1a1aa',
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ESC
          </kbd>
          <span>or click anywhere to skip</span>
        </div>
      </div>

      {/* Inline Keyframe Styles for the Splash Screen */}
      <style>{`
        @keyframes splashSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes splashPulse {
          0%, 100% { transform: rotate(45deg) scale(1); border-color: rgba(255, 255, 255, 0.3); }
          50% { transform: rotate(45deg) scale(1.08); border-color: rgba(255, 255, 255, 0.8); }
        }
        @keyframes splashScan {
          0% { top: 0%; opacity: 0.2; }
          50% { opacity: 1; }
          100% { top: 96%; opacity: 0.2; }
        }
        @keyframes splashBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
