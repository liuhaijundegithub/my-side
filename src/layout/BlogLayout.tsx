import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import styles from './BlogLayout.module.less';

const BlogLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default BlogLayout;
