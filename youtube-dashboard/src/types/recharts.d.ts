declare module 'recharts' {
  // Commonly used chart components in this repo
  export const LineChart: any;
  export const Line: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
  export const Tooltip: any;
  export const ResponsiveContainer: any;
  export const BarChart: any;
  export const Bar: any;
  export const Legend: any;

  // Generic fallback for other members
  const _default: any;
  export default _default;
}
