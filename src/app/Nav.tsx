"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Nav() {
  const { t, lang, setLang } = useI18n();
  return (
    <nav className="p-4 flex gap-4 text-sm items-center">
      <Link href="/" className="font-semibold tracking-tight text-white">Invoice<span className="text-[var(--accent-400)]">maker</span></Link>
      <Link href="/invoices" className="hover:underline text-[var(--subtle)] hover:text-white">{t('nav_invoices')}</Link>
      <Link href="/clients" className="hover:underline text-[var(--subtle)] hover:text-white">{t('nav_clients')}</Link>
      <Link href="/stats" className="hover:underline text-[var(--subtle)] hover:text-white">{t('nav_stats')}</Link>
      <Link href="/settings" className="hover:underline text-[var(--subtle)] hover:text-white ml-auto">{t('nav_settings')}</Link>
      <select value={lang} onChange={(e)=>setLang(e.target.value as 'bs'|'en'|'nl'|'sk')} className="ml-4 border-white/10 bg-black/20 text-[var(--subtle)] hover:text-white border rounded-md px-2 py-1">
        <option value="bs">BS</option>
        <option value="en">EN</option>
        <option value="nl">NL</option>
        <option value="sk">SK</option>
      </select>
    </nav>
  );
}
