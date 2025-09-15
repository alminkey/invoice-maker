"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/store/useStore";
import { useEffect, useRef, useState } from "react";

export default function Nav() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme, companies, activeCompanyId, setActiveCompany } = useStore();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || btnRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  return (
    <nav className="p-4 flex gap-4 text-sm items-center relative">
      <Link href="/" className="font-semibold tracking-tight text-white">Invoice<span className="text-[var(--accent-400)]">maker</span></Link>
      <Link href="/invoices" className="hover:underline text-[var(--subtle)] hover:text-white hidden md:inline">{t('nav_invoices')}</Link>
      <Link href="/clients" className="hover:underline text-[var(--subtle)] hover:text-white hidden md:inline">{t('nav_clients')}</Link>
      <Link href="/stats" className="hover:underline text-[var(--subtle)] hover:text-white hidden md:inline">{t('nav_stats')}</Link>
      <Link href="/settings" className="hover:underline text-[var(--subtle)] hover:text-white ml-auto hidden md:inline">{t('nav_settings')}</Link>
      <button ref={btnRef} aria-label="Menu" className="btn btn-outline md:ml-2 ml-auto" onClick={()=>setOpen(v=>!v)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={()=>setOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-80 bg-[var(--surface)] border-l border-white/10 z-50 transform transition-transform duration-200 ease-out translate-x-0" ref={panelRef}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="font-medium">Meni</div>
              <button className="btn btn-outline px-2 py-1" onClick={()=>setOpen(false)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto h-full">
              <div className="grid gap-2">
                <Link href="/invoices" className="btn btn-outline w-full justify-start" onClick={()=>setOpen(false)}>{t('nav_invoices')}</Link>
                <Link href="/clients" className="btn btn-outline w-full justify-start" onClick={()=>setOpen(false)}>{t('nav_clients')}</Link>
                <Link href="/stats" className="btn btn-outline w-full justify-start" onClick={()=>setOpen(false)}>{t('nav_stats')}</Link>
                <Link href="/settings" className="btn btn-outline w-full justify-start" onClick={()=>setOpen(false)}>{t('nav_settings')}</Link>
              </div>
              <div>
                <div className="text-xs text-[var(--subtle)] mb-1">Kompanija</div>
                <select value={activeCompanyId || ''} onChange={(e)=>setActiveCompany(e.target.value)} className="input w-full">
                  {companies.length === 0 ? <option value="">No company</option> : null}
                  {companies.map(c => <option key={c.id} value={c.id}>{c.profile.name}</option>)}
                </select>
              </div>
              <div>
                <div className="text-xs text-[var(--subtle)] mb-1">Jezik</div>
                <select value={lang} onChange={(e)=>setLang(e.target.value as 'bs'|'en'|'nl'|'sk')} className="input w-full">
                  <option value="bs">BS</option>
                  <option value="en">EN</option>
                  <option value="nl">NL</option>
                  <option value="sk">SK</option>
                </select>
              </div>
              <div className="pt-1">
                <label className="chip cursor-pointer w-full justify-center select-none">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={theme === 'light'}
                    onChange={(e)=> setTheme(e.target.checked ? 'light' : 'dark')}
                  />
                  {theme === 'light' ? 'Light' : 'Dark'}
                </label>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
