import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { IExtendedContentHubClient } from '@sitecore/sc-contenthub-webclient-sdk/dist/clients/extended-client';

interface AssetVideo {
  id: number;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
}

interface VideoSliderProps {
  entity: any;
  client: IExtendedContentHubClient;
  entityId?: number;
  config?: { title?: string };
}

function getRelatedAssetIds(entity: any): number[] {
  try {
    const ids = entity?.relations?.PropertyVideos;
    if (Array.isArray(ids)) {
      return ids.map((id: any) => Number(id)).filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}

async function fetchAssetVideo(assetId: number): Promise<AssetVideo | null> {
  try {
    const res = await fetch(`${window.location.origin}/api/entities/${assetId}`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();

    const renditions = data?.renditions ?? {};
    const resolveUrl = (slot: string): string => {
      const val = renditions[slot];
      if (!val) return '';
      const first = Array.isArray(val) ? val[0] : val;
      if (typeof first === 'string') return first;
      if (typeof first?.href === 'string') return first.href;
      return '';
    };

    const videoUrl = resolveUrl('downloadOriginal') || resolveUrl('preview') || '';
    if (!videoUrl) return null;

    const thumbnailUrl = resolveUrl('thumbnail') || resolveUrl('Thumbnail') || resolveUrl('preview') || '';

    const titleProp = data?.properties?.Title;
    const title = (typeof titleProp === 'string' ? titleProp : titleProp?.['en-US']) ?? '';

    return { id: assetId, videoUrl, thumbnailUrl, title };
  } catch {
    return null;
  }
}

const PlayIcon: FC = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.55)" />
    <polygon points="9.5,7 18,12 9.5,17" fill="#fff" />
  </svg>
);

const VideoSlider: FC<VideoSliderProps> = ({ entity, client, entityId, config }) => {
  const [videos, setVideos] = useState<AssetVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef<number | null>(null);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActiveIndex(0);
    try {
      const ids = getRelatedAssetIds(entity);
      if (ids.length === 0) { setVideos([]); return; }
      const results = await Promise.all(ids.map(fetchAssetVideo));
      setVideos(results.filter((v): v is AssetVideo => v !== null));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [entity, entityId]);

  useEffect(() => { void loadVideos(); }, [loadVideos]);

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

  const prev = () => setActiveIndex((i) => (i - 1 + videos.length) % videos.length);
  const next = () => setActiveIndex((i) => (i + 1) % videos.length);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
    touchStartX.current = null;
  };

  if (loading) {
    return (
      <div style={css.center}>
        <div style={css.spinner} />
        <span style={{ color: '#aaa', fontSize: 14 }}>Loading videos…</span>
      </div>
    );
  }
  if (error) return <div style={css.error}>Error: {error}</div>;
  if (videos.length === 0) return <div style={css.empty}>No videos linked to this property.</div>;

  const current = videos[activeIndex];

  return (
    <div style={css.wrapper}>
      {/* Title */}
      <h2 style={css.heading}>{config?.title ?? 'Videos'}</h2>

      {/* Counter */}
      <div style={css.counter}>{activeIndex + 1} / {videos.length}</div>

      {/* Player stage */}
      <div style={css.stage} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button style={{ ...css.navBtn, left: 12 }} onClick={prev} aria-label="Previous">&#8249;</button>
        <video
          ref={videoRef}
          key={current.id}
          controls
          preload="metadata"
          style={css.player}
          poster={current.thumbnailUrl || undefined}
        >
          <source src={current.videoUrl} />
          Your browser does not support HTML5 video.
        </video>
        <button style={{ ...css.navBtn, right: 12 }} onClick={next} aria-label="Next">&#8250;</button>
      </div>

      {/* Caption */}
      {current.title ? <div style={css.caption}>{current.title}</div> : null}

      {/* Thumbnail strip */}
      {videos.length > 1 && (
        <div style={css.thumbsRow}>
          {videos.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setActiveIndex(i)}
              style={{
                ...css.thumbBtn,
                border: i === activeIndex ? '2px solid #0070f3' : '2px solid transparent',
                opacity: i === activeIndex ? 1 : 0.6,
              }}
              aria-label={v.title || `Video ${i + 1}`}
            >
              {v.thumbnailUrl ? (
                <img src={v.thumbnailUrl} alt={v.title || `Video ${i + 1}`} style={css.thumbImg} />
              ) : (
                <div style={css.thumbPlaceholder}><PlayIcon /></div>
              )}
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
  caption: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 13,
    padding: '7px 16px',
    background: '#1a1a1a',
    borderTop: '1px solid #222',
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
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#2a2a2a',
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
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    gap: 12,
    color: '#aaa',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid rgba(255,255,255,0.15)',
    borderTop: '3px solid #0070f3',
    borderRadius: '50%',
    animation: 'ch-spin 0.9s linear infinite',
  },
  error: {
    padding: 20,
    color: '#f88',
    background: '#2a0000',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 13,
  },
  empty: {
    padding: 32,
    color: '#888',
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('ch-spin-style')) {
  const style = document.createElement('style');
  style.id = 'ch-spin-style';
  style.textContent = '@keyframes ch-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

export default VideoSlider;
