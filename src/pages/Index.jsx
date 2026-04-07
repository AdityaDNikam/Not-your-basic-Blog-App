import React, { useState } from 'react';
import Modal from '../components/Modal';
import LoginForm from '../components/LoginForm';
import CreateAccountForm from '../components/CreateAccountForm';
import '../styles/index.css';

const Index = () => {
  const [activeModal, setActiveModal] = useState(null); // null | 'login' | 'createAccount'

  // Handle auth success: redirect to returned path
  const handleAuthSuccess = (redirectPath) => {
    window.location.href = redirectPath;
  };

  return (
    <>
      {/* Decorative elements */}
      <div className="decoration decoration-top-left"></div>
      <div className="decoration decoration-bottom-right"></div>

      {/* Navigation Bar */}
      <nav>
        <div className="nav-brand">Nispadaya</div>
        <div className="nav-links">
          <a href="#" className="nav-link" onClick={e => { e.preventDefault(); setActiveModal('login'); }}>Login</a>
          <a href="#" className="nav-link" onClick={e => { e.preventDefault(); setActiveModal('createAccount'); }}>Create Account</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1>Nispadaya! Just get it done!</h1>
        <p className="hero-subtitle">Discover amazing stories and content at your own pace. Your reading companion is always here.</p>
        <div className="hero-buttons">
          <a href="#" className="btn btn-primary" onClick={e => { e.preventDefault(); setActiveModal('createAccount'); }}>Get Started</a>
          <a href="#" className="btn btn-secondary" onClick={e => e.preventDefault()}>Learn More</a>
        </div>
      </section>

      {/* Modals */}
      <Modal isOpen={activeModal === 'login'} onClose={() => setActiveModal(null)}>
        <LoginForm
          onSuccess={handleAuthSuccess}
          onSwitchForm={form => setActiveModal(form === 'create' ? 'createAccount' : 'login')}
        />
      </Modal>
      <Modal isOpen={activeModal === 'createAccount'} onClose={() => setActiveModal(null)}>
        <CreateAccountForm
          onSuccess={handleAuthSuccess}
          onSwitchForm={form => setActiveModal(form === 'login' ? 'login' : 'createAccount')}
        />
      </Modal>
    </>
  );
};

export default Index;
