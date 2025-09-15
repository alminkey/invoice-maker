"use client";
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { CompanyProfile, Language } from '@/lib/models';
import { useI18n } from '@/lib/i18n';

const languages: { code: Language; label: string }[] = [
  { code: 'bs', label: 'Bosanski' },
  { code: 'nl', label: 'Holandski' },
  { code: 'en', label: 'Engleski' },
  { code: 'sk', label: 'Slovački' },
];

export default function SettingsPage() {
  const { t } = useI18n();
  const { profile, setProfile, numbering, setNumbering, clients, invoices, setClients, setInvoices } = useStore();
  const [form, setForm] = useState<CompanyProfile>({
    name: '',
    address: '',
    email: '',
    phone: '',
    vatId: '',
    iban: '',
    bank: '',
    logoUrl: '',
    defaultLanguage: 'bs',
    currency: 'EUR',
  });

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const save = () => {
    if (!form.name.trim()) {
      alert(t('company_name_required'));
      return;
    }
    setProfile(form);
  };

  const exportJson = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: form,
      numbering,
      clients,
      invoices,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice-maker-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || '{}'));
        if (data.profile) setProfile(data.profile);
        if (data.numbering) setNumbering(data.numbering);
        if (Array.isArray(data.clients)) setClients(data.clients);
        if (Array.isArray(data.invoices)) setInvoices(data.invoices);
        alert(t('import_done'));
      } catch (e) {
        alert(t('invalid_json'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl font-semibold mb-6">{t('settings_title')}</h1>
      <div className="card p-4 grid gap-3 md:grid-cols-2">
        <input className="input" placeholder="Naziv kompanije" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
        <input className="input" placeholder="Adresa" value={form.address} onChange={(e)=>setForm({...form, address: e.target.value})} />
        <input className="input" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} />
        <input className="input" placeholder="Telefon" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} />
        <input className="input" placeholder="PDV/VAT ID" value={form.vatId} onChange={(e)=>setForm({...form, vatId: e.target.value})} />
        <input className="input" placeholder="IČO" value={form.ico || ''} onChange={(e)=>setForm({...form, ico: e.target.value})} />
        <input className="input" placeholder="DIČ" value={form.dic || ''} onChange={(e)=>setForm({...form, dic: e.target.value})} />
        <input className="input" placeholder="IBAN" value={form.iban} onChange={(e)=>setForm({...form, iban: e.target.value})} />
        <input className="input" placeholder="Banka" value={form.bank} onChange={(e)=>setForm({...form, bank: e.target.value})} />
        <input className="input" placeholder="Logo URL (opcionalno)" value={form.logoUrl} onChange={(e)=>setForm({...form, logoUrl: e.target.value})} />
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">{t('default_language')}</label>
          <select className="input" value={form.defaultLanguage} onChange={(e)=>setForm({...form, defaultLanguage: e.target.value as Language})}>
            {languages.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">{t('currency')}</label>
          <input className="input" value={form.currency} readOnly />
        </div>
        <div className="col-span-full mt-4">
          <h2 className="font-medium mb-2">{t('numbering')}</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('prefix')}</label>
              <input className="input" placeholder="npr. INV" value={numbering.prefix} onChange={(e)=>setNumbering({ ...numbering, prefix: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('next_no')}</label>
              <input type="number" className="input" value={numbering.next} onChange={(e)=>setNumbering({ ...numbering, next: Math.max(1, Number(e.target.value||1)) })} />
            </div>
            <div className="text-sm text-gray-600 flex items-end">{t('format')}: {`${numbering.prefix || ''}${new Date().getFullYear()}-${String(numbering.next).padStart(4,'0')}`}</div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input id="resetYearly" type="checkbox" checked={!!numbering.resetYearly} onChange={(e)=>setNumbering({...numbering, resetYearly: e.target.checked})} />
            <label htmlFor="resetYearly" className="text-sm text-gray-700">Resetuj serijski broj svake godine</label>
          </div>
        </div>
        <div className="col-span-full mt-4">
          <h2 className="font-medium mb-2">{t('upload_logo')}</h2>
          <div className="flex items-center gap-4">
            <label className="border rounded px-3 py-2 cursor-pointer">
              {t('upload_logo')}
              <input type="file" accept="image/*" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (!f) return; const fr=new FileReader(); fr.onload=()=> setForm({...form, logoUrl: String(fr.result)}); fr.readAsDataURL(f); }} />
            </label>
            {form.logoUrl && <img src={form.logoUrl} alt="logo" className="h-10 object-contain" />}
          </div>
        </div>
      </div>
      <button onClick={save} className="mt-4 btn btn-primary">{t('save')}</button>

      <div className="mt-8 border-t border-white/10 pt-6">
        <h2 className="font-medium mb-3">Backup / Restore</h2>
        <div className="flex items-center gap-4">
          <button onClick={exportJson} className="btn btn-outline">Export JSON</button>
          <label className="btn btn-outline cursor-pointer">
            Import JSON
            <input type="file" accept="application/json" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) importJson(f); }}/>
          </label>
        </div>
      </div>
    </main>
  );
}
