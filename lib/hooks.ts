import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface leftSidebarSwitchStateStore {
    isOpen: boolean;
    setIsOpen: () => void;
  }

  export const leftSidebarSwitch = create(
    persist<leftSidebarSwitchStateStore>(
      (set, get) => ({
        isOpen: true,
        setIsOpen: () => {
          set({ isOpen: !get().isOpen });
        }
      }),
      {
        name: 'sidebarOpen',
        storage: createJSONStorage(() => localStorage)
      }
    )
  );

export const useStateStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};