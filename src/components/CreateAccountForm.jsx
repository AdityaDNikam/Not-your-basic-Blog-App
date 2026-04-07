import React, { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../api/axiosConfig';

const CreateAccountForm = ({ onSuccess, onSwitchForm }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePasswordChange = (val) => {
    setPassword(val);
    setPasswordMatchError(val !== confirmPassword && confirmPassword.length > 0);
  };
  const handleConfirmPasswordChange = (val) => {
    setConfirmPassword(val);
    setPasswordMatchError(val !== password && val.length > 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordMatchError(false);
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setPasswordMatchError(true);
      return;
    }
    if (!/^[0-9]{10}$/.test(number)) {
      setError('Phone number must be 10 digits');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/create_profile', {
        name,
        username,
        email,
        password,
        number,
      });
      setSubmitting(false);
      if (res.data && res.data.redirect) {
        onSuccess(res.data.redirect);
      }
    } catch (err) {
      setSubmitting(false);
      setError(err.response?.data?.message || err.message || 'Error creating account');
    }
  };

  return (
    <div className="premium-card">
      <div className="card-header">
        <h2 className="card-title">Create Account</h2>
        <p className="card-subtitle">Manage your credentials and access the platform.</p>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="card-body">
          <h3 className="section-title">Account Details</h3>
          <p className="section-subtitle">Please fill out your information securely below.</p>
          
          <div className="inputs-container">
            <input type="text" id="ca-name" className="preset-input" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)} />
            <input type="text" id="ca-username" className="preset-input" placeholder="Username" required value={username} onChange={e => setUsername(e.target.value)} />
            <input type="email" id="ca-email" className="preset-input" placeholder="name@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" id="ca-password" className="preset-input" placeholder="Password (min 6 ch)" required value={password} onChange={e => handlePasswordChange(e.target.value)} />
            <input type="password" id="ca-confirm-password" className="preset-input" placeholder="Confirm Password" required value={confirmPassword} onChange={e => handleConfirmPasswordChange(e.target.value)} />
            {passwordMatchError && <div className="match-error">Passwords don't match</div>}
            <input type="tel" id="ca-number" className="preset-input" placeholder="Phone Number (10 digits)" pattern="[0-9]{10}" required value={number} onChange={e => setNumber(e.target.value)} />
          </div>
          {error && <div className="error-message show">{error}</div>}
        </div>

        <div className="card-footer">
          <button type="button" className="btn-light" onClick={(e) => { e.preventDefault(); onSwitchForm('login'); }}>Login instead</button>
          <button type="submit" className="btn-dark" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
};

CreateAccountForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onSwitchForm: PropTypes.func.isRequired,
};

export default CreateAccountForm;
