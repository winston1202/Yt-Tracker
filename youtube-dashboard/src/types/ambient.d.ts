declare module 'axios' {
  const axios: any;
  export default axios;
}

declare module 'clsx' {
  const clsx: (...inputs: any[]) => string;
  export { clsx };
  export default clsx;
}

declare module 'tailwindcss-merge' {
  export function twMerge(...classes: string[]): string;
}

declare var process: {
  env: { [key: string]: string | undefined };
};
