// Minimal, well-formed ambient declarations used as a temporary fallback
// while full @types are installed locally via npm.

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare namespace ReactTypes {
  type ReactNode = any;
  type FC<P = any> = (props: P & { children?: ReactNode }) => any;

  function useState<S = any>(initialState?: S | (() => S)):
    [S, (value: S | ((prevState: S) => S)) => void];

  function useEffect(effect: () => void | (() => void), deps?: any[]): void;

  function useRef<T = any>(initial?: T): { current: T | undefined };

  function useMemo<T>(factory: () => T, deps?: any[]): T;

  function useCallback<T extends (...args: any) => any>(cb: T, deps?: any[]): T;
}

declare module 'react' {
  export = ReactTypes;
}

declare module 'next/link' {
  const Link: any;
  export default Link;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function useParams(): any;
  export function usePathname(): any;
}

declare module 'next' {
  export type Metadata = any;
}

declare module 'next/font/google' {
  export function Inter(opts?: any): any;
}

declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
}

declare module 'lucide-react' {
  // Export names used by the dashboard. These are permissive any types
  // until proper types are available from the installed package.
  export const Eye: any;
  export const Clock: any;
  export const TrendingUp: any;
  export const User: any;
  export const Sparkles: any;
  export const X: any;
  export const Copy: any;
  export const CircleCheck: any;
  export const Lightbulb: any;
  export const Image: any;
  export const Zap: any;
  export const Search: any;
  export const ListFilter: any;
  export const RefreshCw: any;
  export const Bell: any;
  export const Mail: any;
  export const MessageSquare: any;
  export const Settings: any;
  export const TestTube: any;
  export const Circle: any;
  export const Play: any;
  export const ChartBar: any;
  export const BarChart3: any;
  export const Menu: any;
  export const Video: any;
  export const Calendar: any;
  export const Users: any;
  export const Server: any;
  export const Pause: any;
  export const Activity: any;
  export const Hash: any;

  const _default: any;
  export default _default;
}

export {};
