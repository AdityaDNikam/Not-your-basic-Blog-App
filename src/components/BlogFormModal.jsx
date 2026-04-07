import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import api from '../api/axiosConfig';

const BlogFormModal = ({ isOpen, onClose, editingBlog, onSuccess }) => {
  const [blogHeader, setBlogHeader] = useState(editingBlog ? editingBlog.Blog_header : '');
  const [blogMsg, setBlogMsg] = useState(editingBlog ? editingBlog.Blog_msg : '');
  const [blogUrl, setBlogUrl] = useState(editingBlog ? editingBlog.related_url || '' : '');
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setBlogHeader(editingBlog ? editingBlog.Blog_header : '');
    setBlogMsg(editingBlog ? editingBlog.Blog_msg : '');
    setBlogUrl(editingBlog ? editingBlog.related_url || '' : '');
    setModalError('');
  }, [editingBlog, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!blogHeader.trim() || !blogMsg.trim()) {
      setModalError('Title and content are required.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingBlog) {
        await api.put(`/api/blogs/${editingBlog._id}`, {
          Blog_header: blogHeader,
          Blog_msg: blogMsg,
          related_url: blogUrl || null,
        });
      } else {
        await api.post('/api/blogs', {
          Blog_header: blogHeader,
          Blog_msg: blogMsg,
          related_url: blogUrl || null,
        });
      }
      onClose();
      onSuccess();
    } catch (err) {
      setModalError(
        err.response?.data?.message || err.message || 'Error saving blog.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        {editingBlog ? 'Edit Blog Post' : 'Create Blog Post'}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="blogHeader">Blog Title</label>
          <input
            type="text"
            id="blogHeader"
            className="form-input"
            required
            placeholder="Enter blog title"
            value={blogHeader}
            onChange={e => setBlogHeader(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="blogMsg">Blog Content</label>
          <textarea
            id="blogMsg"
            className="form-textarea"
            required
            placeholder="Enter blog content"
            value={blogMsg}
            onChange={e => setBlogMsg(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="blogUrl">Related URL (Optional)</label>
          <input
            type="url"
            id="blogUrl"
            className="form-input"
            placeholder="Enter related URL (optional)"
            value={blogUrl}
            onChange={e => setBlogUrl(e.target.value)}
          />
        </div>
        {modalError && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.95rem' }}>{modalError}</div>
        )}
        <div className="modal-actions">
          <button type="button" className="btn-modal btn-cancel" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn-modal btn-submit" disabled={submitting}>{submitting ? 'Saving...' : 'Submit'}</button>
        </div>
      </form>
    </Modal>
  );
};

BlogFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editingBlog: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default BlogFormModal;
