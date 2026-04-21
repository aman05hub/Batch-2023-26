import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { albumsAPI } from '../utils/api';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Download, ZoomIn, Calendar, ImageIcon } from 'lucide-react';

export default function AlbumView() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  useEffect(() => {
    albumsAPI.getOne(id)
      .then(res => {
        setAlbum(res.data.album);
        setPhotos(res.data.photos);
      })
      .catch(() => setError('Album not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const openLightbox = (index) => setLightbox({ open: true, index });
  const closeLightbox = () => setLightbox({ open: false, index: 0 });

  const prevPhoto = useCallback(() =>
    setLightbox(lb => ({ ...lb, index: (lb.index - 1 + photos.length) % photos.length })),
    [photos.length]);

  const nextPhoto = useCallback(() =>
    setLightbox(lb => ({ ...lb, index: (lb.index + 1) % photos.length })),
    [photos.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (!lightbox.open) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox.open, prevPhoto, nextPhoto]);

  if (loading) return <div className="page-loader" style={{ marginTop: 64 }}><div className="spinner" /></div>;
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <p style={{ color: '#ef4444', fontSize: 18 }}>{error}</p>
      <Link to="/" className="btn btn-outline">← Back to Albums</Link>
    </div>
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const currentPhoto = photos[lightbox.index];

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>
      {/* Album Header */}
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '32px 24px 24px'
      }}>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#9ba8b8', fontSize: 14, marginBottom: 24,
          transition: 'color 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
          onMouseLeave={e => e.currentTarget.style.color = '#9ba8b8'}
        >
          <ArrowLeft size={15} /> All Albums
        </Link>

        {album.coverImage && (
          <div style={{
            height: 320, borderRadius: 16, overflow: 'hidden',
            marginBottom: 32,
            background: `url(${album.coverImage}) center/cover no-repeat`,
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(11,15,26,0.85) 0%, transparent 60%)'
            }} />
            <div style={{
              position: 'absolute', bottom: 28, left: 32, right: 32
            }}>
              <h1 style={{
                fontFamily: 'Cormorant Garamond',
                fontSize: 'clamp(28px, 5vw, 52px)',
                fontWeight: 700, marginBottom: 8,
                textShadow: '0 2px 12px rgba(0,0,0,0.5)'
              }}>
                {album.title}
              </h1>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={13} /> {formatDate(album.date)}
                </span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <ImageIcon size={13} /> {photos.length} photos
                </span>
              </div>
            </div>
          </div>
        )}

        {!album.coverImage && (
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, marginBottom: 12 }}>
              {album.title}
            </h1>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#9ba8b8', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={13} /> {formatDate(album.date)}
              </span>
              <span style={{ fontSize: 13, color: '#9ba8b8', display: 'flex', alignItems: 'center', gap: 5 }}>
                <ImageIcon size={13} /> {photos.length} photos
              </span>
            </div>
          </div>
        )}

        {album.description && (
          <p style={{ color: '#9ba8b8', fontSize: 15, marginBottom: 16, maxWidth: 700 }}>
            {album.description}
          </p>
        )}
        {album.tags && album.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {album.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
        <div style={{ height: 1, background: 'var(--border)', margin: '24px 0' }} />
      </div>

      {/* Photo Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        {photos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', color: '#9ba8b8' }}>
            <ImageIcon size={48} color="#5c6a7a" style={{ margin: '0 auto 16px' }} />
            <p>No photos in this album yet.</p>
          </div>
        ) : (
          <div style={{
            columns: 'auto 280px',
            gap: 12,
            columnFill: 'balance'
          }}>
            {photos.map((photo, index) => (
              <div
                key={photo._id}
                onClick={() => openLightbox(index)}
                style={{
                  breakInside: 'avoid',
                  marginBottom: 12,
                  cursor: 'pointer',
                  borderRadius: 8,
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'block',
                  background: '#162032'
                }}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title || `Photo ${index + 1}`}
                  loading="lazy"
                  style={{ width: '100%', display: 'block', borderRadius: 8, transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.nextSibling.style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.nextSibling.style.opacity = '0';
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 8,
                  background: 'rgba(0,0,0,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.3s ease'
                }}>
                  <ZoomIn size={28} color="white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox.open && currentPhoto && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(5,8,15,0.97)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 16,
          backdropFilter: 'blur(8px)'
        }}
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: 'white', padding: 10, borderRadius: 8, cursor: 'pointer',
              display: 'flex', zIndex: 10
            }}
          >
            <X size={22} />
          </button>

          {/* Counter */}
          <div style={{
            position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)',
            fontSize: 13, color: 'rgba(255,255,255,0.5)', zIndex: 10
          }}>
            {lightbox.index + 1} / {photos.length}
          </div>

          {/* Download */}
          <a
            href={currentPhoto.imageUrl}
            download
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 20, right: 72,
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: 'white', padding: 10, borderRadius: 8, cursor: 'pointer',
              display: 'flex', zIndex: 10
            }}
          >
            <Download size={18} />
          </a>

          {/* Prev */}
          <button
            onClick={e => { e.stopPropagation(); prevPhoto(); }}
            style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
              padding: 14, borderRadius: 8, cursor: 'pointer', zIndex: 10, display: 'flex'
            }}
          >
            <ChevronLeft size={26} />
          </button>

          {/* Next */}
          <button
            onClick={e => { e.stopPropagation(); nextPhoto(); }}
            style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
              padding: 14, borderRadius: 8, cursor: 'pointer', zIndex: 10, display: 'flex'
            }}
          >
            <ChevronRight size={26} />
          </button>

          {/* Image */}
          <img
            src={currentPhoto.imageUrl}
            alt={currentPhoto.title}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '85vh',
              objectFit: 'contain', borderRadius: 8,
              boxShadow: '0 20px 80px rgba(0,0,0,0.8)'
            }}
          />

          {currentPhoto.title && (
            <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
              {currentPhoto.title}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
