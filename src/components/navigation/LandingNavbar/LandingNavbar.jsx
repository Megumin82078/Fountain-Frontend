import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../shared/Button/Button';
import styles from './LandingNavbar.module.css';

const LandingNavbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Security', href: '#security' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const scrollToSection = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <div className={styles.logo} onClick={() => navigate('/')}>
          <div className={styles.logoIcon}>
            <span className={styles.logoSymbol}>🏥</span>
          </div>
          <span className={styles.logoText}>Fountain</span>
        </div>

        {/* Desktop Navigation */}
        <div className={styles.navLinks}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={styles.navLink}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(item.href);
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className={styles.navActions}>
          <Button
            variant="ghost"
            size="small"
            onClick={() => navigate('/login')}
            className={styles.loginButton}
          >
            Sign In
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={() => navigate('/signup')}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.mobileToggle}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileNavLinks}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={styles.mobileNavLink}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(item.href);
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className={styles.mobileActions}>
          <Button
            variant="ghost"
            size="medium"
            onClick={() => {
              navigate('/login');
              setIsMobileMenuOpen(false);
            }}
            className={styles.mobileButton}
          >
            Sign In
          </Button>
          <Button
            variant="primary"
            size="medium"
            onClick={() => {
              navigate('/signup');
              setIsMobileMenuOpen(false);
            }}
            className={styles.mobileButton}
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;