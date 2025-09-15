"use client";
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Client } from '@/lib/models';
import { uid } from '@/lib/id';
import { useI18n } from '@/lib/i18n';

export default function ClientsPage() {
  const { t } = useI18n();
  const { clients, addClient, updateClient, removeClient } = useStore();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [vatId, setVatId] = useState("");
  const [kvk, setKvk] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const onAdd = () => {
    const errs: string[] = [];
    if (!name.trim()) errs.push(t('name_required'));
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.push(t('invalid_email'));
    setErrors(errs);
    if (errs.length > 0) return;
    const c: Client = { id: uid(), name, address, email, vatId, kvk };
    addClient(c);
    setName("");
    setAddress("");
    setEmail("");
    setVatId("");
    setKvk("");
  };

  const onSaveEdit = (c: Client) => {
    const errs: string[] = [];
    if (!c.name.trim()) errs.push(t('name_required'));
    if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) errs.push(t('invalid_email'));
    setErrors(errs);
    if (errs.length > 0) return;
    updateClient(c);
    setEditingId(null);
  };

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl font-semibold mb-6">{t('clients_title')}</h1>
      <div className="card p-4 mb-6">
        <h2 className="font-medium mb-3">{t('add_client')}</h2>
        {errors.length>0 && (
          <div className="mb-2 rounded border border-red-300 bg-red-50 text-red-700 p-2 text-sm">
            <ul className="list-disc ml-4">
              {errors.map((e, i)=> (<li key={i}>{e}</li>))}
            </ul>
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <input className="input" placeholder="Naziv" value={name} onChange={(e)=>setName(e.target.value)} />
          <input className="input" placeholder="Adresa" value={address} onChange={(e)=>setAddress(e.target.value)} />
          <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="input" placeholder="PDV/VAT ID" value={vatId} onChange={(e)=>setVatId(e.target.value)} />
          <input className="input" placeholder="K.V.K" value={kvk} onChange={(e)=>setKvk(e.target.value)} />
        </div>
        <button onClick={onAdd} className="mt-4 btn btn-primary">{t('save')}</button>
      </div>

      <ul className="space-y-2">
        {clients.map((c) => {
          const isEditing = editingId === c.id;
          return (
            <li key={c.id} className="card p-3">
              {isEditing ? (
                <div className="grid gap-2 md:grid-cols-2">
                  <input className="input" value={c.name} onChange={(e)=>updateClient({...c, name: e.target.value})} />
                  <input className="input" value={c.address || ''} placeholder="Adresa" onChange={(e)=>updateClient({...c, address: e.target.value})} />
                  <input className="input" value={c.email || ''} placeholder="Email" onChange={(e)=>updateClient({...c, email: e.target.value})} />
                  <input className="input" value={c.vatId || ''} placeholder="PDV/VAT ID" onChange={(e)=>updateClient({...c, vatId: e.target.value})} />
                  <input className="input" value={c.kvk || ''} placeholder="K.V.K" onChange={(e)=>updateClient({...c, kvk: e.target.value})} />
                  <div className="col-span-full flex gap-3">
                    <button className="btn btn-primary" onClick={()=>onSaveEdit(c)}>{t('save')}</button>
                    <button className="btn btn-outline" onClick={()=>setEditingId(null)}>{t('cancel')}</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-gray-600">{c.email || c.address}</div>
                  </div>
                  <div className="flex gap-3">
                    <button className="btn btn-outline" onClick={()=>setEditingId(c.id)}>{t('edit')}</button>
                    <button className="btn btn-danger" onClick={()=>{ if (confirm(t('confirm_delete_client'))) removeClient(c.id); }}>{t('delete')}</button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
        {clients.length === 0 && (
          <li className="text-sm text-gray-500">{t('none_yet')}</li>
        )}
      </ul>
    </main>
  );
}
