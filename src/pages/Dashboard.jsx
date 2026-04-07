import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BlogCard from '../components/BlogCard';
import BlogFormModal from '../components/BlogFormModal';
import api from '../api/axiosConfig';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const navigate = useNavigate();

  // Fetch user and blogs on mount and after mutation
  const fetchUserAndBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/user');
      setUser(res.data.user);
      setBlogs(res.data.blogs);
    } catch (err) {
      setUser(null);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndBlogs();
    // eslint-disable-next-line
  }, []);

  // Modal open/close helpers
  const openCreateModal = () => {
    setEditingBlog(null);
    setModalOpen(true);
  };
  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingBlog(null);
  };

  // Delete blog
  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await api.delete(`/api/blogs/${blogId}`);
      fetchUserAndBlogs();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error deleting blog.');
    }
  };

  // Navigation
  const handleProfile = (e) => {
    e.preventDefault();
    navigate('/profile');
  };
  const handleLogout = (e) => {
    e.preventDefault();
    window.location.href = '/logout';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1aec6', fontSize: '1.5rem' }}>
        Loading...
      </div>
    );
  }
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '1.5rem' }}>
        Error loading dashboard.
      </div>
    );
  }

  return (
    <>
      <Navbar username={user.username} onProfile={handleProfile} onLogout={handleLogout} />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-photo">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=64748b&textColor=ffffff&scale=85`}
              alt={user.username}
            />
          </div>
          <div className="hero-info">
            <div>
              <span className="hero-username">{user.name}</span>
              <span className="hero-divider">/</span>
              <span className="hero-userid">{user.userId}</span>
            </div>
            <div className="hero-meta">
              @{user.username} • Joined {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </section>
      {/* Blogs Section */}
      <section className="blogs-section">
        <h2 className="section-title">Latest Articles</h2>
        <button className="create-blog-btn" onClick={openCreateModal}>+ Create Blog Post</button>
        <div className="blogs-grid">
          {blogs && blogs.length > 0 ? (
            blogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onEdit={openEditModal}
                onDelete={handleDeleteBlog}
              />
            ))
          ) : (
            <div className="blog-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#a1aec6', fontSize: '1rem' }}>
                No blogs yet. Start by creating your first blog!
              </p>
            </div>
          )}
        </div>
      </section>
      {/* Modal (Create/Edit) */}
      <BlogFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        editingBlog={editingBlog}
        onSuccess={fetchUserAndBlogs}
      />
    </>
  );
};

export default Dashboard;
