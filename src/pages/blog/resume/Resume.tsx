import React from 'react';
import styles from './Resume.module.less';

const Resume: React.FC = () => {
  return (
    <div className={styles.resume}>

      {/* 工作经历 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>工作经历</h2>

        <div className={styles.item}>
          <div className={styles.itemHeader}>
            <h3 className={styles.company}>Unisolution</h3>
            <span className={styles.date}>2020.04 - 至今</span>
          </div>
          <p className={styles.position}>前端负责人</p>

          <div className={styles.subSection}>
            <h4 className={styles.subTitle}>岗位职责</h4>
            <ul className={styles.workList}>
              <li>负责前端团队日常管理，主导业务开发与技术选型</li>
              <li>建立 Code Review 机制，把控代码质量与规范</li>
              <li>主导公司前端基础建设的开发、维护与迭代</li>
              <li>负责新人培训与技术分享，推动团队成长</li>
            </ul>
          </div>

          <div className={styles.subSection}>
            <h4 className={styles.subTitle}>前端工程化体系建设</h4>
            <p className={styles.description}>
              搭建完整的前端技术生态，形成「<a href="https://www.npmjs.com/package/unisolution-create-app" target="_blank" rel="noopener noreferrer">脚手架（uca）</a> + 项目模板（react-template）+ <a href="https://www.npmjs.com/package/navyd" target="_blank" rel="noopener noreferrer">组件库（navyd）</a>」三大核心基础设施，覆盖从项目立项、工程搭建、业务开发到打包部署的完整生命周期。
            </p>
            <ul className={styles.workList}>
              <li><strong>脚手架 + 模板：</strong>一键创建标准化项目，内置统一工程配置（构建、Lint、Git Hooks、Commit 规范），预集成 OSS、批量导入、全局错误处理等基础能力，开箱即用</li>
              <li><strong>useMana 配置化方案：</strong>在项目模板中开发 useMana 方法，通过 JSON 配置快速生成 CRUD 页面，中后台开发效率提升 80%</li>
              <li><strong>组件库建设：</strong>沉淀高复用业务组件与基础组件，统一交互规范与视觉风格，建立文档体系，实现版本化管理和可控升级</li>
              <li><strong>工程规范：</strong>制定统一的构建部署方案、多环境管理策略、依赖版本控制规范、项目目录约定</li>
              <li><strong>技术栈升级：</strong>主导 Webpack 到 Vite5 的迁移，打包效率提升 70%</li>
            </ul>
          </div>

          <div className={styles.subSection}>
            <h4 className={styles.subTitle}>核心产品开发</h4>
            <ul className={styles.workList}>
              <li>设计并实现 OA 流程引擎，支持可视化流程配置，作为 OA 类应用的底层技术支撑</li>
              <li>开发自定义表格表单工作台，支持单元格合并/拆分、拖拽调整、样式编辑等，用户可自行配置任意模板</li>
            </ul>
          </div>
        </div>

        <div className={styles.item}>
          <div className={styles.itemHeader}>
            <h3 className={styles.company}>北京创智远景科技有限公司</h3>
            <span className={styles.date}>2018.07 - 2020.04</span>
          </div>
          <p className={styles.position}>前端开发工程师</p>
          <p className={styles.description}>
            负责 GIS 方向相关的前端日常开发工作。
          </p>
        </div>
      </section>

      {/* 教育经历 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>教育经历</h2>

        <div className={styles.item}>
          <div className={styles.itemHeader}>
            <h3 className={styles.company}>吉林建筑大学</h3>
            <span className={styles.date}>2014 - 2018</span>
          </div>
          <p className={styles.position}>本科 · 地理信息科学</p>
        </div>
      </section>

      {/* 资格证书 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>资格证书</h2>
        <ul className={styles.certificateList}>
          {/* <li>大学英语四级 (CET-4)</li> */}
          <li>大学英语六级 (CET-6)</li>
        </ul>
      </section>

      {/* 开源项目 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>开源项目</h2>
        <div className={styles.openSourceItem}>
          <h3 className={styles.projectName}>
            <a href="https://www.npmjs.com/package/uni-player" target="_blank" rel="noopener noreferrer">
              uni-player
            </a>
          </h3>
          <p className={styles.projectDesc}>
            轻量级 JavaScript 视频播放器插件，支持普通视频、HLS/FLV 视频流、直播模式，提供多视频源切换、全屏控制、音量调节等完整 API，零依赖。
          </p>
        </div>
      </section>

      {/* 页脚 */}
      <footer className={styles.footer}>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          苏ICP备2026010442号
        </a>
      </footer>
    </div>
  );
};

export default Resume;
