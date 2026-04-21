import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { albumsAPI } from '../utils/api';
import { Plus, Pencil, Trash2, QrCode, ImageIcon, Calendar, X, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const SITE_URL = process.env.REACT_APP_SITE_URL || window.location.origin;

export default function AdminDashboard() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'qr' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', date: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [qrAlbum, setQrAlbum] = useState(null);

  const loadAlbums = () => {
    albumsAPI.getAll()
      .then(res => setAlbums(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAlbums(); }, []);

  const openCreate = () => {
    setForm({ title: '', description: '', date: new Date().toISOString().slice(0, 10), tags: '' });
    setSelected(null);
    setModal('create');
  };

  const openEdit = (album) => {
    setForm({
      title: album.title,
      description: album.description || '',
      date: album.date ? album.date.slice(0, 10) : '',
      tags: album.tags ? album.tags.join(', ') : ''
    });
    setSelected(album);
    setModal('edit');
  };

  const openQr = (album) => {
    setQrAlbum(album);
    setModal('qr');
  };

  const openDelete = (album) => {
    setSelected(album);
    setModal('delete');
  };

  const closeModal = () => { setModal(null); setSelected(null); setQrAlbum(null); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date || new Date().toISOString(),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      if (modal === 'create') {
        const res = await albumsAPI.create(payload);
        setAlbums(prev => [res.data, ...prev]);
        toast.success('Album created!');
      } else {
        const res = await albumsAPI.update(selected._id, payload);
        setAlbums(prev => prev.map(a => a._id === selected._id ? res.data : a));
        toast.success('Album updated!');
      }
      closeModal();
    } catch (err) {
      toast.error('Failed to save album');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await albumsAPI.delete(selected._id);
      setAlbums(prev => prev.filter(a => a._id !== selected._id));
      toast.success('Album deleted');
      closeModal();
    } catch {
      toast.error('Failed to delete album');
    } finally {
      setSaving(false);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 340;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 300, 340);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 25, 25, 250, 250);
      ctx.fillStyle = '#0b0f1a';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(qrAlbum.title, 150, 310);
      const link = document.createElement('a');
      link.download = `qr-${qrAlbum.title}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, padding: '80px 24px 60px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: 40, fontWeight: 700, marginBottom: 4 }}>
            Albums Dashboard
          </h1>
          <p style={{ color: '#9ba8b8', fontSize: 14 }}>
            Manage BCA Batch 2023–26 photo albums
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary" style={{ fontSize: 15, padding: '11px 22px' }}>
          <Plus size={18} /> New Album
        </button>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 16, marginBottom: 36
      }}>
        {[
          { label: 'Total Albums', value: albums.length, icon: <ImageIcon size={20} color="#c9a84c" /> },
          { label: 'Total Photos', value: albums.reduce((s, a) => s + (a.photoCount || 0), 0), icon: <QrCode size={20} color="#c9a84c" /> }
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ background: 'rgba(201,168,76,0.1)', padding: 10, borderRadius: 10 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Cormorant Garamond' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#9ba8b8' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Albums list */}
      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : albums.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 40px',
          background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)'
        }}>
          <ImageIcon size={48} color="#5c6a7a" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#9ba8b8', marginBottom: 20 }}>No albums yet. Create your first one!</p>
          <button onClick={openCreate} className="btn btn-primary"><Plus size={16} /> Create Album</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {albums.map(album => (
            <div key={album._id} className="card" style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 20px', flexWrap: 'wrap'
            }}>
              {/* Cover thumb */}
              <div style={{
                width: 60, height: 60, borderRadius: 8, flexShrink: 0,
                background: album.coverImage ? `url(${album.coverImage}) center/cover` : 'var(--bg3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {!album.coverImage && <ImageIcon size={22} color="#5c6a7a" />}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: 20, fontWeight: 700, marginBottom: 2 }}>
                  {album.title}
                </h3>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#9ba8b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={11} /> {formatDate(album.date)}
                  </span>
                  <span style={{ fontSize: 12, color: '#9ba8b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ImageIcon size={11} /> {album.photoCount || 0} photos
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                <button onClick={() => openQr(album)} className="btn btn-outline btn-sm" title="QR Code">
                  <QrCode size={14} /> QR
                </button>
                <Link to={`/admin/album/${album._id}`} className="btn btn-outline btn-sm">
                  <ImageIcon size={14} /> Photos
                </Link>
                <button onClick={() => openEdit(album)} className="btn btn-outline btn-sm">
                  <Pencil size={14} />
                </button>
                <button onClick={() => openDelete(album)} className="btn btn-danger btn-sm">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- MODALS ---- */}
      {(modal === 'create' || modal === 'edit') && (
        <ModalOverlay onClose={closeModal}>
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: 28, marginBottom: 24 }}>
            {modal === 'create' ? 'Create Album' : 'Edit Album'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#9ba8b8', display: 'block', marginBottom: 6 }}>Album Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Freshers Party 2023" />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#9ba8b8', display: 'block', marginBottom: 6 }}>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Brief description..."
                style={{ resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#9ba8b8', display: 'block', marginBottom: 6 }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#9ba8b8', display: 'block', marginBottom: 6 }}>Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g. fest, sports, convocation" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'flex-end' }}>
            <button onClick={closeModal} className="btn btn-outline">Cancel</button>
            <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : modal === 'create' ? 'Create Album' : 'Save Changes'}
            </button>
          </div>
        </ModalOverlay>
      )}

      {modal === 'delete' && selected && (
        <ModalOverlay onClose={closeModal}>
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: 28, marginBottom: 12 }}>Delete Album?</h2>
          <p style={{ color: '#9ba8b8', marginBottom: 8 }}>
            This will permanently delete <strong style={{ color: '#f0ece4' }}>{selected.title}</strong> and all its photos.
          </p>
          <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 28 }}>This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={closeModal} className="btn btn-outline">Cancel</button>
            <button onClick={handleDelete} className="btn btn-danger" disabled={saving}>
              {saving ? 'Deleting...' : 'Delete Album'}
            </button>
          </div>
        </ModalOverlay>
      )}

      {modal === 'qr' && qrAlbum && (
        <ModalOverlay onClose={closeModal}>
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: 28, marginBottom: 6 }}>QR Code</h2>
          <p style={{ color: '#9ba8b8', fontSize: 14, marginBottom: 24 }}>
            Scan to view <strong style={{ color: '#f0ece4' }}>{qrAlbum.title}</strong>
          </p>
          <div style={{
            background: 'white', borderRadius: 12, padding: 20,
            display: 'inline-block', margin: '0 auto 20px', display: 'flex', justifyContent: 'center'
          }}>
            <QRCodeSVG
              id="qr-svg"
              value={`${SITE_URL}/album/${qrAlbum._id}`}
              size={220}
              bgColor="#ffffff"
              fgColor="#0b0f1a"
              level="H"
              includeMargin={false}
            />
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#5c6a7a', marginBottom: 20, wordBreak: 'break-all' }}>
            {SITE_URL}/album/{qrAlbum._id}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={downloadQR} className="btn btn-primary">
              <QrCode size={16} /> Download QR
            </button>
            <a
              href={`${SITE_URL}/album/${qrAlbum._id}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
            >
              <ExternalLink size={15} /> Open Album
            </a>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150,
      background: 'rgba(5,8,15,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, backdropFilter: 'blur(6px)'
    }} onClick={onClose}>
      <div
        className="card"
        style={{ padding: 32, width: '100%', maxWidth: 480, position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'none', border: 'none', color: '#5c6a7a', cursor: 'pointer', display: 'flex'
        }}>
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
