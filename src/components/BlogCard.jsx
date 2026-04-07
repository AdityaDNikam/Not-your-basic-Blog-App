import React from 'react';
import PropTypes from 'prop-types';

const BlogCard = ({ blog, onEdit, onDelete }) => (
  <div className="blog-card">
    <h3 className="blog-title">{blog.Blog_header}</h3>
    <p className="blog-message">{blog.Blog_msg}</p>
    {blog.related_url ? (
      <div className="blog-footer">
        <a
          href={blog.related_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.3s ease' }}
        >
          View link →
        </a>
      </div>
    ) : (
      <div className="blog-footer">
        {new Date(blog.createdAt).toLocaleDateString()}
      </div>
    )}
    <div className="blog-actions">
      <button className="btn-action btn-edit" onClick={() => onEdit(blog)}>
        ✏️ Edit
      </button>
      <button className="btn-action btn-delete" onClick={() => onDelete(blog._id)}>
        🗑️ Delete
      </button>
    </div>
  </div>
);

BlogCard.propTypes = {
  blog: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default BlogCard;
