import PageNotFond from '@/common/pages/exceptions/NotFound';
import NoPermission from '@/common/pages/exceptions/NoPermission';
import withLazyLoad from '@/common/hoc/withLazyLoad';
import BlogLayout from '@/layout/BlogLayout';

const Home = withLazyLoad(() => import('@/pages/blog/home/Home'));
const Redirect = withLazyLoad(() => import('@/common/pages/exceptions/Redirect'));

const routes: UniRouteObject[] = [
  {
    path: '/',
    element: <BlogLayout />,
    children: [
      { index: true, element: <Home /> }
    ]
  },
  {
    path: '/page-redirect',
    element: <Redirect />
  },
  {
    path: '/404',
    element: <PageNotFond />
  },
  {
    path: '/401',
    element: <NoPermission />
  },
  {
    path: '*',
    element: <PageNotFond />
  }
];

export default routes;
