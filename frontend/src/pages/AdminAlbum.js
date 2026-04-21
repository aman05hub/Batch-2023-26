import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { albumsAPI, photosAPI } from '../utils/api';
import { ArrowLeft, Upload, Trash2, Star, X, ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAlbum() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileInputRef = useRef();

  const load = () => {
    albumsAPI.getOne(id)
      .then(res => {
        setAlbum(res.data.album);
        setPhotos(res.data.photos);
      })
      .catch(() => toast.error('Failed to load album'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) { toast.error('Please select image files'); return; }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus(`Uploading ${imageFiles.length} photo(s)...`);

    const formData = new FormData();
    formData.append('albumId', id);
    imageFiles.forEach(f => formData.append('photos', f));

    try {
      const res = await photosAPI.upload(formData, (e) => {
        if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      });
      toast.success(`${res.data.photos.length} photos uploaded!`);
      setUploadStatus('');
      load();
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
      setUploadStatus('');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (photo) => {
    try {
      await photosAPI.delete(photo._id);
      setPhotos(prev => prev.filter(p => p._id !== photo._id));
      setAlbum(prev => ({ ...prev, photoCount: (prev.photoCount || 1) - 1 }));
      toast.success('Photo deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete photo');
    }
  };

  const handleSetCover = async (photo) => {
    try {
      await photosAPI.setCover(id, photo._id);
      setAlbum(prev => ({ ...prev, coverImage: photo.imageUrl }));
      toast.success('Cover updated!');
    } catch {
      toast.error('Failed to set cover');
    }
  };

  if (loading) return <div className="page-loader" style={{ marginTop: 80 }}><div className="spinner" /></div>;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, padding: '80px 24px 60px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Back */}
      <Link to="/admin" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: '#9ba8b8', fontSize: 14, marginBottom: 24,
        transition: 'color 0.2s'
      }}>
        <ArrowLeft size={15} /> Dashboard
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: 38, fontWeight: 700, marginBottom: 4 }}>
          {album?.title}
        </h1>
        <p style={{ color: '#9ba8b8', fontSize: 14 }}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''} · Manage and upload photos
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#c9a84c' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 16,
          padding: '40px 24px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragOver ? 'rgba(201,168,76,0.05)' : 'var(--surface)',
          transition: 'all 0.2s',
          marginBottom: 36
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />

        {uploading ? (
          <div>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(201,168,76,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <div className="spinner" style={{ width: 30, height: 30 }} />
            </div>
            <p style={{ color: '#f0ece4', fontSize: 16, marginBottom: 8 }}>{uploadStatus}</p>
            <div style={{
              background: 'var(--bg3)', borderRadius: 6, height: 8,
              width: 240, margin: '0 auto', overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', background: 'linear-gradient(90deg, #c9a84c, #e8c97a)',
                width: `${uploadProgress}%`, transition: 'width 0.3s', borderRadius: 6
              }} />
            </div>
            <p style={{ color: '#9ba8b8', fontSize: 13, marginTop: 8 }}>{uploadProgress}%</p>
          </div>
        ) : (
          <div>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(201,168,76,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Upload size={28} color="#c9a84c" />
            </div>
            <p style={{ color: '#f0ece4', fontSize: 16, marginBottom: 6 }}>
              Drag & drop photos here, or click to browse
            </p>
            <p style={{ color: '#9ba8b8', fontSize: 13 }}>
              JPG, PNG, WEBP — up to 50 photos at once — 20MB per file
            </p>
          </div>
        )}
      </div>
          
      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 40px',
          background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)'
        }}>
          <ImageIcon size={44} color="#5c6a7a" style={{ margin: '0 auto 14px' }} />
          <p style={{ color: '#9ba8b8' }}>No photos yet. Upload some above!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12
        }}>
          {photos.map(photo => (
            <div key={photo._id} style={{
              position: 'relative', borderRadius: 8, overflow: 'hidden',
              background: '#162032', aspectRatio: '1',
              border: album?.coverImage === photo.imageUrl ? '2px solid #c9a84c' : '2px solid transparent'
            }}>
              <img
                src={photo.imageUrl}
                alt={photo.title}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Overlay on hover */}
              <div className="photo-overlay" style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 8, opacity: 0, transition: 'opacity 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0'}
              >
                <button
                  onClick={() => handleSetCover(photo)}
                  title="Set as album cover"
                  style={{
                    background: 'rgba(201,168,76,0.85)', border: 'none',
                    color: '#0b0f1a', padding: '6px 10px', borderRadius: 6,
                    cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5
                  }}
                >
                  <Star size={13} /> Cover
                </button>
                <button
                  onClick={() => setDeleteTarget(photo)}
                  style={{
                    background: 'rgba(239,68,68,0.8)', border: 'none',
                    color: 'white', padding: '6px 10px', borderRadius: 6,
                    cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5
                  }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
              {/* Cover badge */}
              {album?.coverImage === photo.imageUrl && (
                <div style={{
                  position: 'absolute', top: 6, left: 6,
                  background: '#c9a84c', color: '#0b0f1a',
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 7px', borderRadius: 4
                }}>
                  COVER
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 150,
          background: 'rgba(5,8,15,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16, backdropFilter: 'blur(6px)'
        }} onClick={() => setDeleteTarget(null)}>
          <div className="card" style={{ padding: 28, maxWidth: 380, width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: 24, marginBottom: 12 }}>Delete Photo?</h3>
            <p style={{ color: '#9ba8b8', fontSize: 14, marginBottom: 24 }}>
              This will permanently delete this photo from ImageKit. Cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteTarget(null)} className="btn btn-outline btn-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteTarget)} className="btn btn-danger btn-sm">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
