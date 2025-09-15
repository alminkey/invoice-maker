"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function BottomNav() {
  const { t } = useI18n();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/30 border-t border-white/10" style={{ backgroundImage: 'linear-gradient(90deg, transparent, color-mix(in oklab, var(--accent-600) 18%, transparent), transparent)'}}>
      <div className="max-w-5xl mx-auto px-4 py-2 flex justify-around">
        <Link href="/invoices" className="btn btn-outline">{t('nav_invoices')}</Link>
        <Link href="/clients" className="btn btn-outline">{t('nav_clients')}</Link>
        <Link href="/stats" className="btn btn-outline">{t('nav_stats')}</Link>
      </div>
    </div>
  );
}
