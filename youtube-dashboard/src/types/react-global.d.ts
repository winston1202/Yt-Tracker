import * as React from 'react';

declare global {
  namespace React {
    type ReactNode = any;
    interface FC<P = any> {
      (props: P & { children?: ReactNode }): any;
    }
  }
}

export {};
