"use client";
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { calcInvoiceTotal } from '@/lib/models';
import { useI18n } from '@/lib/i18n';

export default function InvoicesIndex() {
  const { t } = useI18n();
  const { invoices, clients, profile, removeInvoice, updateInvoice } = useStore();
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<'all'|'paid'|'unpaid'>('all');
  const [year, setYear] = useState('');
  const [q, setQ] = useState('');
  const years = useMemo(()=> Array.from(new Set(invoices.map(i=> (i.issueDate||'').slice(0,4)).filter(Boolean))).sort().reverse(), [invoices]);
  const filtered = useMemo(()=>
    invoices.filter(inv =>
      (!clientId || inv.clientId === clientId) &&
      (status==='all' || (status==='paid' ? !!inv.paid : !inv.paid)) &&
      (!q || (inv.number || '').toLowerCase().includes(q.toLowerCase())) &&
      (!year || inv.issueDate?.startsWith(year))
    )
  ,[invoices, clientId, status, q, year]);

  const exportZip = async () => {
    if (!profile) { alert('Nedostaje profil.'); return; }
    const mod = await import('jszip');
    const JSZip: any = (mod as any).default || (mod as any);
    const { pdf } = await import('@react-pdf/renderer');
    const { InvoicePdf, i18nLabels } = await import('@/lib/pdf');
    const zip = new JSZip();
    for (const inv of filtered) {
      const client = clients.find(c=>c.id===inv.clientId);
      if (!client) continue;
      const labels = i18nLabels[inv.language || profile.defaultLanguage] || i18nLabels.en;
      const blob = await pdf(<InvoicePdf profile={profile} client={client} invoice={inv} labels={labels} />).toBlob();
      const name = `${inv.number ?? `invoice-${inv.id}`}.pdf`;
      zip.file(name, blob);
    }
    const out = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(out);
    const a = document.createElement('a');
    a.href = url;
    const label = `${clientId ? (clients.find(c=>c.id===clientId)?.name || 'client') : 'all'}-${year || 'all'}`;
    a.download = `invoices-${label}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t('invoices_title')}</h1>
        <div className="flex items-center gap-2">
          <button onClick={exportZip} className="btn btn-outline">Export ZIP</button>
          <Link href="/invoices/new" className="btn btn-primary"><span className="inline-block mr-2">+</span>{t('new_invoice')}</Link>
        </div>
      </div>
      <div className="grid md:grid-cols-5 gap-2 mb-4">
        <select className="input" value={clientId} onChange={(e)=>setClientId(e.target.value)}>
          <option value="">{t('filter_client')}</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input" value={status} onChange={(e)=>setStatus(e.target.value as 'all'|'paid'|'unpaid')}>
          <option value="all">{t('status_all')}</option>
          <option value="paid">{t('status_paid')}</option>
          <option value="unpaid">{t('status_unpaid')}</option>
        </select>
        <select className="input" value={year} onChange={(e)=>setYear(e.target.value)}>
          <option value="">Godina</option>
          {years.map(y=> <option key={y} value={y}>{y}</option>)}
        </select>
        <input className="input md:col-span-2" placeholder={t('search')} value={q} onChange={(e)=>setQ(e.target.value)} />
      </div>
      <ul className="space-y-2">
        {filtered.map((inv)=> {
          const c = clients.find(x=>x.id===inv.clientId);
          const calcDiff = ()=>{
            if (!inv.dueDate) return null;
            const today = new Date(); today.setHours(0,0,0,0);
            const dd = new Date(inv.dueDate);
            return Math.ceil((dd.getTime() - today.getTime())/86400000);
          };
          const diff = calcDiff();
          const total = calcInvoiceTotal(inv).toFixed(2);
          return (
          <li key={inv.id} className="card p-3 grid md:grid-cols-4 items-center gap-2">
            <div className="md:col-span-3">
              <div className="font-medium">{c?.name || '—'}</div>
              <div className="text-sm">{inv.number ?? `#${inv.id.slice(0,6)}`}</div>
              <div className="text-sm text-[var(--subtle)]">
                {inv.issueDate}
                {inv.dueDate ? <> - {inv.dueDate} {diff !== null ? <span className={`ml-2 text-xs font-semibold ${Number(diff) >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>({Math.abs(Number(diff))})</span> : null}</> : null}
              </div>
            </div>
            <div className="flex gap-3 justify-end items-center">
              <div className={`text-lg font-semibold ${inv.paid ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{total} EUR</div>
              <button
                className={"btn " + (inv.paid ? 'btn-success' : 'btn-primary')}
                onClick={()=> updateInvoice({ ...inv, paid: !inv.paid, paidDate: !inv.paid ? new Date().toISOString().slice(0,10) : undefined })}
              >{inv.paid ? t('mark_unpaid') : t('mark_paid')}</button>
              <Link href={`/invoices/${inv.id}`} className="btn btn-outline">{t('open')}</Link>
              <Link href={`/invoices/${inv.id}/edit`} className="btn btn-outline">{t('edit')}</Link>
              <button className="btn btn-danger" onClick={()=>{ if (confirm(t('confirm_delete_invoice'))) removeInvoice(inv.id); }}>{t('delete')}</button>
            </div>
          </li>
        );})}
        {filtered.length === 0 && <li className="text-sm text-gray-500">{t('none_yet')}</li>}
      </ul>
    </main>
  );
}
