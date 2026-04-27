import {useCallback} from "react";
import type {Ref, RefObject, RefCallback} from "react";

export const useMergeRef = <T>(...refs: Ref<T>[]) => {
  return useCallback((node: T | null) => {
    refs.forEach(ref => {
      if (!ref) return;
      if (typeof ref === 'function') {
        (ref as RefCallback<T>)(node);
      } else {
        (ref as RefObject<T | null>).current = node;
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};
