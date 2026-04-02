import React, { FC, useEffect, useRef, useState } from 'react';

interface ImageSliderOriginalProps {
  images: string[];
  title: string;
}

const ImageSliderOriginal: FC<ImageSliderOriginalProps> = ({ images, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [errorImages, setErrorImages] = useState<Record<number, boolean>>({});
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    setErrorImages({});
  }, [images]);

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

  if (!Array.isArray(images) || images.length === 0) {
    return <div style={css.empty}>No images found.</div>;
  }

  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  const placeholder =
    'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22450%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20fill%3D%22%23333%22%20width%3D%22800%22%20height%3D%22450%22/%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dy%3D%220.35em%22%20text-anchor%3D%22middle%22%20fill%3D%22%23888%22%20font-family%3D%22Arial%22%20font-size%3D%2224%22%3EImage%20not%20available%3C/text%3E%3C/svg%3E';

  const safeUrl = (index: number) => (errorImages[index] ? placeholder : images[index]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <>
      <div style={css.wrapper}>
        {/* Title */}
        <h2 style={css.heading}>{title}</h2>

        {/* Counter */}
        <div style={css.counter}>{activeIndex + 1} / {images.length}</div>

        {/* Main slide */}
        <div style={css.stage} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <button style={{ ...css.navBtn, left: 12 }} onClick={prev} aria-label="Previous">&#8249;</button>
          <img
            key={activeIndex}
            src={safeUrl(activeIndex)}
            alt={`Image ${activeIndex + 1}`}
            style={css.mainImage}
            onClick={() => setLightbox(true)}
            onError={() => setErrorImages((p) => ({ ...p, [activeIndex]: true }))}
          />
          <button style={{ ...css.navBtn, right: 12 }} onClick={next} aria-label="Next">&#8250;</button>
        </div>

        {/* Thumbnails */}
        <div style={css.thumbsRow}>
          {images.map((_, i) => (
            <img
              key={i}
              src={safeUrl(i)}
              alt={`Thumbnail ${i + 1}`}
              style={{
                ...css.thumb,
                border: i === activeIndex ? '2px solid #0070f3' : '2px solid transparent',
                opacity: i === activeIndex ? 1 : 0.6,
              }}
              onClick={() => setActiveIndex(i)}
              onError={() => setErrorImages((p) => ({ ...p, [i]: true }))}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div style={css.lightboxOverlay} onClick={() => setLightbox(false)}>
          <div style={css.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button style={css.lightboxClose} onClick={() => setLightbox(false)}>&times;</button>
            <img
              src={safeUrl(activeIndex)}
              alt={`Image ${activeIndex + 1}`}
              style={css.lightboxImage}
            />
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
    top: 62,   // below the heading (~48px) + 12px gap
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
    maxHeight: 'calc(min(95vh, 900px) - 60px)',
    objectFit: 'contain',
    borderRadius: 6,
    display: 'block',
  },
};

export default ImageSliderOriginal;
