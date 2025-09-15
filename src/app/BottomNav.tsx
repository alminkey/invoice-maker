"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function BottomNav() {
  const { t } = useI18n();
  return (
    <div className="bottom-nav">
      <div className="max-w-5xl mx-auto px-4 py-2 flex justify-around">
        <Link href="/invoices" className="btn btn-outline">{t('nav_invoices')}</Link>
        <Link href="/clients" className="btn btn-outline">{t('nav_clients')}</Link>
        <Link href="/stats" className="btn btn-outline">{t('nav_stats')}</Link>
        <Link href="/settings" className="btn btn-outline">{t('nav_settings')}</Link>
      </div>
    </div>
  );
}

