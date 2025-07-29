import React, { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../shared/Button/Button';
import styles from './Header.module.css';

const Header = ({ onMenuClick, onSearchClick }) => {
  const { user, logout } = useAuth();

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearchClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearchClick]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <button className={styles.menuButton} onClick={onMenuClick}>
            ☰
          </button>
          <div className={styles.logo}>
            <h2>Fountain</h2>
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <button 
            className={styles.searchButton}
            onClick={onSearchClick}
            title="Search (⌘K)"
          >
            <span className={styles.searchIcon}>🔍</span>
            <span className={styles.searchText}>Search records, conditions...</span>
            <span className={styles.searchShortcut}>⌘K</span>
          </button>
        </div>

        <nav className={styles.nav}>
          <a href="/dashboard">Dashboard</a>
          <a href="/records">Records</a>
          <a href="/profile">Profile</a>
        </nav>
        
        <div className={styles.userMenu}>
          <span className={styles.userName}>
            Welcome, {user?.firstName || 'User'}
          </span>
          <Button
            variant="ghost"
            size="small"
            onClick={logout}
            className={styles.logoutButton}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;