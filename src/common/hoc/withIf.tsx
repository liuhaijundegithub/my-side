import { AnyObject } from 'antd/es/_util/type';
import React from 'react';

interface WithIfProps {
  rif?: boolean;
}

function withIf<T extends AnyObject>(Component: React.ComponentType<T>) {
  return function ConditionalComponent(props: T & WithIfProps) {
    const { rif = true, ...rest } = props;
    if (rif) {
      return <Component {...rest as T} />;
    }
    return null;
  };
}

export default withIf;