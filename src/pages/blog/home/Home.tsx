import React from 'react';
import { profileInfo } from '../shared/constants';
import styles from './Home.module.less';
import img from '@/assets/images/me.jpg';

const Home: React.FC = () => {
  return (
    <div className={styles.home}>
      {/* 问候语 */}
      <section className={styles.section}>
        <p className={styles.greeting}>
          Hi 👋，我是{profileInfo.name}（{profileInfo.nickname}）。
        </p>
      </section>

      {/* 关于本站 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>关于本站</h2>
        <div className={styles.aboutSite}>
          <p>这是我的博客。</p>
        </div>
      </section>

      {/* 关于我 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>关于我</h2>
        <div className={styles.aboutMe}>
          <img
            src={img}
            alt={profileInfo.name}
            className={styles.avatar}
          />
          <div className={styles.bio}>
            <p>{profileInfo.bio}</p>
            <p>
              {profileInfo.projects.map((project, index) => (
                <span key={index}>
                  {project}
                  {index < profileInfo.projects.length - 1 ? '、' : '。'}
                </span>
              ))}
            </p>
            <p>
              除了这里，你还可以在
              {profileInfo.socialLinks.map((link, index) => (
                <span key={link.name}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    {link.name}
                  </a>
                  {index < profileInfo.socialLinks.length - 1 ? '、' : ''}
                </span>
              ))}
              找到我。
            </p>
          </div>
        </div>
      </section>

      {/* 备案信息 */}
      <footer className={styles.footer}>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          苏ICP备2026010442号
        </a>
      </footer>
    </div>
  );
};

export default Home;
