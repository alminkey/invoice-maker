"use client";
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function ThemeApplier() {
  const { theme } = useStore();
  useEffect(() => {
    const el = document.documentElement;
    if (theme === 'light') {
      el.setAttribute('data-theme', 'light');
    } else {
      el.removeAttribute('data-theme');
    }
  }, [theme]);
  return null;
}

