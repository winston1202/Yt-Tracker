declare namespace JSX {
  interface IntrinsicElements {
    // allow any element name with any props
    [elemName: string]: any;
  }
}
