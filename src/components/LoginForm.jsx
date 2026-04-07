import React, { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../api/axiosConfig';

const LoginForm = ({ onSuccess, onSwitchForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/login_user', { email, password });
      setSubmitting(false);
      if (res.data && res.data.redirect) {
        onSuccess(res.data.redirect);
      }
    } catch (err) {
      setSubmitting(false);
      setError(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <div className="premium-card">
      <div className="card-header">
        <h2 className="card-title">Welcome Back</h2>
        <p className="card-subtitle">Manage your work and resume session.</p>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="card-body">
          <h3 className="section-title">Login Credentials</h3>
          <p className="section-subtitle">Please enter your authenticated email and password.</p>
          
          <div className="inputs-container">
            <input type="email" id="login-email" className="preset-input" placeholder="name@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" id="login-password" className="preset-input" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <div className="error-message show">{error}</div>}
        </div>

        <div className="card-footer">
          <button type="button" className="btn-light" onClick={(e) => { e.preventDefault(); onSwitchForm('create'); }}>Create Account</button>
          <button type="submit" className="btn-dark" disabled={submitting}>{submitting ? 'Authenticating...' : 'Sign In'}</button>
        </div>
      </form>
    </div>
  );
};

LoginForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onSwitchForm: PropTypes.func.isRequired,
};

export default LoginForm;
