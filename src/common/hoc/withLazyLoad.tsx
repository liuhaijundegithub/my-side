import React, { Suspense } from 'react';
import { Skeleton } from 'antd';

const SuspenseLoading = () => (
  <Skeleton style={{ width: '100%', height: '200px', padding: '0' }} />
);

type ImportFunc<T extends React.ComponentType> = () => Promise<{
  default: T;
}>;

const withLazyLoad = <T extends React.ComponentType<any>>(
  importFunc: ImportFunc<T>
) => {
  const LazyComponent = React.lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<SuspenseLoading />}>
      <LazyComponent {...props} />
    </Suspense>
  );

};

export default withLazyLoad;