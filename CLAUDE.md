# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 常用命令

```bash
# 安装依赖
pnpm install

# 开发模式（端口 1080）
pnpm dev

# 构建生产版本
pnpm build

# 构建开发版本
pnpm build:dev

# 代码检查
pnpm lint

# 代码检查并自动修复
pnpm lintfix

# 预览构建结果（端口 1070）
pnpm preview
```

---

## 项目架构

```
src/
├── Main.tsx              # 应用入口，配置 Provider
├── App.tsx               # 根组件，路由配置
├── config.ts             # 全局配置（API 前缀、主题、Token 配置等）
├── global.d.ts           # 全局类型定义
├── common/
│   ├── ajax/             # HTTP 请求封装（axios + token 刷新 + 错误处理）
│   ├── alioss/           # 阿里云 OSS 上传封装
│   ├── components/       # 通用组件（Table、Empty、Upload 等）
│   ├── hoc/              # 高阶组件（withLazyLoad、withIf、withConfirm）
│   ├── pages/            # 通用页面（登录、批量导入、权限管理等）
│   └── style/            # 全局样式（reset.css、utils.less）
├── hooks/
│   ├── useManaPage/      # CRUD 页面核心 Hook（配置化生成管理页面）
│   ├── useRouter.ts      # 路由 Hook（支持参数加密）
│   ├── usePermission.ts  # 权限检查 Hook
│   └── ...               # 其他 Hooks
├── pages/                # 业务页面
├── routers/              # 路由配置
├── store/                # Zustand 状态管理
└── utils/                # 工具函数
```

### 核心技术栈

- **React 18** + **TypeScript** + **Vite**
- **Ant Design 5.x** - UI 组件库
- **navyd** - 自定义组件库（Modal、layer 消息提示）
- **ahooks** - React Hooks 库（useReactive 状态管理）
- **zustand** - 轻量级状态管理
- **ali-oss** - 阿里云 OSS 上传
- **dayjs** - 日期处理

### 请求流程

1. 组件调用 `service()` 发起请求（`src/common/ajax/index.ts`）
2. 请求拦截器自动添加 Token 头
3. 响应拦截器处理 Token 刷新和错误提示
4. 返回类型化的 `BackendData<T>` 或 `BackendPaginationData<T>`

---

## 环境配置

项目使用 `.env.development` 和 `.env.production` 配置环境变量：

```
VITE_APP_SECRET_KEY=your_secret_key    # 路由参数加密密钥
VITE_API_BASE_URL=your_api_base_url    # API 基础地址
```

---

## 目录

### I. 快速参考

- [核心导入](#i-快速参考)
- [重要规则总结](#重要规则总结)

### II. 开发规范

- [文件组织模板](#ii1-文件组织模板)
- [页面布局规范](#ii2-页面布局规范)
- [路由定义模式](#ii3-路由定义模式)
- [开始工作前的清理](#ii4-开始工作前的清理)

### III. 组件使用

- [组件使用优先级](#iii1-组件使用优先级)
- [组件模式](#iii2-组件模式)
- [权限组件模式](#iii3-权限组件模式)
- [Table 组件使用](#iii4-table-组件使用)

### IV. Hooks 使用

- [Hook 模式](#iv1-hook-模式)
- [CRUD 页面开发：useManaPage Hook](#iv2-crud-页面开发usemanapage-hook)

### V. 数据交互

- [API 服务模式](#v1-api-服务模式)
- [状态管理模式](#v2-状态管理模式)
- [错误处理模式](#v3-错误处理模式)
- [Token 和认证处理](#v4-token-和认证处理)

### VI. UI 和样式

- [CSS Modules 模式](#vi1-css-modules-模式)
- [工具类（来自 utils.less）](#vi2-工具类来自-utilsless)
- [消息/通知模式](#vi3-消息通知模式)

### VII. 第三方库使用

- [OSS 上传模式](#vii1-oss-上传模式)
- [日期处理模式](#vii2-日期处理模式)
- [加密模式](#vii3-加密模式)

### VIII. 类型定义

- [全局类型参考](#viii1-全局类型参考)
- [常用常量](#viii2-常用常量)

---

## I. 快速参考

### 核心导入

```typescript
// HTTP & API
import service from '@/common/ajax';
import { StatusCode } from '@/common/ajax/helper';

// ⚠️ 组件优先使用 @common/components 导出
import { Table, Empty, IconFont, UploadFile, UploadImg, AuthImg, Tip, EncryptMobile, UserSelector, Authorization } from '@/common/components';

// 高阶组件（HOCs）
import withLazyLoad from '@/common/hoc/withLazyLoad';
import withConfirm from '@/common/hoc/withConfirm';
import withIf from '@/common/hoc/withIf';

// Hooks
import useLogin from '@/hooks/useLogin';
import usePermission from '@/hooks/usePermission';
import useRouter from '@/hooks/useRouter';
import useTableActions from '@/hooks/useTableActions';
import useUploadFile from '@/hooks/useUploadFile';
import usePageState from '@/hooks/usePageState';
import useClientType from '@/hooks/useClientType';
import useStorageManager from '@/hooks/useStorageManager';

// OSS
import { uploadFileToAlioss, getSignedUrl } from '@/common/alioss';
import BusinessType from '@/common/alioss/businessType';

// 工具函数
import { goTo } from '@/utils/history';
import { getuuid, compressImage, isImgFile } from '@/utils/tools';
import config from '@/config';  // 中央配置：API 前缀、主题、路由模式等

// 第三方库
import { layer, Modal } from 'navyd'; // 使用 layer 和 Modal，不要使用 Ant Design 的 message 和 Modal
import { useReactive } from 'ahooks'; // 推荐用于响应式状态
import dayjs from 'dayjs'; // 使用 dayjs 而不是 moment
import md5 from 'md5';
```

### 重要规则总结

1. **CRUD 页面优先使用 useManaPage**：标准管理页面必须使用 `useManaPage` Hook，不要手动编写
2. **使用统一布局**：所有页面必须使用 `src/layout/` 中的布局组件，通过嵌套路由和 `<Outlet />` 渲染子页面，禁止重复开发 Header、Menu、Footer
3. **组件优先级**：优先使用 `@common/components` 的组件（**特别是 Table**），其次使用 navyd，最后使用 Ant Design
4. **消息提示**：使用 `navyd` 的 `layer`，不要使用 `antd` message
5. **模态框**：使用 `navyd` 的 `Modal` 组件，不要使用 `antd` Modal（二次确认使用 `layer.confirm`）
6. **日期处理**：使用 `dayjs`，不要使用 `moment`
7. **ID 类型**：始终使用 `ID`，不要使用 `number`
8. **状态管理**：优先使用 `ahooks` 的 `useReactive`
9. **组件包装**：必要时候使用 `withIf` HOC 包装，一般不需要
10. **路由懒加载**：使用 `withLazyLoad` HOC
11. **API 类型**：泛型定义在 `service` 调用上，如 `service<BackendData<T>>`、`service<BackendPaginationData<T>>`
12. **样式文件**：所有样式必须使用 CSS Modules（`.module.less`）
13. **CSS 变量**：所有全局 CSS 变量在 `src/common/style/reset.css` - **切勿重新定义**
14. **工具类**：100px 以下的 padding/margin 使用 `utils.less` 的工具类（如 `mt-10`、`mb-20`、`p-15`）
15. **文件大小**：单个文件最多 500 行

---

## II. 开发规范

### II.1 文件组织模板

#### ⚠️ 强制规则

根据功能的复杂程度，选择合适的文件组织方式。

#### 模式 1：简单页面（推荐用于单页面或 2-3 个相关页面）

**适用场景**：

- 单个 CRUD 管理页面（如用户管理、角色管理）
- 简单的功能页面
- 页面之间没有复杂的共享逻辑

**目录结构**：

```
src/pages/
├── userManage/                    # 功能目录（小驼峰命名）
│   ├── UserManage.tsx             # 主组件
│   ├── UserManage.module.less     # 样式文件
│   ├── service.ts                 # API 方法（如果复杂）
│   ├── types.ts                   # 类型定义（如果复杂）
│   └── Form.tsx                   # Modal 表单组件（如果有）
└── profile/
    ├── Profile.tsx
    └── Profile.module.less
```

**示例**：

```typescript
// ✅ 正确 - 简单页面直接在功能目录下
src/pages/userManage/UserManage.tsx
src/pages/userManage/service.ts          // 可选，有API即创建
src/pages/userManage/UserManage.module.less
```

**判断标准**：

- ✅ 页面逻辑简单（< 300 行）
- ✅ 没有 3 个以上的子组件
- ✅ 不需要复杂的工具函数
- ✅ 使用 `useManaPage` Hook 的标准 CRUD 页面

#### 模式 2：完整模块（推荐用于复杂功能）

**适用场景**：

- 多个相关页面（如订单管理：订单列表、订单详情、订单创建）
- 需要共享的状态、工具函数
- 有多个子组件需要复用
- 复杂的业务逻辑

**目录结构**：

```
src/pages/
├── order/                         # 功能模块目录
│   ├── orderList/                 # 子功能 1：订单列表
│   │   ├── OrderList.tsx
│   │   ├── OrderList.module.less
│   │   ├── components/            # 该页面专用组件
│   │   │   └── OrderCard.tsx
│   │   └── service.ts             # 该页面专用 API
│   ├── orderDetail/               # 子功能 2：订单详情
│   │   ├── OrderDetail.tsx
│   │   ├── OrderDetail.module.less
│   │   └── components/
│   │       ├── OrderInfo.tsx
│   │       └── OrderTimeline.tsx
│   ├── shared/                    # 共享部分
│   │   ├── service.ts             # 共享 API 方法
│   │   ├── types.ts               # 共享类型定义
│   │   ├── constants.ts           # 共享常量
│   │   └── utils.ts              # 共享工具函数
│   └── components/                # 共享组件
│       ├── OrderStatus.tsx
│       └── OrderModal.tsx
```

**判断标准**：

- ✅ 有 3 个以上相关页面
- ✅ 页面之间需要共享 API、类型、工具函数
- ✅ 有可复用的子组件（3 个以上）
- ✅ 单个文件超过 300 行，需要拆分

#### 文件命名规范

**目录命名**：

- **小驼峰命名**：`userManage`、`orderList`、`profile`
- **语义化**：目录名应该清楚表达功能含义

**文件命名**：

- **组件文件**：大驼峰 `UserManage.tsx`、`OrderDetail.tsx`
- **样式文件**：同名 `.module.less`，如 `UserManage.module.less`
- **服务文件**：小驼峰 `service.ts`
- **类型文件**：小驼峰 `types.ts`
- **常量文件**：小驼峰 `constants.ts` 或 `const.ts`
- **工具文件**：小驼峰 `utils.ts`

#### 必须遵守的原则

1. **样式文件必须使用 CSS Modules**

```typescript
// ✅ 正确
import styles from './UserManage.module.less';

// ❌ 错误
import './UserManage.less';
```

2. **路由懒加载使用 withLazyLoad**

```typescript
// ✅ 正确 - 使用 withLazyLoad
import withLazyLoad from '@/common/hoc/withLazyLoad';

const UserManage = withLazyLoad(() => import('@/pages/userManage/UserManage'));

// ❌ 错误 - 直接导入
import UserManage from '@/pages/userManage/UserManage';
```

3. **单个文件不超过 500 行**

如果超过 500 行，必须拆分：

- 提取子组件到 `components/` 目录
- 提取工具函数到 `utils.ts`
- 提取复杂逻辑到单独的 hook

4. **API 方法定义在 service.ts 中**

```typescript
// ✅ 正确 - service.ts
import service from '@/common/ajax';

export const getUserList = (params: QueryParams) => {
  return service<BackendPaginationData<User[]>>('/api/users', { type: 'get', data: params });
};

// ❌ 错误 - 直接在组件中定义
const UserManage = () => {
  const fetchData = () => {
    return service('/api/users', { type: 'get', data: params });
  };
};
```

#### 何时创建 service.ts、types.ts 等文件？

**创建 service.ts 的条件**：

- 存在API方法即创建

**创建 types.ts 的条件**：

- 存在类型定义即创建

#### 开发新功能时的决策流程

```
开始开发新功能
├─ 功能简单吗？（1-2 个页面，逻辑简单）
│   ├─ 是 → 使用【模式 1：简单页面】
│   │   ├─ 创建功能目录，如 userManage/
│   │   ├─ 主组件：UserManage.tsx
│   │   ├─ 样式：UserManage.module.less
│   │   ├─ 有API吗？
│   │   │   ├─ 是 → 创建 service.ts
│   │   │   └─ 否 → 不创建
│   │   └─ 有类型吗？
│   │       ├─ 是 → 创建 types.ts
│   │       └─ 否 → 不创建
│   │
│   └─ 否 → 使用【模式 2：完整模块】
│       ├─ 创建模块目录，如 order/
│       ├─ 划分子功能：orderList/、orderDetail/
│       ├─ 创建 shared/ 存放共享内容
│       ├─ 创建 components/ 存放共享组件
│       ├─ service.ts（共享 API）
│       ├─ types.ts（共享类型）
│       └─ constants.ts（共享常量）
|
```

---

### II.2 页面布局规范

#### ⚠️ 强制规则

**所有页面必须使用统一的布局组件，禁止重复开发 Header、Menu、Footer 等公共组件！**

#### 布局目录结构

所有布局组件统一存放在 `src/layout/` 目录下：

```
src/layout/
├── EmptyLayout.tsx            # 空白布局（登录、注册、404等）
├── EmptyLayout.module.less    # 空白布局样式
├── BasicLayout.tsx            # 基础布局（Header + 内容区）
├── BasicLayout.module.less    # 基础布局样式
├── AdminLayout.tsx            # 后台管理布局（侧边栏 + Header + 内容区）
├── AdminLayout.module.less    # 后台管理布局样式
└── ...                        # 其他自定义布局
```

#### 常见布局类型

**1. EmptyLayout - 空白布局**

**适用场景**：登录页、注册页、404、401 等错误页

```typescript
// src/layout/EmptyLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import './EmptyLayout.module.less';

const EmptyLayout: React.FC = () => {
  return (
    <div className="empty-layout">
      <Outlet />
    </div>
  );
};

export default EmptyLayout;
```

**2. BasicLayout - 基础布局**

**适用场景**：带顶部导航的普通页面、需要统一 Header 的业务页面

```typescript
// src/layout/BasicLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/common/components/Header';
import './BasicLayout.module.less';

const BasicLayout: React.FC = () => {
  return (
    <div className="basic-layout">
      <Header />
      <div className="basic-layout-content">
        <Outlet />
      </div>
    </div>
  );
};

export default BasicLayout;
```

**3. AdminLayout - 后台管理布局**

**适用场景**：后台管理系统、需要侧边栏菜单的页面、CRUD 管理类页面

```typescript
// src/layout/AdminLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'antd';
import './AdminLayout.module.less';

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const menuItems = [ // 菜单项配置
    { key: 'users', label: '用户管理', icon: <IconUser /> },
    { key: 'roles', label: '角色管理', icon: <IconRole /> },
  ];

  return (
    <div className="admin-layout">
      {/* 侧边栏 */}
      <div className={`admin-layout-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="logo">LOGO</div>
        <Menu
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          items={menuItems}
          onClick={({ key }) => {
            // 菜单点击跳转逻辑
          }}
        />
      </div>

      {/* 主体内容区 */}
      <div className="admin-layout-main">
        {/* 顶部 Header */}
        <div className="admin-layout-header">
          <Button onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </div>

        {/* 页面内容 */}
        <div className="admin-layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
```

#### 路由配置使用布局

**重要规则**：使用嵌套路由结构，外层使用布局组件，内层使用 `<Outlet />` 渲染子页面。

```typescript
// src/routers/routes.tsx
import withLazyLoad from '@/common/hoc/withLazyLoad';
import EmptyLayout from '@/layout/EmptyLayout';
import BasicLayout from '@/layout/BasicLayout';
import AdminLayout from '@/layout/AdminLayout';

// 懒加载页面组件
const Login = withLazyLoad(() => import('@/pages/login/Login'));
const UserManage = withLazyLoad(() => import('@/pages/user/UserManage'));

const routes: UniRouteObject[] = [
  // 空白布局路由
  {
    path: '/',
    element: <EmptyLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: '404', element: <PageNotFound /> }
    ]
  },

  // 后台管理布局路由
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'users', element: <UserManage /> }
    ]
  }
];
```

#### 布局使用决策树

```
|─是否用户指定页面布局
    |--按照用户指定页面布局创建布局文件
是否需要登录？
├─ 否 → 使用 EmptyLayout
│   ├─ 登录页
│   ├─ 注册页
│   └─ 错误页（404、401）
│
└─ 是 → 是否需要侧边栏菜单？
    ├─ 是 → 使用 AdminLayout
    │   ├─ CRUD 管理页面
    │   ├─ 后台管理系统
    │   └─ 需要多级导航的页面
    │
    └─ 否 → 使用 BasicLayout
        ├─ 需要统一 Header 的页面
        ├─ 简单的业务页面
        └─ 前台展示页面
```

#### 布局组件开发规范

1. **命名规范**：

   - 布局文件：`XxxLayout.tsx`（大驼峰 + Layout 后缀）
   - 样式文件：`XxxLayout.module.less`（同名 .module.less）
2. **必须使用 Outlet**：所有布局组件必须使用 React Router 的 `<Outlet />` 来渲染子路由内容
3. **布局组件职责**：

   - **✅ 应该包含**：页面框架结构、导航菜单、用户信息显示、公共的 Header、Footer
   - **❌ 不应该包含**：具体业务逻辑、数据请求、状态管理（除非是布局相关的全局状态）
4. **公共组件复用**：

   - Header、Menu、Footer 等公共组件必须定义一次，在布局中引用
   - 禁止在各个页面中重复创建相同的 Header、Menu
   - 公共组件存放在 `src/common/components/` 目录

---

### II.3 路由定义模式

```typescript
// routes.tsx
import withLazyLoad from '@/common/hoc/withLazyLoad';

const Feature = withLazyLoad(() => import('./FeaturePage'));
const FeatureDetail = withLazyLoad(() => import('./FeatureDetail'));

export const featureRoutes: UniRouteObject[] = [
  {
    path: '/feature',
    label: '功能名称',
    icon: 'icon-name',
    permission: 'feature:view',
    element: <Feature />
  },
  {
    path: '/feature/:id',
    label: '详情',  // 无 label 则从菜单隐藏
    element: <FeatureDetail />
  }
];
```

---

### II.4 开始工作前的清理

**在开始编写业务代码前，必须删除所有测试页面及其路由定义：**

#### 需要删除的测试页面目录和文件

- ✅ `src/pages/demo/` - 所有 demo 测试页面目录（删除整个目录）
- ✅ `src/pages/student/` - 学生示例页面目录（删除整个目录）
- ✅ `src/pages/Welcome.tsx` - 欢迎页面文件
- ✅ `src/pages/link/` - 外部链接测试页面目录（删除整个目录）
- ✅ `src/pages/index.module.less` - 测试样式文件

#### 需要清理的路由定义

- ✅ 删除上述测试页面在 `src/routers/routes.tsx` 中的路由配置
- ✅ 确保主路由文件中只保留必要的路由（如登录页、404 等）

---

## III. 组件使用

### III.1 组件使用优先级

**优先使用 `@common/components` 中的组件，其次使用 Ant Design 组件。**

#### 组件选择原则

1. **`@common/components`** - 封装的通用组件，优先使用
2. **navyd** - navyd 提供的专用组件（Modal、layer）
3. **Ant Design 5.x** - 仅在前两者未涵盖时使用

#### 必须优先使用的 @common/components 组件

| 组件                    | 说明               | 替代 Ant Design 组件            |
| ----------------------- | ------------------ | ------------------------------- |
| **Table**         | 表格组件（最重要） | ✅ 替代 Ant Design Table        |
| **Empty**         | 空状态             | ✅ 替代 Ant Design Empty        |
| **IconFont**      | 图标字体           | Ant Design Icon 补充            |
| **UploadFile**    | 文件上传           | Ant Design Upload 封装          |
| **UploadImg**     | 图片上传           | Ant Design Upload 封装          |
| **AuthImg**       | 加密图片显示       | -                               |
| **Tip**           | 增强的提示         | Ant Design Tooltip/Popover 封装 |
| **EncryptMobile** | 加密手机号         | -                               |
| **UserSelector**  | 用户选择器         | -                               |
| **Authorization** | 权限控制           | -                               |

**⚠️ 特别注意：Table 组件必须优先使用 @common/components 的 Table，不要使用 Ant Design 的 Table！**

---

### III.2 组件模式

#### 1. 不必始终使用 `withIf` 包装组件，必要的时候使用

所有组件都应该支持 `rif` 属性用于条件渲染：

```typescript
import withIf from '@/common/hoc/withIf';

const MyComponent: React.FC<Props> = props => {
  return <div>...</div>;
};

export default withIf(MyComponent);
```

#### 2. 使用 `withLazyLoad` 懒加载路由

**所有路由组件必须**使用：

```typescript
import withLazyLoad from '@/common/hoc/withLazyLoad';

// routes.tsx
const routes: UniRouteObject[] = [
  {
    path: '/page',
    element: withLazyLoad(() => import('./pages/MyPage'))
  }
];
```

#### 3. 使用 `withConfirm` 进行操作确认

包装需要用户确认的异步函数：

```typescript
import withConfirm from '@/common/hoc/withConfirm';

const handleDelete = withConfirm(apiDeleteItem, {
  title: '确认删除',
  content: '删除后无法恢复，是否继续？'
});

// 使用
handleDelete({ id: 123 });
```

---

### III.3 权限组件模式

```typescript
import { Authorization } from '@/common/components';

<Authorization code="user:edit" type="some">
  <Button>编辑</Button>
</Authorization>

<Authorization code={['admin', 'superadmin']} type="every">
  <Button>超级管理员功能</Button>
</Authorization>
```

---

### III.4 Table 组件使用

```typescript
import { Table } from '@/common/components';

type TableRecord = { id: ID; name: string; status: string };

const columns: UniColumn<TableRecord>[] = [
  { title: '名称', dataIndex: 'name', width: 200 },
  {
    title: '状态',
    dataIndex: 'status',
    render: (status: string) => <span>{status}</span>
  },
  {
    title: '操作',
    actions: [
      { label: '编辑', onClick: handleEdit },
      { label: '删除', onClick: handleDelete, permission: 'delete' }
    ]
  }
];

const [selectedKeys, setSelectedKeys] = useState<ID[]>([]);

<Table
  list={dataList}
  columns={columns}
  selectedKeys={selectedKeys}
  onSelectChange={(selected, changed, active) => {
    setSelectedKeys(selected.map(item => item.id));
  }}
  showIndex={true}
  centered={true}
  pagination={{
    current: pageNum,
    pageSize: pageSize,
    total: totalCount,
    onChange: handlePageChange
  }}
  onScrollToBottom={loadMore}
  rowKey="id"
  autoHeight={true}
  disabledCheckItems={lockedItems}
/>
```

---

## IV. Hooks 使用

### IV.1 Hook 模式

#### useTableActions - 表格操作列

```typescript
import useTableActions from '@/hooks/useTableActions';

const columns: UniColumn<RecordType>[] = [
  { title: 'Name', dataIndex: 'name' },
  {
    title: '操作',
    actions: [
      {
        label: '编辑',
        onClick: async (record, model) => {
          model.loading = true;
          await apiUpdate(record);
        },
        permission: 'user:edit'
      },
      {
        label: '更多',
        children: [
          { label: '详情', onClick: (record) => { ... } },
          { label: '删除', onClick: (record) => { ... }, permission: 'user:delete' }
        ]
      }
    ]
  }
];
```

#### useRouter - 带加密的导航

```typescript
import useRouter from '@/hooks/useRouter';

const router = useRouter();

// 通过路由名称跳转
router.to({ name: 'userDetail', routeParams: { id: userId } });

// 通过路径跳转
router.to({ path: '/user/:id', routeParams: { id: userId } });

// 带查询参数
router.to({
  name: 'list',
  queryParams: { status: 'active', page: 1 }
});

// 在新标签页打开
router.open({ name: 'report', queryParams: { date: '2024-01-01' } });

// 获取参数（自动解密）
const searchParams = router.getSearchParams();
const routeParams = router.getDecodedParams();

// 返回
router.back();
```

#### usePageState - 列表页状态管理

```typescript
import usePageState from '@/hooks/usePageState';

const { pagination, state, load, searchParams } = usePageState(apiGetList, {
  columns: tableColumns,
  searchParams: { status: 'active' }
});

// 在组件中使用
<Table
  list={state.list}
  loading={state.loading}
  columns={state.columns}
  pagination={pagination}
  onPagechange={(page, size) => { pagination.current = page; load(); }}
/>

// 搜索处理
const handleSearch = () => {
  pagination.current = 1;
  load();
};
```

#### useUploadFile - 文件上传 Hook

```typescript
import useUploadFile from '@/hooks/useUploadFile';
import { UploadFile } from '@/common/components';

const { list, UploadFile: MyUploadFile } = useUploadFile({
  businessType: BusinessType.WISDOMPRINT_APPLY_FILE,
  accepts: ['pdf', 'doc', 'docx'],
  maxSize: 10,
  max: 5
});

// 在 JSX 中
<MyUploadFile />
```

#### usePermission - 权限检查

```typescript
import usePermission from '@/hooks/usePermission';

const hasPermission = usePermission();

// 单个权限
if (hasPermission('user:edit')) { ... }

// 多个权限（满足任一）
if (hasPermission(['user:edit', 'user:delete'], 'some')) { ... }

// 多个权限（全部满足）
if (hasPermission(['admin', 'superadmin'], 'every')) { ... }
```

---

### IV.2 CRUD 页面开发：useManaPage Hook

#### ⚠️ 强制规则

**当开发 CRUD 管理类页面时，必须优先使用 `useManaPage` Hook，不要手动编写页面结构！**

适用场景：

- ✅ 用户管理、角色管理、权限管理
- ✅ 订单管理、商品管理、库存管理
- ✅ 任何包含**搜索面板 + 数据表格 + 新增/编辑弹窗**的管理页面

#### 核心概念

**1. PageConfig - 页面配置类型**

`PageConfig` 是一个数组，每个元素代表页面中的一个组件区域：

```typescript
type PageConfig = Array<
  { type: 'title', props: TitleProps } |                    // 页面标题
  { type: 'tip', props: TipProps } |                        // 提示信息
  { type: 'tab', props: TabProps, children?: {...} } |      // 标签页
  { type: 'search-panel', props: SearchPanelProps } |       // 搜索面板
  { type: 'table', props: TableProps } |                    // 数据表格
  { type: 'modal', props: ModalProps } |                    // 弹窗表单
  { type: 'custom', props?: React.FC }                      // 自定义组件
>;
```

**2. useManaPage 参数**

```typescript
interface UseManaPageProps<T> {
  config: PageConfig;                        // 页面配置（必需）
  serviceFn: (...args: any[]) => Promise<BackendData<T[]> | BackendPaginationData<T[]>>; // 列表接口（必需）
  columns: UniColumn<T>[];                   // 表格列定义（必需）
  ModalContent?: React.FC<ManaModalContentCommon<T>>; // Modal 表单内容组件
  extraSearchParmas?: StateParams;           // 额外的搜索参数（默认值）
  tableEmptyContent?: React.ReactNode;       // 空状态内容
  modalFormProps?: FormProps;                // Modal 表单属性
  modalWidth?: number;                       // Modal 宽度
  onTabChange?: (key: string) => void;       // Tab 切换回调
  onSearchParamsChange?: (params: StateParams, fieldName: string, value: any) => void; // 搜索参数变化回调
  onModalSave?: (mode: DrawerMode, data: any) => void | Promise<any>; // Modal 保存回调
}
```

**3. useManaPage 返回值**

```typescript
const {
  Page,              // 页面组件（必需渲染）
  state,             // 响应式状态对象
  openModal,         // 打开 Modal: (mode: 'add' | 'edit' | 'preview', defaultValue?: Record) => void
  closeModal,        // 关闭 Modal
  load,              // 重新加载列表数据
  setSearchParams,   // 设置搜索参数: (name: string, value: any) => void
  setColumns,        // 设置表格列
  setTabItem,        // 设置单个 Tab 的 label
  setTabItems,       // 设置 Tab 列表
  evt                // 事件总线（发布订阅）
} = useManaPage<T>({...});
```

#### 使用模式

**模式 1：无 Tab 的标准 CRUD 页面**

```typescript
import useManaPage, { useActions, PageConfig } from '@/hooks/useManaPage';
import Form from './Form.tsx';
import { testServiceFn } from './service.ts';

// 1. 定义页面配置
const config: PageConfig = [
  // 标题
  {
    type: 'title',
    props: {
      title: '用户管理',
      gap: true  // 左侧装饰条
    }
  },
  // 搜索面板
  {
    type: 'search-panel',
    props: {
      items: [
        {
          type: 'input',
          name: 'name',
          label: '姓名',
          placeholder: '请输入姓名'
        },
        {
          type: 'select',
          name: 'role',
          label: '角色',
          options: [
            { label: '管理员', value: 'admin' },
            { label: '普通用户', value: 'user' }
          ]
        }
      ]
    }
  },
  // 数据表格
  {
    type: 'table',
    props: {
      page: 20,         // 启用分页，每页20条
      showIndex: true   // 显示序号
    }
  },
  // Modal 弹窗
  {
    type: 'modal',
    props: {
      title: '用户',
      layout: 'vertical'
    }
  }
];

// 2. 定义表格列
const columns: UniColumn<User>[] = [
  { title: 'ID', dataIndex: 'id' },
  { title: '姓名', dataIndex: 'name' },
  {
    title: '操作',
    actions: [
      {
        label: '编辑',
        onClick: (record) => {
          openModal('edit', record);
        }
      }
    ]
  }
];

// 3. 使用 Hook
const UserManagePage = () => {
  const { Page, openModal } = useManaPage<User>({
    config,
    serviceFn: testServiceFn,
    columns,
    ModalContent: Form,
    extraSearchParmas: { status: 'active' },
    onModalSave: async (mode, data) => {
      if (mode === 'add') {
        await apiCreateUser(data);
        layer.msg('新增成功');
      } else if (mode === 'edit') {
        await apiUpdateUser(data);
        layer.msg('修改成功');
      }
    }
  });

  // 4. 定义操作按钮
  const Actions = useActions([
    {
      label: '新增用户',
      type: 'primary',
      onClick: () => {
        openModal('add');
      }
    }
  ]);

  return <Page actions={<Actions />} />;
};
```

**模式 2：有 Tab 的多列表页面**

父页面（使用 Tab）：

```typescript
import useManaPage, { PageConfig } from '@/hooks/useManaPage';
import Comp1 from './components/comp1/Comp1';
import Comp2 from './components/comp2/Comp2';

const config: PageConfig = [
  {
    type: 'tab',
    props: {
      items: [
        { label: '用户列表', key: 'user' },
        { label: '角色列表', key: 'role' }
      ]
    },
    children: {
      'user': Comp1,
      'role': Comp2
    }
  }
];

const WithTabPage = () => {
  const { Page } = useManaPage({ config });
  return <Page />;
};
```

子组件（独立的 useManaPage 实例）：

```typescript
import useManaPage, { useActions, PageConfig } from '@/hooks/useManaPage';

const config: PageConfig = [
  { type: 'title', props: { title: '用户列表', gap: true } },
  { type: 'search-panel', props: { items: [...] } },
  { type: 'table', props: { page: true, showIndex: true } },
  { type: 'modal', props: { title: '用户' } }
];

const Comp1 = () => {
  const { Page, openModal } = useManaPage({
    config,
    serviceFn: testServiceFn,
    columns: [...],
    ModalContent: Form
  });

  const Actions = useActions([
    { label: '新增', type: 'primary', onClick: () => openModal('add') }
  ]);

  return <Page actions={<Actions />} />;
};
```

#### 组件配置详解

**1. Title - 页面标题**

```typescript
{ type: 'title', props: {
  title: '页面标题',     // 必需
  gap: true,            // 可选，是否显示左侧装饰条
  className: ''         // 可选，自定义类名
}}
```

**2. Tip - 提示信息**

```typescript
{ type: 'tip', props: {
  content: '提示内容',   // 必需
  type: 'warning',      // 可选：'info' | 'success' | 'warning' | 'error'
  icon: true,           // 可选，是否显示图标
  customIcon: <Icon />  // 可选，自定义图标
}}
```

**3. Tab - 标签页**

```typescript
{ type: 'tab', props: {
  items: [              // 必需，Tab 项列表
    { key: 'tab1', label: '标签1', permission: 'user:view' },
    { key: 'tab2', label: '标签2' }
  ]
}, children: {
  'tab1': Comp1,        // key 对应的组件
  'tab2': Comp2
}}
```

**4. SearchPanel - 搜索面板**

```typescript
{ type: 'search-panel', props: {
  items: [
    // 输入框
    {
      type: 'input',
      name: 'fieldName',
      label: '字段标签',
      placeholder: '请输入',
      allowClear: true,
      width: 200
    },
    // 下拉选择
    {
      type: 'select',
      name: 'role',
      label: '角色',
      options: [
        { label: '选项1', value: 'value1' },
        { label: '选项2', value: 'value2' }
      ],
      multiple: true
    },
    // 日期范围
    {
      type: 'date-range',
      name: 'createTime',
      label: '创建时间',
      dateRangeNum: 90  // 限制90天范围
    }
  ]
}}
```

**5. Table - 数据表格**

```typescript
{ type: 'table', props: {
  page: true,             // 可选，启用分页（true 或数字指定每页条数）
  select: true,           // 可选，启用多选
  showIndex: true         // 可选，显示序号列
}}
```

**6. Modal - 弹窗表单**

```typescript
{ type: 'modal', props: {
  title: '用户',           // 必需，标题
  layout: 'vertical',      // 可选：'horizontal' | 'vertical'
  modifyPermission: ''     // 可选，修改权限码
}}
```

**7. Custom - 自定义组件**

```typescript
{ type: 'custom', props: CustomComponent }
```

#### ModalContent 组件模式

`ModalContent` 是弹窗中的表单组件，接收以下 props：

```typescript
interface ManaModalContentCommon<T = StateParams, D = any> {
  mode: DrawerMode;           // 'add' | 'edit' | 'preview'
  impale: (props: {
    submit: () => Promise<unknown> | unknown;
    cancel: () => Promise<unknown> | unknown;
  }) => void;
  form: FormInstance;
  FormItem: React.FC;
  FormList: React.FC;
  defaultValue: T;
  modalProps: D;
}
```

**标准 ModalContent 实现：**

```typescript
import { Input, Select } from 'antd';
import { useEffect, useRef } from 'react';

const Form: React.FC<ManaModalContentCommon<Record>> = ({
  form,
  FormItem,
  mode,
  defaultValue,
  impale
}) => {
  const impaleRef = useRef(impale);

  useEffect(() => {
    impaleRef.current = impale;
  }, [impale]);

  useEffect(() => {
    if (defaultValue && Object.keys(defaultValue).length > 0) {
      form.setFieldsValue(defaultValue);
    } else {
      form.resetFields();
    }
  }, [defaultValue, form]);

  useEffect(() => {
    impaleRef.current({
      submit: async () => {
        const values = await form.validateFields();
        return values;
      },
      cancel: async () => {
        form.resetFields();
      }
    });
  }, [form]);

  const isPreview = mode === 'preview';

  return (
    <>
      <FormItem
        label="姓名"
        name="name"
        rules={[{ required: true, message: '请输入姓名' }]}
      >
        <Input disabled={isPreview} />
      </FormItem>
    </>
  );
};

export default Form;
```

#### useActions - 操作按钮生成

```typescript
const Actions = useActions([
  {
    label: '按钮文字',
    type: 'primary',
    icon: 'icon-plus',
    permission: 'user:add',
    onClick: (model) => {
      model.loading = true;
    }
  },
  {
    label: '下拉菜单',
    children: [
      {
        label: '子项1',
        permission: 'user:edit',
        onClick: () => {}
      }
    ]
  }
]);

<Page actions={<Actions />} />
```

#### 最佳实践

1. **配置分离**：将 `config` 定义在组件外部，便于维护
2. **类型安全**：为数据定义明确的类型
3. **Modal 保存处理**：区分 `add` 和 `edit` 模式
4. **搜索面板动态选项**：`options` 可以是异步函数
5. **Tab 切换时重置搜索**：使用 `onTabChange` 处理

---

## V. 数据交互

### V.1 API 服务模式

**务必**使用以下模式定义 API 方法：

```typescript
// service.ts
import service from '@/common/ajax';

// 单个对象响应
export const apiMethodName = (data: ParamsType) => {
  return service<BackendData<ResponseType>>('/api/endpoint', { type: 'post', data });
};

// 带参数的 GET 请求（分页列表）
export const apiGetMethod = (params: QueryParams) => {
  return service<BackendPaginationData<ItemType[]>>('/api/endpoint', { type: 'get', data: params });
};

// 删除请求
export const apiDeleteItem = (id: ID) => {
  return service<BackendData<boolean>>('/api/item/delete', { type: 'delete', data: { id } });
};
```

**重要说明：**

- **返回值类型泛型定义在 `service` 调用上**
- `service<BackendData<T>>` - 单个对象响应
- `service<BackendPaginationData<T>>` - 分页列表响应
- 使用全局 `ID` 类型，**不要**使用 `number`
- 使用 `type: 'post' | 'get' | 'delete' | 'put' | 'put-qs' | 'post-qs'`

---

### V.2 状态管理模式

**始终使用 `ahooks` 的 `useReactive`** 管理组件状态：

```typescript
import { useReactive } from 'ahooks';

const MyComponent = () => {
  const state = useReactive({
    loading: false,
    list: [] as ItemType[],
    current: 1,
    formData: { name: '', status: '' }
  });

  const updateData = async () => {
    state.loading = true;
    const data = await apiFetch();
    state.list = data;
    state.loading = false;
  };

  return <div>{state.list.map(...)}</div>;
};
```

---

### V.3 错误处理模式

```typescript
// 在 service 层 - 让错误传播
export const apiMethod = (data: Params) => {
  return service<BackendData<ResultType>>('/api/endpoint', { type: 'post', data });
  // 错误由 axios 拦截器处理
};

// 在组件中
const handleSubmit = async () => {
  try {
    await apiMethod(formData);
    layer.msg('操作成功');
  } catch (error) {
    // 错误已由拦截器通过 layer.error 显示
    console.error('提交失败:', error);
  }
};
```

---

### V.4 Token 和认证处理

ajax 封装会自动：

- 从 localStorage 添加 `Auth-Jwt` 请求头
- 处理 token 无感刷新
- token 过期时重定向到登录页
- 通过 `layer.error` 显示错误消息

组件中无需手动处理 token。

---

## VI. UI 和样式

### VI.1 CSS Modules 模式

```less
// FeaturePage.module.less
.container {
  padding: 20px;

  .header {
    display: flex;
    justify-content: space-between;

    .title {
      font-size: 16px;
    }
  }

  &:hover {
    background: #f5f5f5;
  }
}
```

```tsx
// 使用
import styles from './FeaturePage.module.less';

<div className={styles.container}>
  <div className={styles.header}>
    <span className={styles.title}>Title</span>
  </div>
</div>
```

#### CSS 变量使用

**重要提示**：所有全局 CSS 变量定义在 `src/common/style/reset.css`。**切勿在其他文件重新定义这些变量**。

可用的 CSS 变量：

```less
// 主色（来自 config）
--main-color: var(--uni-main-color);

// 颜色
--error-color: #FF7189;
--font-color: #393939;
--font-color-grey: #999999;
--font-color-dark-grey: #666;
--main-hover-color: var(--lighter-main-color);
--icon-color: #757D91;

// 布局
--border-color: #E5E5E5;
--base-border-radius: 4px;
--border: 1px solid var(--border-color);
--base-background-color: #F5F6FA;
--max-z-index: 1000;
```

**Ant Design 主题配置**：在 `src/config.ts` 中配置 `antdTheme`：

```typescript
antdTheme: {
  token: {
    colorPrimary: '#5197ff',  // 主题色
    borderRadius: 4,          // 圆角
  },
  components: {
    Button: {
      // Button 组件特定配置
    },
  }
}
```

---

### VI.2 工具类（来自 utils.less）

**重要提示**：对于 100px 以下的间距调整，**始终使用工具类**而不是编写自定义 CSS。

#### 间距工具类（1px - 100px）

```tsx
// Margin
<div className="mt-10">上边距 10px</div>
<div className="mb-20">下边距 20px</div>
<div className="ml-5">左边距 5px</div>
<div className="mr-15">右边距 15px</div>

// Padding
<div className="pt-10">上内边距 10px</div>
<div className="pb-20">下内边距 20px</div>
```

#### 颜色工具类

```tsx
<span className="main">主色文本</span>
<span className="red">错误色文本</span>
<span className="grey">灰色文本</span>
<span className="dark-grey">深灰色文本</span>
```

#### 字体工具类

```tsx
<div className="font-12">12px 字体大小</div>
<div className="font-14">14px 字体大小</div>
<div className="bolder">粗体文本</div>
```

#### 布局工具类

```tsx
<div className="flex">Flex 容器</div>
<div className="flex-center">居中 flex</div>
<div className="flex-between">两端对齐 flex</div>
<div className="w-full">宽度 100%</div>
```

---

### VI.3 消息/通知模式

**务必使用 `navyd` 的 `layer` 和 `Modal`**，不要使用 Ant Design 的 message 和 Modal。

#### 1. layer - 轻量级消息和对话框

```typescript
import { layer } from 'navyd';

// 轻量级消息
layer.msg('操作成功');
layer.error('操作失败');
layer.warn('警告信息');
layer.info('提示信息');

// 加载状态
const loadingId = layer.loading('加载中...');
layer.closeLoading();

// 对话框
layer.alert({
  title: '提示',
  content: '操作已完成',
  iconType: 'success',
  confirmText: '知道了',
  onConfirm: () => { }
});

layer.confirm({
  title: '确认删除',
  content: '删除后无法恢复，是否继续？',
  danger: true,
  confirmText: '确认删除',
  cancelText: '取消',
  onConfirm: async () => {
    await doDelete();
    layer.msg('删除成功');
  }
});
```

#### 2. Modal - 模态框组件

**Modal 只能作为 React 组件使用**，没有 `Modal.show()` 或 `Modal.confirm()` 等静态方法。

```typescript
import { Modal } from 'navyd';
import { useReactive } from 'ahooks';

const MyComponent = () => {
  const state = useReactive({
    modalOpen: false,
    confirmLoading: false
  });

  const handleConfirm = async () => {
    state.confirmLoading = true;
    try {
      await doSomething();
      state.modalOpen = false;
      layer.msg('操作成功');
    } catch (error) {
      state.confirmLoading = false;
    }
  };

  return (
    <>
      <button onClick={() => state.modalOpen = true}>打开对话框</button>

      <Modal
        open={state.modalOpen}
        title="对话框标题"
        width={600}
        onConfirm={handleConfirm}
        onCancel={() => state.modalOpen = false}
        confirmText="确认"
        cancelText="取消"
        confirmLoading={state.confirmLoading}
      >
        <div>对话框内容</div>
      </Modal>
    </>
  );
};
```

**Modal 常用属性：**

| 属性            | 类型                         | 说明                    |
| --------------- | ---------------------------- | ----------------------- |
| open            | boolean                      | 控制显示/隐藏           |
| title           | ReactNode                    | 标题                    |
| width           | number                       | 宽度（px）              |
| onConfirm       | () => void\| Promise\<void\> | 确认回调                |
| onCancel        | () => void                   | 取消回调                |
| confirmText     | string                       | 确认按钮文本            |
| cancelText      | string                       | 取消按钮文本            |
| confirmLoading  | boolean                      | 确认按钮加载状态        |
| confirmDisabled | boolean                      | 确认按钮禁用            |
| noPadding       | boolean                      | 内容无内边距            |
| mask            | boolean                      | 显示遮罩层              |
| footer          | ReactNode\| null             | 自定义底部（null=无底） |
| buttonAlign     | 'left'\| 'center' \| 'right' | 按钮对齐方式            |

---

## VII. 第三方库使用

### VII.1 OSS 上传模式

#### 上传文件

```typescript
import { uploadFileToAlioss } from '@/common/alioss';
import BusinessType from '@/common/alioss/businessType';

const handleUpload = async (file: File) => {
  try {
    const url = await uploadFileToAlioss({
      businessType: BusinessType.WISDOMPRINT_APPLY_FILE,
      file,
      callback: (progress: number) => {
        console.log('上传进度:', progress);
      }
    });
    return url;
  } catch (error) {
    layer.error('上传失败');
  }
};
```

#### 获取私有图片的签名 URL

```typescript
import { getSignedUrl } from '@/common/alioss';

const downloadFile = async (src: string) => {
  const signedUrl = await getSignedUrl({
    src,
    ossBusiness: BusinessType.WISDOMPRINT_APPLY_FILE,
    filename: 'report.pdf'
  });
  window.open(signedUrl);
};
```

---

### VII.2 日期处理模式

**使用 `dayjs`，不要使用 moment：**

```typescript
import dayjs from 'dayjs';

// 格式化
const formatted = dayjs(date).format('YYYY-MM-DD HH:mm:ss');

// 解析
const parsed = dayjs('2024-01-01', 'YYYY-MM-DD');

// 加减
const tomorrow = dayjs().add(1, 'day');
const lastMonth = dayjs().subtract(1, 'month');

// 比较
const isAfter = dayjs(date1).isAfter(date2);
```

---

### VII.3 加密模式

```typescript
import md5 from 'md5';

// MD5 哈希（常用于密码）
const hashedPassword = md5(password);
```

---

## VIII. 类型定义

### VIII.1 全局类型参考

```typescript
// 在任何地方使用这些类型
type ID = string | number;

interface BackendData<T = any> {
  bcode: string;
  code: string;
  data: T;
  msg: string;
  headers?: AxiosResponseHeaders;
}

interface BackendPaginationData<T = any> extends BackendData {
  data: {
    dataList: T;
    pageNum: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
  }
}

interface UniFileItem {
  name: string;
  src: string;
  uuid?: string;
  size?: number;
  type?: string;
  status?: 'done' | 'fail' | 'uploading';
  progress?: number;
}

interface UniColumn<T> extends ColumnType<T> {
  actions?: UseTableActionsConfig<T>[];
}

type StateParams = Record<string, any>;
```

---

### VIII.2 常用常量

```typescript
// StatusCode 枚举中的状态码
StatusCode.SUCCESS
StatusCode.TOKEN_EXPIRED
StatusCode.TOKEN_INVALID
StatusCode.NOPERMISSION

// Config 值（中央配置，来自 src/config.ts）
config.urlPrefix          // API 前缀
config.ACCCESS_TOKEN_KEY  // 'token'
config.REFRESH_TOKEN_KEY  // 'rtoken'
config.enableSilentRefresh // true
config.routerType        // 'hash' 或 'browser'
config.antdTheme         // Ant Design ConfigProvider 配置对象
```

---
