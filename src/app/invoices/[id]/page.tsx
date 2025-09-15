"use client";
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { calcInvoiceTotal, calcInvoiceAmountDue, Language } from '@/lib/models';
import { pdf } from '@react-pdf/renderer';
import { InvoicePdf, i18nLabels } from '@/lib/pdf';
import { useI18n } from '@/lib/i18n';

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const { t } = useI18n();
  const { invoices, clients, profile, removeInvoice, updateInvoice } = useStore();
  const [lang, setLang] = useState<Language>(profile?.defaultLanguage || 'bs');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const invoice = useMemo(() => invoices.find(i=>i.id===params.id), [invoices, params.id]);
  const client = clients.find(c => c.id === invoice?.clientId);

  if (!invoice || !client || !profile) {
    return <main className="max-w-3xl mx-auto p-6">Faktura nije pronađena ili nedostaju podaci profila/klijenta.</main>;
  }

  const total = calcInvoiceTotal(invoice);
  const amountDue = calcInvoiceAmountDue(invoice);
  const labels = i18nLabels[lang];

  const onDownload = async () => {
    const blob = await pdf(<InvoicePdf profile={profile} client={client} invoice={invoice} labels={labels} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.number ?? `invoice-${invoice.id}`}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onPreview = async () => {
    const blob = await pdf(<InvoicePdf profile={profile} client={client} invoice={invoice} labels={labels} />).toBlob();
    setPreviewUrl(URL.createObjectURL(blob));
  };

  const downloadAll = async () => {
    const langs: Language[] = ['bs','nl','en','sk'];
    for (const l of langs) {
      const lab = i18nLabels[l];
      const blob = await pdf(<InvoicePdf profile={profile} client={client} invoice={invoice} labels={lab} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.number ?? `invoice-${invoice.id}`}-${l}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const togglePaid = () => {
    updateInvoice({ ...invoice, paid: !invoice.paid, paidDate: !invoice.paid ? new Date().toISOString().slice(0,10) : undefined });
  };

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl font-semibold mb-2">Faktura {invoice.number ?? `#${invoice.id.slice(0,6)}`}</h1>
      <div className="text-sm text-[var(--subtle)] mb-4 flex items-center gap-3 flex-wrap">
        <span>{t('total')}: {total.toFixed(2)} {invoice.currency}</span>
        {invoice.deposit ? <span>• {t('deposit')}: {invoice.deposit.toFixed(2)} {invoice.currency}</span> : null}
        <span>• {t('amount_due')}: <strong className="text-white">{amountDue.toFixed(2)} {invoice.currency}</strong></span>
        {invoice.paid && <span className="chip">{t('status_paid')}</span>}
      </div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <button className={"btn " + (invoice.paid ? 'btn-success' : 'btn-primary')} onClick={togglePaid}>{invoice.paid ? t('mark_unpaid') : t('mark_paid')}</button>
        <Link href={`/invoices/${invoice.id}/edit`} className="btn btn-outline">{t('edit')}</Link>
        <button className="btn btn-danger" onClick={()=>{ if (confirm(t('confirm_delete_invoice'))) { removeInvoice(invoice.id); window.location.href = '/invoices'; } }}>{t('delete')}</button>
        <button className="btn btn-outline" onClick={onPreview}>{t('preview_pdf')}</button>
        <button className="btn btn-primary" onClick={onDownload}>{t('download_pdf')}</button>
        <button className="btn btn-outline" onClick={downloadAll}>{t('download_all')}</button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-gray-600">Jezik PDF-a</label>
        <select className="border rounded px-2 py-1" value={lang} onChange={(e)=>setLang(e.target.value as Language)}>
          <option value="bs">Bosanski</option>
          <option value="nl">Holandski</option>
          <option value="en">Engleski</option>
          <option value="sk">Slovački</option>
        </select>
      </div>

      <section className="card p-4">
        <h2 className="font-medium mb-2">Podaci</h2>
        <div className="grid md:grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-600">Klijent</div>
            <div>{client.name}</div>
          </div>
          <div>
            <div className="text-gray-600">Datumi</div>
            <div>Izdavanje: {invoice.issueDate}</div>
            {invoice.dueDate && <div>Rok: {invoice.dueDate}</div>}
          </div>
          <div className="md:col-span-2">
            <div className="text-gray-600">Stavke</div>
            <ul className="list-disc ml-4">
              {invoice.items.map(it => (
                <li key={it.id}>{it.description} × {it.quantity} – {it.unitPrice.toFixed(2)} EUR</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      {previewUrl && (
        <section className="mt-6 card overflow-hidden">
          <iframe src={previewUrl} className="w-full h-[70vh]" />
        </section>
      )}
    </main>
  );
}
