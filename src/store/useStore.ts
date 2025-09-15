"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client, Company, CompanyProfile, Invoice } from '@/lib/models';

type Store = {
  profile: CompanyProfile | null;
  clients: Client[];
  invoices: Invoice[];
  numbering: { prefix: string; next: number; lastYear?: number; resetYearly?: boolean };
  uiLanguage?: 'bs'|'nl'|'en'|'sk';
  theme?: 'dark'|'light';
  companies: Company[];
  activeCompanyId?: string;
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
  // Companies
  addCompany: (p?: Partial<CompanyProfile>) => string;
  updateCompany: (id: string, patch: Partial<Company>) => void;
  removeCompany: (id: string) => void;
  setActiveCompany: (id: string) => void;
  _syncFromActive: () => void;
};

export const useStore = create<Store>()(
  persist<Store>(
    (set, get, _api): Store => ({
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
      companies: [],
      activeCompanyId: undefined,
      // helper
      _syncFromActive() {
        const state = get();
        const c = state.companies.find(x=>x.id===state.activeCompanyId);
        set({
          profile: c?.profile ?? null,
          numbering: c?.numbering ?? state.numbering,
          clients: c?.clients ?? [],
          invoices: c?.invoices ?? [],
        });
      },
      setProfile: (p: CompanyProfile) => set((s)=>{
        const id = s.activeCompanyId;
        const companies = s.companies.map(co => co.id===id ? { ...co, profile: p } : co);
        return { companies, profile: p };
      }),
      addClient: (c: Client) => set((s) => {
        const id = s.activeCompanyId;
        const companies = s.companies.map(co => co.id===id ? { ...co, clients: [c, ...co.clients] } : co);
        return { companies, clients: [c, ...s.clients] };
      }),
      updateClient: (c: Client) => set((s) => {
        const id = s.activeCompanyId;
        const companies = s.companies.map(co => co.id===id ? { ...co, clients: co.clients.map(x=>x.id===c.id?c:x) } : co);
        return { companies, clients: s.clients.map(x=>x.id===c.id?c:x) };
      }),
      removeClient: (id: string) => set((s) => {
        const active = s.activeCompanyId;
        const companies = s.companies.map(co => co.id===active ? { ...co, clients: co.clients.filter(x=>x.id!==id) } : co);
        return { companies, clients: s.clients.filter(x=>x.id!==id) };
      }),
      setClients: (arr: Client[]) => set((s)=>{
        const id = s.activeCompanyId;
        const companies = s.companies.map(co => co.id===id ? { ...co, clients: arr } : co);
        return { companies, clients: arr };
      }),
      addInvoice: (i: Invoice) => set((s) => {
        const id = s.activeCompanyId;
        const companies = s.companies.map(co => co.id===id ? { ...co, invoices: [i, ...co.invoices] } : co);
        return { companies, invoices: [i, ...s.invoices] };
      }),
      updateInvoice: (i: Invoice) => set((s) => {
        const id = s.activeCompanyId;
        const companies = s.companies.map(co => co.id===id ? { ...co, invoices: co.invoices.map(x=>x.id===i.id?i:x) } : co);
        return { companies, invoices: s.invoices.map(x=>x.id===i.id?i:x) };
      }),
      removeInvoice: (id: string) => set((s) => {
        const active = s.activeCompanyId;
        const companies = s.companies.map(co => co.id===active ? { ...co, invoices: co.invoices.filter(x=>x.id!==id) } : co);
        return { companies, invoices: s.invoices.filter(x=>x.id!==id) };
      }),
      setNumbering: (n: { prefix: string; next: number; lastYear?: number; resetYearly?: boolean }) => set((s)=>{
        const id = s.activeCompanyId;
        const companies = s.companies.map(co => co.id===id ? { ...co, numbering: n } : co);
        return { companies, numbering: n };
      }),
      setInvoices: (arr: Invoice[]) => set((s)=>{
        const id = s.activeCompanyId;
        const companies = s.companies.map(co => co.id===id ? { ...co, invoices: arr } : co);
        return { companies, invoices: arr };
      }),
      setUiLanguage: (lang: 'bs'|'nl'|'en'|'sk') => set({ uiLanguage: lang }),
      setTheme: (t: 'dark'|'light') => set({ theme: t }),
      addCompany: (p?: Partial<CompanyProfile>) => {
        const id = (Math.random().toString(36).slice(2) + Date.now().toString(36));
        const defaultNumbering = { prefix: `${(function(){
          const d = new Date();
          const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
          const dayNr = (target.getUTCDay() + 6) % 7;
          target.setUTCDate(target.getUTCDate() - dayNr + 3);
          const firstThursday = new Date(Date.UTC(target.getUTCFullYear(),0,4));
          const weekNo = 1 + Math.round(((target.getTime() - firstThursday.getTime())/86400000 - 3 + ((firstThursday.getUTCDay()+6)%7)) / 7);
          return String(weekNo);
        })()}-`, next: 1, lastYear: new Date().getFullYear(), resetYearly: true };
        const profile: CompanyProfile = {
          name: p?.name || 'Nova kompanija',
          address: p?.address || '',
          email: p?.email || '',
          phone: p?.phone || '',
          vatId: p?.vatId || '',
          ico: p?.ico,
          dic: p?.dic,
          iban: p?.iban || '',
          bank: p?.bank || '',
          logoUrl: p?.logoUrl,
          defaultLanguage: p?.defaultLanguage || 'bs',
          currency: 'EUR',
        };
        set((s)=>{
          const co: Company = { id, profile, numbering: defaultNumbering, clients: [], invoices: [] };
          const companies = [...s.companies, co];
          const activeCompanyId = s.activeCompanyId || id;
          return { companies, activeCompanyId };
        });
        // sync mirrors
        const state = get();
        if (!state.profile) {
          get()._syncFromActive?.();
        }
        return id;
      },
      updateCompany: (id: string, patch: Partial<Company>) => set((s)=>{
        const companies = s.companies.map(co => {
          if (co.id !== id) return co;
          const nextProfile = patch.profile ? { ...co.profile, ...patch.profile } : co.profile;
          const nextNumbering = patch.numbering ? { ...co.numbering, ...patch.numbering } : co.numbering;
          return { ...co, ...patch, profile: nextProfile, numbering: nextNumbering } as Company;
        });
        return { companies };
      }),
      removeCompany: (id: string) => set((s)=>{
        const companies = s.companies.filter(co => co.id!==id);
        const activeCompanyId = s.activeCompanyId===id ? companies[0]?.id : s.activeCompanyId;
        return { companies, activeCompanyId };
      }),
      setActiveCompany: (id: string) => { set({ activeCompanyId: id }); get()._syncFromActive?.(); },
    }),
    {
      name: 'invoice-maker-store',
      onRehydrateStorage: () => () => {
        try {
          const s = get();
          // migrate single-profile store to multi-company on first load
          if (s && s.companies && s.companies.length === 0 && (s.profile || (s.clients && s.clients.length) || (s.invoices && s.invoices.length))) {
            const id = (Math.random().toString(36).slice(2) + Date.now().toString(36));
            const co: Company = {
              id,
              profile: s.profile || { name: 'Moja kompanija', defaultLanguage: 'bs', currency: 'EUR' } as CompanyProfile,
              numbering: s.numbering,
              clients: s.clients,
              invoices: s.invoices,
            };
            set({ companies: [co], activeCompanyId: id });
            get()._syncFromActive?.();
          } else {
            get()._syncFromActive?.();
          }
        } catch {}
      }
    }
  )
);
