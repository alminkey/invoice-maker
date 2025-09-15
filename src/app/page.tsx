"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/store/useStore";
import { calcInvoiceTotal, calcInvoiceAmountDue } from "@/lib/models";

export default function Home() {
  const { t } = useI18n();
  const { invoices } = useStore();
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const totalDue = invoices.filter(i=>!i.paid).reduce((s,i)=> s + calcInvoiceAmountDue(i), 0);
  const paidThisMonth = invoices.filter(i=> i.paid && i.paidDate && (()=>{ const d=new Date(i.paidDate); return d.getFullYear()===y && d.getMonth()===m; })()).length;
  const unpaidCount = invoices.filter(i=> !i.paid).length;
  const recent = [...invoices].slice(0, 5);
  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">{t('home_title')}</h1>
        <p className="text-[var(--subtle)]">{t('home_sub')}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="card p-4">
          <div className="text-sm text-[var(--subtle)]">Za naplatu ukupno</div>
          <div className="text-2xl text-[var(--danger)]">{totalDue.toFixed(2)} EUR</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-[var(--subtle)]">Plaćene ovaj mjesec</div>
          <div className="text-2xl text-[var(--success)]">{paidThisMonth}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-[var(--subtle)]">Neplaćene</div>
          <div className="text-2xl">{unpaidCount}</div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/invoices/new" className="card p-6 hover:shadow-[0_10px_40px_-12px_rgba(124,58,237,0.5)] transition">
          <h2 className="text-xl font-medium">{t('new_invoice')}</h2>
          <p className="text-sm text-[var(--subtle)]">{t('create_pdf')}</p>
        </Link>
        <Link href="/clients" className="card p-6 hover:shadow-[0_10px_40px_-12px_rgba(124,58,237,0.35)] transition">
          <h2 className="text-xl font-medium">{t('nav_clients')}</h2>
          <p className="text-sm text-[var(--subtle)]">Upravljanje klijentima i njihovim podacima.</p>
        </Link>
        <Link href="/stats" className="card p-6 hover:shadow-[0_10px_40px_-12px_rgba(124,58,237,0.35)] transition">
          <h2 className="text-xl font-medium">{t('nav_stats')}</h2>
          <p className="text-sm text-[var(--subtle)]">Pregled iznosa i faktura po klijentima.</p>
        </Link>
        <Link href="/settings" className="card p-6 hover:shadow-[0_10px_40px_-12px_rgba(124,58,237,0.35)] transition">
          <h2 className="text-xl font-medium">{t('nav_settings')}</h2>
          <p className="text-sm text-[var(--subtle)]">Profil kompanije i jezik.</p>
        </Link>
      </section>

      <section className="mt-10">
        <h3 className="text-lg font-medium mb-3">{t('recent_invoices')}</h3>
        {recent.length === 0 ? (
          <div className="text-sm text-[var(--subtle)]">{t('none_yet')}</div>
        ) : (
          <ul className="space-y-2">
            {recent.map(inv => (
              <li key={inv.id} className="card p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{inv.number ?? `#${inv.id.slice(0,6)}`}</div>
                  <div className="text-xs text-[var(--subtle)]">{inv.issueDate}</div>
                </div>
                <div className="text-sm font-semibold">{calcInvoiceTotal(inv).toFixed(2)} EUR</div>
                <Link href={`/invoices/${inv.id}`} className="btn btn-outline">{t('open')}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
