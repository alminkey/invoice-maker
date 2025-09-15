"use client";
import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { calcInvoiceTotal } from '@/lib/models';
import { useI18n } from '@/lib/i18n';

export default function StatsPage() {
  const { t } = useI18n();
  const { invoices, clients, companies, activeCompanyId, setActiveCompany } = useStore();
  const totals = useMemo(() => {
    const byClient: Record<string, number> = {};
    for (const inv of invoices) {
      const t = calcInvoiceTotal(inv);
      byClient[inv.clientId] = (byClient[inv.clientId] || 0) + t;
    }
    return byClient;
  }, [invoices]);

  const totalSum = invoices.reduce((s, i)=> s + calcInvoiceTotal(i), 0);

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t('stats_title')}</h1>
        <select className="input w-auto" value={activeCompanyId || ''} onChange={(e)=>setActiveCompany(e.target.value)}>
          {companies.map(c=> <option key={c.id} value={c.id}>{c.profile.name}</option>)}
        </select>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4"><div className="text-sm text-[var(--subtle)]">{t('invoices_title')}</div><div className="text-2xl">{invoices.length}</div></div>
        <div className="card p-4"><div className="text-sm text-[var(--subtle)]">{t('total')} (EUR)</div><div className="text-2xl">{totalSum.toFixed(2)}</div></div>
        <div className="card p-4"><div className="text-sm text-[var(--subtle)]">{t('clients_title')}</div><div className="text-2xl">{clients.length}</div></div>
      </div>

      <h2 className="font-medium mb-2">Po klijentima</h2>
      <ul className="space-y-2">
        {Object.entries(totals).map(([clientId, sum]) => {
          const c = clients.find((x)=>x.id===clientId);
          if (!c) return null;
          return <li key={clientId} className="card p-3 flex justify-between"><span>{c.name}</span><span>{sum.toFixed(2)} EUR</span></li>;
        })}
        {invoices.length === 0 && <li className="text-sm text-gray-500">{t('none_yet')}</li>}
      </ul>
    </main>
  );
}
