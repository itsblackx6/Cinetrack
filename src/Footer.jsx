import React, { useState } from 'react';

export default function Footer() {
  const [modalType, setModalType] = useState(null);

  const closeModal = () => setModalType(null);

  return (
    <footer style={{
      backgroundColor: '#05080f',
      borderTop: '1px solid #1e293b',
      color: '#94a3b8',
      padding: '24px 16px',
      fontSize: '14px',
      textAlign: 'center',
      marginTop: '40px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Amazon Affiliate Banner */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px dashed #38bdf8',
          borderRadius: '8px',
          padding: '12px',
          color: '#e2e8f0'
        }}>
          🍿 <strong>Movie Merch & 4K Blu-rays:</strong> Check out cinema collections & gear on{' '}
          <a 
            href="https://www.amazon.in/?tag=cinetrack-21" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#38bdf8', textDecoration: 'underline', fontWeight: 'bold' }}
          >
            Amazon Official Store
          </a>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setModalType('privacy')}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Privacy Policy
          </button>
          <button 
            onClick={() => setModalType('about')}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}
          >
            About CineTrack
          </button>
          <button 
            onClick={() => setModalType('contact')}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Contact Us
          </button>
        </div>

        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
          © {new Date().getFullYear()} CineTrack. Film metadata & posters provided by TMDB. Monetized via Google AdSense & Affiliate Partners.
        </p>
      </div>

      {/* Modal Popup for Legal Pages */}
      {modalType && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '12px',
            maxWidth: '550px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '24px',
            textAlign: 'left',
            color: '#cbd5e1'
          }}>
            {modalType === 'privacy' && (
              <div>
                <h3 style={{ color: '#f8fafc', marginTop: 0 }}>Privacy Policy</h3>
                <p>Welcome to CineTrack (<code>cinetrack-eta-ten.vercel.app</code>). Your privacy is of high importance to us.</p>
                <h4 style={{ color: '#38bdf8' }}>Google AdSense & Cookies</h4>
                <p>We use Google AdSense to serve advertisements when you visit our website. Google and its partners may use cookies (including the DoubleClick cookie) to serve ads based on your prior visits to this website or other sites on the Internet.</p>
                <p>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>Google Ad Settings</a>.</p>
                <h4 style={{ color: '#38bdf8' }}>Third-Party Links</h4>
                <p>CineTrack participates in affiliate marketing programs, including the Amazon Services LLC Associates Program. Clicking affiliate links may earn us a small commission at no additional cost to you.</p>
              </div>
            )}

            {modalType === 'about' && (
              <div>
                <h3 style={{ color: '#f8fafc', marginTop: 0 }}>About CineTrack</h3>
                <p>CineTrack is a modern web application designed for movie enthusiasts to discover trending films, watch official cinema trailers, and manage their personal watchlists effortlessly.</p>
                <p>All film information, descriptions, ratings, and media are sourced using public entertainment APIs, including The Movie Database (TMDB).</p>
              </div>
            )}

            {modalType === 'contact' && (
              <div>
                <h3 style={{ color: '#f8fafc', marginTop: 0 }}>Contact Us</h3>
                <p>Have feedback, questions, or cinema recommendations? We'd love to hear from you.</p>
                <p>For inquiries, support, or privacy requests, contact us at:</p>
                <p style={{ color: '#38bdf8', fontWeight: 'bold' }}>support@cinetrack.vercel.app</p>
              </div>
            )}

            <button 
              onClick={closeModal}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '10px',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
