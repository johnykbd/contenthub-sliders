import React, { FC, useEffect, useRef, useState, useCallback } from 'react';
import { IExtendedContentHubClient } from '@sitecore/sc-contenthub-webclient-sdk/dist/clients/extended-client';

interface AssetImage {
  id: number;
  url: string;
  title: string;
}

interface ImageSliderProps {
  entity: any;
  client: IExtendedContentHubClient;
  entityId?: number;
  config?: { title?: string };
}

// Extract related M.Asset IDs from the PropertyImages relation.
// Content Hub passes entity as a plain object: { relations: { PropertyImages: [id, id, ...] } }
function getRelatedAssetIds(entity: any): number[] {
  try {
    const ids = entity?.relations?.PropertyImages;
    console.log('Related asset IDs:', ids);
    if (Array.isArray(ids)) {
      return ids.map((id: any) => Number(id)).filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}

// Fetch a single M.Asset entity from the Content Hub REST API and extract an image URL.
// Runs in the authenticated browser session (session cookie) so no extra auth header needed.
async function fetchAssetImage(assetId: number): Promise<AssetImage | null> {
  try {
    const res = await fetch(`${window.location.origin}/api/entities/${assetId}`, {
      credentials: 'include',
    });
    console.log(`Fetching asset ${assetId}:`, res);
    if (!res.ok) return null;
    const data = await res.json();

    // renditions is a map: { downloadOriginal: [url|{href}], thumbnail: [...], ... }
    const renditions = data?.renditions ?? {};
    const resolveUrl = (slot: string): string => {
      const val = renditions[slot];
      if (!val) return '';
      const first = Array.isArray(val) ? val[0] : val;
      if (typeof first === 'string') return first;
      if (typeof first?.href === 'string') return first.href;
      return '';
    };

    const url =
      resolveUrl('downloadOriginal') ||
      resolveUrl('preview') ||
      resolveUrl('thumbnail') ||
      '';

    if (!url) return null;

    // Title: multilingual string property on M.Asset
    const titleProp = data?.properties?.Title;
    const title: string =
      (typeof titleProp === 'string' ? titleProp : titleProp?.['en-US']) ?? '';

    return { id: assetId, url, title };
  } catch {
    return null;
  }
}

const ImageSlider: FC<ImageSliderProps> = ({ entity, client, entityId, config }) => {
  const [images, setImages] = useState<AssetImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActiveIndex(0);

    try {
      const ids = getRelatedAssetIds(entity);
      if (ids.length === 0) {
        setImages([]);
        return;
      }

      const results = await Promise.all(ids.map(fetchAssetImage));
      setImages(results.filter((img): img is AssetImage => img !== null));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load images');
    } finally {
      setLoading(false);
    }
  }, [entity, entityId]);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (images.length === 0) return;
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, activeIndex]);

  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
    touchStartX.current = null;
  };

  // ── States ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={css.center}>
        <div style={css.spinner} />
        <span style={{ color: '#aaa', fontSize: 14 }}>Loading images…</span>
      </div>
    );
  }

  if (error) {
    return <div style={css.error}>Error: {error}</div>;
  }

  if (images.length === 0) {
    return <div style={css.empty}>No images linked to this property.</div>;
  }

  const current = images[activeIndex];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div style={css.wrapper}>
        {/* Title */}
        <h2 style={css.heading}>{config?.title ?? 'Images'}</h2>

        {/* Counter */}
        <div style={css.counter}>
          {activeIndex + 1} / {images.length}
        </div>

        {/* Main slide */}
        <div
          style={css.stage}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button style={{ ...css.navBtn, left: 12 }} onClick={prev} aria-label="Previous">
            &#8249;
          </button>
          <img
            key={current.id}
            src={current.url}
            alt={current.title || `Image ${activeIndex + 1}`}
            style={css.mainImage}
            onClick={() => setLightbox(true)}
          />
          <button style={{ ...css.navBtn, right: 12 }} onClick={next} aria-label="Next">
            &#8250;
          </button>
        </div>

        {/* Caption */}
        {current.title ? (
          <div style={css.caption}>{current.title}</div>
        ) : null}

        {/* Thumbnails */}
        <div style={css.thumbsRow}>
          {images.map((img, i) => (
            <img
              key={img.id}
              src={img.url}
              alt={img.title || `Thumb ${i + 1}`}
              style={{
                ...css.thumb,
                border: i === activeIndex
                  ? '2px solid #0070f3'
                  : '2px solid transparent',
                opacity: i === activeIndex ? 1 : 0.6,
              }}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div style={css.lightboxOverlay} onClick={() => setLightbox(false)}>
          <div style={css.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button style={css.lightboxClose} onClick={() => setLightbox(false)}>
              &times;
            </button>
            <img
              src={current.url}
              alt={current.title || `Image ${activeIndex + 1}`}
              style={css.lightboxImage}
            />
            {current.title ? (
              <div style={css.lightboxCaption}>{current.title}</div>
            ) : null}
          </div>
        </div>
      )}
    </>
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
    cursor: 'zoom-in',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
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
  thumb: {
    width: 80,
    height: 54,
    objectFit: 'cover',
    borderRadius: 6,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'opacity 0.2s, border-color 0.2s',
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
  lightboxOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(0,0,0,0.88)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  lightboxContent: {
    position: 'relative',
    maxWidth: 'min(95vw, 1200px)',
    maxHeight: 'min(95vh, 900px)',
    background: '#111',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  lightboxClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 32,
    height: 32,
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  lightboxImage: {
    maxWidth: '100%',
    maxHeight: 'calc(min(95vh, 900px) - 80px)',
    objectFit: 'contain',
    borderRadius: 6,
  },
  lightboxCaption: {
    color: '#ccc',
    fontSize: 13,
    textAlign: 'center',
  },
};

// Inject keyframe for the spinner (once)
if (typeof document !== 'undefined' && !document.getElementById('ch-spin-style')) {
  const style = document.createElement('style');
  style.id = 'ch-spin-style';
  style.textContent = '@keyframes ch-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

export default ImageSlider;
