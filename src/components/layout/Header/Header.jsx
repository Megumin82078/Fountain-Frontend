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
          <button className={styles.menuButton} onClick={onMenuClick} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <span className={styles.logoSymbol}>🏥</span>
            </div>
            <span className={styles.logoText}>Fountain</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <button 
            className={styles.searchButton}
            onClick={onSearchClick}
            title="Search records, conditions, providers... (⌘K)"
          >
            <div className={styles.searchIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className={styles.searchText}>Search records, conditions...</span>
            <div className={styles.searchShortcut}>
              <span>⌘</span><span>K</span>
            </div>
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