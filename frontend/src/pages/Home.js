import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { albumsAPI } from '../utils/api';
import { ImageIcon, Calendar, ChevronRight } from 'lucide-react';

export default function Home() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    albumsAPI.getAll()
      .then(res => setAlbums(res.data))
      .catch(() => setError('Failed to load albums'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <header style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '100px 24px 60px',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,168,76,0.12) 0%, transparent 70%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative rings */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700, height: 700,
          border: '1px solid rgba(201,168,76,0.06)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500, height: 500,
          border: '1px solid rgba(201,168,76,0.08)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />

        <div style={{
          display: 'inline-block',
          background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.25)',
          color: '#c9a84c',
          padding: '6px 18px',
          borderRadius: 20,
          fontSize: 12,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 28,
          fontWeight: 600
        }}>
          Batch 2023 – 2026
        </div>

        <h1 style={{
          fontFamily: 'Cormorant Garamond',
          fontSize: 'clamp(40px, 8vw, 88px)',
          fontWeight: 700,
          lineHeight: 1.05,
          marginBottom: 20,
          background: 'linear-gradient(180deg, #f0ece4 0%, #9ba8b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Memories<br />
          <em style={{ color: '#c9a84c', WebkitTextFillColor: '#c9a84c' }}>Captured</em>
        </h1>

        <p style={{
          fontSize: 16,
          color: '#9ba8b8',
          maxWidth: 480,
          marginBottom: 16,
          lineHeight: 1.7
        }}>
          Shree P M Patel College of Computer Science &amp; Technology
        </p>
        <p style={{
          fontSize: 14,
          color: '#5c6a7a',
          marginBottom: 48
        }}>
          BCA Department · Official Photo Albums
        </p>

        <a href="#albums" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
          <ImageIcon size={17} /> Browse Albums
        </a>
      </header>

      {/* Divider */}
      <div style={{
        textAlign: 'center',
        padding: '16px 0 8px',
        position: 'relative'
      }}>
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)',
          margin: '0 auto', maxWidth: 600
        }} />
      </div>

      {/* Albums Section */}
      <section id="albums" style={{ padding: '60px 24px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 10 }}>
            Photo Albums
          </h2>
          <p style={{ color: '#9ba8b8', fontSize: 15 }}>
            {albums.length} album{albums.length !== 1 ? 's' : ''} · Click to explore
          </p>
        </div>

        {loading && (
          <div className="page-loader">
            <div className="spinner" />
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', color: '#ef4444', padding: 40 }}>{error}</div>
        )}

        {!loading && !error && albums.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            background: 'var(--surface)', borderRadius: 16,
            border: '1px solid var(--border)'
          }}>
            <ImageIcon size={48} color="#5c6a7a" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#9ba8b8', fontSize: 16 }}>No albums yet. Check back soon!</p>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24
        }}>
          {albums.map(album => (
            <Link
              key={album._id}
              to={`/album/${album._id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Cover image */}
                <div style={{
                  height: 200,
                  background: album.coverImage
                    ? `url(${album.coverImage}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #162032, #1e2a3a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative'
                }}>
                  {!album.coverImage && (
                    <ImageIcon size={40} color="#5c6a7a" />
                  )}
                  {/* Gradient overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(11,15,26,0.7) 0%, transparent 60%)'
                  }} />
                  <div style={{
                    position: 'absolute', bottom: 12, left: 14, right: 14,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
                  }}>
                    <span style={{
                      fontSize: 12, color: 'rgba(255,255,255,0.7)',
                      display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <ImageIcon size={12} />
                      {album.photoCount || 0} photos
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: 18 }}>
                  <h3 style={{
                    fontFamily: 'Cormorant Garamond',
                    fontSize: 22, fontWeight: 700,
                    marginBottom: 6, color: '#f0ece4'
                  }}>
                    {album.title}
                  </h3>
                  {album.description && (
                    <p style={{
                      fontSize: 13, color: '#9ba8b8', marginBottom: 12,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {album.description}
                    </p>
                  )}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: 12, color: '#5c6a7a',
                      display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <Calendar size={12} /> {formatDate(album.date)}
                    </span>
                    <span style={{
                      fontSize: 12, color: '#c9a84c',
                      display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      View <ChevronRight size={13} />
                    </span>
                  </div>

                  {album.tags && album.tags.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {album.tags.slice(0, 3).map(t => (
                        <span key={t} className="tag">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '32px 24px',
        borderTop: '1px solid var(--border)',
        color: '#5c6a7a',
        fontSize: 13
      }}>
        <p style={{ marginBottom: 4, fontFamily: 'Cormorant Garamond', fontSize: 16, color: '#9ba8b8' }}>
          Shree P M Patel College of Computer Science &amp; Technology
        </p>
        <p>BCA Batch 2023 – 2026 · All Rights Reserved</p>
      </footer>
    </div>
  );
}
