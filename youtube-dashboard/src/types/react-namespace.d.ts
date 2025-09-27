declare namespace React {
  interface BaseSyntheticEvent<T = any, E = Event, C = any> {
    target: EventTarget & T;
    currentTarget: EventTarget & T;
    bubbles: boolean;
    cancelable: boolean;
    defaultPrevented: boolean;
    preventDefault(): void;
    stopPropagation(): void;
  }

  type SyntheticEvent<T = Element, E = Event> = BaseSyntheticEvent<T, E>;
  type FormEvent<T = Element> = SyntheticEvent<T, Event>;
  type ChangeEvent<T = Element> = SyntheticEvent<T, Event> & { target: EventTarget & T };
  type MouseEvent<T = Element> = SyntheticEvent<T, MouseEvent>;
}
