import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Navbar.module.scss';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>🏠 Immo Mada</Link>
        <div className={styles.links}>
          {isAuthenticated ? (
            <>
              <Link to="/predictions">Mes Prédictions</Link>
              <Link to="/profile">Profil ({user?.username})</Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/login">Connexion</Link>
              <Link to="/register" className={styles.btnPrimary}>Inscription</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};