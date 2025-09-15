"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Invoice, InvoiceItem, calcInvoiceTotal } from '@/lib/models';
import { uid } from '@/lib/id';
import { useI18n } from '@/lib/i18n';
import Calendar from '@/components/Calendar';

export default function NewInvoicePage() {
  const router = useRouter();
  const { t } = useI18n();
  const { clients, addInvoice, profile, numbering, setNumbering, companies, activeCompanyId, setActiveCompany } = useStore();
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [dueDate, setDueDate] = useState<string>("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: uid(), description: '', quantity: 1, unitPrice: 0, startDate: '', endDate: '' },
  ]);
  const [notes, setNotes] = useState("");
  const [deposit, setDeposit] = useState<number>(0);
  const [depositEnabled, setDepositEnabled] = useState<boolean>(true);
  const [errors, setErrors] = useState<string[]>([]);

  const addRow = () => setItems((arr)=>[...arr, { id: uid(), description: '', quantity: 1, unitPrice: 0, startDate: '', endDate: '' }]);
  const updateItem = (id: string, patch: Partial<InvoiceItem>) => setItems((arr)=>arr.map(i=>i.id===id?{...i, ...patch}:i));
  const removeItem = (id: string) => setItems((arr)=>arr.filter(i=>i.id!==id));

  // Prefill description from last invoice for the same client
  const lastDescForClient = (cid: string) => {
    const last = useStore.getState().invoices.find(i=>i.clientId===cid);
    return last?.items?.[0]?.description || '';
  };

  const validate = () => {
    const errs: string[] = [];
    if (!clientId) errs.push(t('select_client'));
    const validItems = items.filter(i => i.description.trim() && i.quantity > 0 && i.unitPrice >= 0);
    if (validItems.length === 0) errs.push(t('add_valid_item'));
    if (dueDate && issueDate && dueDate < issueDate) errs.push(t('due_before_issue'));
    const subtotal = validItems.reduce((s,i)=> s + i.quantity * i.unitPrice, 0);
    if (deposit < 0) errs.push('Deposit cannot be negative.');
    if (deposit > subtotal) errs.push('Deposit cannot exceed total.');
    setErrors(errs);
    return errs.length === 0;
  };

  const onSave = () => {
    if (!validate()) return;
    const year = new Date(issueDate).getFullYear();
    const shouldReset = numbering?.resetYearly && numbering?.lastYear !== year;
    const serial = shouldReset ? 1 : (numbering?.next ?? (profile?.nextInvoice ?? 1));
    const prefix = (numbering?.prefix ?? profile?.invoicePrefix ?? '') || '';
    const number = `${prefix}${year}-${String(serial).padStart(4, '0')}`;
    const inv: Invoice = {
      id: uid(),
      clientId,
      issueDate,
      dueDate: dueDate || undefined,
      items: items.filter(i => i.description.trim() && i.quantity > 0),
      notes,
      currency: 'EUR',
      language: profile?.defaultLanguage || 'bs',
      number,
      deposit: deposit || 0,
      depositEnabled,
    };
    addInvoice(inv);
    // increment serial in store
    setNumbering({ prefix, next: serial + 1, lastYear: year, resetYearly: numbering?.resetYearly });
    router.push(`/invoices/${inv.id}`);
  };

  const tempInvoice: Invoice = { id:'-', clientId:'-', issueDate, items, currency:'EUR' } as Invoice;
  const subtotal = calcInvoiceTotal(tempInvoice);
  const amountDue = Math.max(0, subtotal - (deposit||0));

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl font-semibold mb-6">{t('new_invoice')}</h1>

      {errors.length > 0 && (
        <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 text-red-300 p-3 text-sm">
          <ul className="list-disc ml-4">
            {errors.map((e, i)=> (<li key={i}>{e}</li>))}
          </ul>
        </div>
      )}

      <div className="card p-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm text-[var(--subtle)] mb-1">Klijent</label>
          <select className="input" value={clientId} onChange={(e)=>{ const v=e.target.value; setClientId(v); if (v) { const d = lastDescForClient(v); if (d && !items[0]?.description) { setItems((arr)=> arr.length? [{...arr[0], description: d}, ...arr.slice(1)] : [{ id: uid(), description: d, quantity:1, unitPrice:0, startDate:'', endDate:'' }]); } } }}>
            <option value="">-- Odaberite klijenta --</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-[var(--subtle)] mb-1">Kompanija</label>
          <select className="input" value={activeCompanyId || ''} onChange={(e)=>setActiveCompany(e.target.value)}>
            {companies.map(c=> <option key={c.id} value={c.id}>{c.profile.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm text-[var(--subtle)] mb-1">{t('date_issue')}</label>
            <input type="date" className="input" value={issueDate} onChange={(e)=>setIssueDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-[var(--subtle)] mb-1">{t('date_due')}</label>
            <input type="date" className="input" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-medium mb-2">Stavke</h2>
        <div className="space-y-2">
          {items.map((it)=> (
            <div key={it.id} className="card p-3 grid md:grid-cols-10 gap-2 items-start">
              <textarea className="input md:col-span-4" rows={4} placeholder="Opis" value={it.description} onChange={(e)=>updateItem(it.id,{description:e.target.value})} />
              <div className="md:col-span-2">
                <div className="text-xs text-[var(--subtle)] mb-1">Od:</div>
                <input type="date" className="input" value={it.startDate || ''} onChange={(e)=>updateItem(it.id,{startDate: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-[var(--subtle)] mb-1">Do:</div>
                <input type="date" className="input" value={it.endDate || ''} onChange={(e)=>updateItem(it.id,{endDate: e.target.value})} />
              </div>
              <input
                inputMode="decimal"
                className="input md:col-span-1"
                placeholder="Kolièina"
                value={Number.isFinite(it.quantity) ? it.quantity : '' as any}
                onChange={(e)=>{
                  const v = e.target.value;
                  const num = v==='' ? NaN : Number(v);
                  updateItem(it.id,{quantity: num});
                }}
              />
              <div className="md:col-span-1">
                <input
                  inputMode="decimal"
                  className="input"
                  placeholder="Cijena"
                  value={Number.isFinite(it.unitPrice) ? it.unitPrice : '' as any}
                  onChange={(e)=>{
                    const v = e.target.value;
                    const num = v==='' ? NaN : Number(v);
                    updateItem(it.id,{unitPrice: num});
                  }}
                />
                <div className="mt-1 text-xs text-[var(--subtle)]">{(it.quantity * it.unitPrice).toFixed(2)} EUR</div>
              </div>
              <button className="btn btn-danger text-xs md:col-span-10 md:justify-self-end" onClick={()=>removeItem(it.id)}>Ukloni</button>
            </div>
          ))}
        </div>
        <button className="mt-3 btn btn-outline" onClick={addRow}>Dodaj stavku</button>
      </div>

      <div className="mt-6 card p-4 grid md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-sm text-[var(--subtle)] mb-1">{t('deposit')}</label>
          <input type="number" className="input" value={deposit} onChange={(e)=>setDeposit(Math.max(0, Number(e.target.value || 0)))} />
        </div>
        <div className="flex items-center gap-3 md:col-span-2">
          <label className="chip cursor-pointer select-none">
            <input type="checkbox" className="mr-2" checked={depositEnabled} onChange={(e)=>setDepositEnabled(e.target.checked)} />{t('show_in_pdf')}
          </label>
          <div className="text-sm text-[var(--subtle)]">
            {t('total')}: {subtotal.toFixed(2)} EUR â†’ {t('amount_due')}: {amountDue.toFixed(2)} EUR
          </div>
        </div>
      </div>

      {/* Invoice numbering controls */}
      <div className="mt-6 card p-4">
        <h2 className="font-medium mb-2">{t('numbering')}</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-[var(--subtle)] mb-1">{t('prefix')}</label>
            <input className="input" placeholder="npr. 37-" value={numbering.prefix} onChange={(e)=>setNumbering({ ...numbering, prefix: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-[var(--subtle)] mb-1">{t('next_no')}</label>
            <input type="number" className="input" value={numbering.next} onChange={(e)=>setNumbering({ ...numbering, next: Math.max(1, Number(e.target.value||1)) })} />
          </div>
          <div className="text-sm text-[var(--subtle)] flex items-end">{t('format')}: {`${numbering.prefix || ''}${new Date().getFullYear()}-${String(numbering.next).padStart(4,'0')}`}</div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input id="resetYearlyNew" type="checkbox" checked={!!numbering.resetYearly} onChange={(e)=>setNumbering({...numbering, resetYearly: e.target.checked})} />
          <label htmlFor="resetYearlyNew" className="text-sm text-[var(--subtle)]">Resetuj serijski broj svake godine</label>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm text-[var(--subtle)] mb-1">Napomena</label>
        <textarea className="input" rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} />
      </div>

      <div className="mt-4">
        <Calendar />
      </div>

      <button onClick={onSave} className="mt-6 btn btn-primary">{t('save')}</button>
    </main>
  );
}

