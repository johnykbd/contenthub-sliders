import React, { FC, useEffect, useRef, useState } from 'react';

interface VideoSliderOriginalProps {
  videos: string[];
  title: string;
}

const PlayIcon: FC = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.55)" />
    <polygon points="9.5,7 18,12 9.5,17" fill="#fff" />
  </svg>
);

const VideoSliderOriginal: FC<VideoSliderOriginalProps> = ({ videos, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => { setActiveIndex(0); }, [videos]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.pause();
    vid.load();
  }, [activeIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (videos.length === 0) return;
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + videos.length) % videos.length);
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % videos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [videos.length]);

  if (!Array.isArray(videos) || videos.length === 0) {
    return <div style={css.empty}>No videos found.</div>;
  }

  const prev = () => setActiveIndex((i) => (i - 1 + videos.length) % videos.length);
  const next = () => setActiveIndex((i) => (i + 1) % videos.length);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <div style={css.wrapper}>
      {/* Title */}
      <h2 style={css.heading}>{title}</h2>

      {/* Counter */}
      <div style={css.counter}>{activeIndex + 1} / {videos.length}</div>

      {/* Player stage */}
      <div style={css.stage} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button style={{ ...css.navBtn, left: 12 }} onClick={prev} aria-label="Previous">&#8249;</button>
        <video
          ref={videoRef}
          key={activeIndex}
          controls
          preload="metadata"
          style={css.player}
        >
          <source src={videos[activeIndex]} />
          Your browser does not support HTML5 video.
        </video>
        <button style={{ ...css.navBtn, right: 12 }} onClick={next} aria-label="Next">&#8250;</button>
      </div>

      {/* Thumbnail strip */}
      {videos.length > 1 && (
        <div style={css.thumbsRow}>
          {videos.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              style={{
                ...css.thumbBtn,
                border: i === activeIndex ? '2px solid #0070f3' : '2px solid transparent',
                opacity: i === activeIndex ? 1 : 0.6,
              }}
              aria-label={`Video ${i + 1}`}
            >
              <video
                src={`${url}#t=0.5`}
                style={css.thumbVideo}
                muted
                preload="metadata"
              />
              <div style={css.thumbPlay}>&#9654;</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const css: Record<string, React.CSSProperties> = {
  wrapper: {
    maxWidth: 900,
    width: '100%',
    margin: '0 auto',
    background: '#111',
    borderRadius: 12,
    overflow: 'hidden',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
    boxShadow: '0 8px 28px rgba(0,0,0,0.3)',
  },
  heading: {
    margin: 0,
    padding: '14px 16px 12px',
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
    background: '#1a1a1a',
    borderBottom: '1px solid #222',
  },
  counter: {
    position: 'absolute',
    top: 62,
    right: 12,
    zIndex: 10,
    background: 'rgba(0,0,0,0.55)',
    color: '#fff',
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 999,
    userSelect: 'none',
    pointerEvents: 'none',
  },
  stage: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9' as any,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
    overflow: 'hidden',
  },
  player: {
    width: '100%',
    height: '100%',
    display: 'block',
    outline: 'none',
    background: '#000',
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 5,
    background: 'rgba(0,0,0,0.45)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 40,
    height: 40,
    fontSize: 26,
    lineHeight: '1',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    transition: 'background 0.2s',
  },
  thumbsRow: {
    display: 'flex',
    gap: 8,
    padding: '10px 12px',
    overflowX: 'auto',
    background: '#181818',
    borderTop: '1px solid #222',
  },
  thumbBtn: {
    position: 'relative',
    width: 80,
    height: 54,
    padding: 0,
    flexShrink: 0,
    borderRadius: 6,
    overflow: 'hidden',
    cursor: 'pointer',
    background: '#222',
    transition: 'opacity 0.2s, border-color 0.2s',
  },
  thumbVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    pointerEvents: 'none',
  },
  thumbPlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    pointerEvents: 'none',
  },
  empty: {
    padding: 32,
    color: '#888',
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
  },
};

export default VideoSliderOriginal;
