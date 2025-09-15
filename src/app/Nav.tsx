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
    <nav className="p-4 flex gap-3 items-center relative">
      <Link href="/" className="font-semibold tracking-tight text-white">Invoice<span className="text-[var(--accent-400)]">maker</span></Link>
      <div className="ml-auto flex items-center gap-2">
        <Link aria-label="Settings" href="/settings" className="btn btn-outline px-2 py-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H8a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8c0 .66.39 1.26 1 1.51.5.2 1.04.31 1.6.31H22a2 2 0 1 1 0 4h-.09c-.56 0-1.1.11-1.6.31-.61.25-1 .85-1 1.51z"/></svg>
        </Link>
        <button ref={btnRef} aria-label="Menu" className="btn btn-outline" onClick={()=>setOpen(v=>!v)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xl" onClick={()=>setOpen(false)}>
          <div ref={panelRef} className="w-[90vw] max-w-md card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Postavke</div>
              <button className="btn btn-outline px-2 py-1" onClick={()=>setOpen(false)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-4">
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
              <div>
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
        </div>
      )}
    </nav>
  );
}
