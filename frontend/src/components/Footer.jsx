import React from 'react';

export default function Footer({ currentUser }) {
  return (
    <footer className="app-footer">
      <p>© 2026 SIH26165 • Authenticated User: <strong>{currentUser.full_name} ({currentUser.role.toUpperCase()})</strong></p>
    </footer>
  );
}
