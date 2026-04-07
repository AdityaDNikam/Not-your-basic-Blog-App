import React from 'react';
import PropTypes from 'prop-types';

const Navbar = ({ username, onProfile, onLogout }) => (
  <nav>
    <div className="nav-username">{username}</div>
    <div className="nav-buttons">
      <a href="/profile" className="nav-btn" onClick={onProfile}>Profile</a>
      <a href="/logout" className="nav-btn logout" onClick={onLogout}>Logout</a>
    </div>
  </nav>
);

Navbar.propTypes = {
  username: PropTypes.string.isRequired,
  onProfile: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Navbar;
