"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client, CompanyProfile, Invoice } from '@/lib/models';

type Store = {
  profile: CompanyProfile | null;
  clients: Client[];
  invoices: Invoice[];
  numbering: { prefix: string; next: number; lastYear?: number; resetYearly?: boolean };
  uiLanguage?: 'bs'|'nl'|'en'|'sk';
  theme?: 'dark'|'light';
  setProfile: (p: CompanyProfile) => void;
  addClient: (c: Client) => void;
  updateClient: (c: Client) => void;
  removeClient: (id: string) => void;
  setClients: (arr: Client[]) => void;
  addInvoice: (i: Invoice) => void;
  updateInvoice: (i: Invoice) => void;
  removeInvoice: (id: string) => void;
  setNumbering: (n: { prefix: string; next: number; lastYear?: number; resetYearly?: boolean }) => void;
  setInvoices: (arr: Invoice[]) => void;
  setUiLanguage: (lang: 'bs'|'nl'|'en'|'sk') => void;
  setTheme: (t: 'dark'|'light') => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      /* default numbering prefix = current ISO week number + '-' */
      // helper for ISO week number
      
      profile: null,
      clients: [],
      invoices: [],
      numbering: { prefix: `${(function(){
        const d = new Date();
        // ISO week date weeks start on Monday, the first week of the year contains the first Thursday
        const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const dayNr = (target.getUTCDay() + 6) % 7;
        target.setUTCDate(target.getUTCDate() - dayNr + 3);
        const firstThursday = new Date(Date.UTC(target.getUTCFullYear(),0,4));
        const weekNo = 1 + Math.round(((target.getTime() - firstThursday.getTime())/86400000 - 3 + ((firstThursday.getUTCDay()+6)%7)) / 7);
        return String(weekNo);
      })()}-`, next: 1, lastYear: new Date().getFullYear(), resetYearly: true },
      uiLanguage: undefined,
      theme: 'dark',
      setProfile: (p) => set({ profile: p }),
      addClient: (c) => set((s) => ({ clients: [c, ...s.clients] })),
      updateClient: (c) =>
        set((s) => ({ clients: s.clients.map((x) => (x.id === c.id ? c : x)) })),
      removeClient: (id) => set((s) => ({ clients: s.clients.filter((x) => x.id !== id) })),
      setClients: (arr) => set({ clients: arr }),
      addInvoice: (i) => set((s) => ({ invoices: [i, ...s.invoices] })),
      updateInvoice: (i) =>
        set((s) => ({ invoices: s.invoices.map((x) => (x.id === i.id ? i : x)) })),
      removeInvoice: (id) => set((s) => ({ invoices: s.invoices.filter((x) => x.id !== id) })),
      setNumbering: (n) => set({ numbering: n }),
      setInvoices: (arr) => set({ invoices: arr }),
      setUiLanguage: (lang) => set({ uiLanguage: lang }),
      setTheme: (t) => set({ theme: t }),
    }),
    { name: 'invoice-maker-store' }
  )
);
