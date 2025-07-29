import { useState } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import GlobalSearch from '../../shared/GlobalSearch/GlobalSearch';
import styles from './AppLayout.module.css';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleSearchOpen = () => {
    setSearchOpen(true);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
  };

  return (
    <div className={styles.appLayout}>
      <Header 
        onMenuClick={handleSidebarToggle} 
        onSearchClick={handleSearchOpen}
      />
      <div className={styles.content}>
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <main className={styles.main}>
          {children}
        </main>
      </div>
      <GlobalSearch 
        isOpen={searchOpen} 
        onClose={handleSearchClose}
      />
    </div>
  );
};

export default AppLayout;