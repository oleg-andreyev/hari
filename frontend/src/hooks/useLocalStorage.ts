import React, { useCallback } from "react";

const LOCAL_STORAGE: Record<string, string> = {};

// if browser's localStorage is not available then this will use local variable which will be reseted on each reload :(
const useLocalStorage = (parseJSON: boolean) => {
  const isLocalStorageAvailable = !!window.localStorage?.clear;

  const getItem = useCallback(
    (key: string) => {
      const value = isLocalStorageAvailable
        ? window.localStorage.getItem(key)
        : LOCAL_STORAGE[key];
      if (parseJSON) {
        try {
          return JSON.parse(value as string);
        } catch (err: any) {
          return;
        }
      }
      return value;
    },
    [isLocalStorageAvailable, parseJSON]
  );

  const setItem = useCallback(
    (key: string, value: any) => {
      try {
        const valueToStore = parseJSON ? JSON.stringify(value) : value;
        isLocalStorageAvailable
          ? window.localStorage.setItem(key, valueToStore)
          : (LOCAL_STORAGE[key] = valueToStore);
      } catch (err: any) {
        return;
      }
    },
    [isLocalStorageAvailable, parseJSON]
  );

  return {
    getItem,
    setItem,
  };
};

export default useLocalStorage;
