export type Language = 'bs' | 'nl' | 'en' | 'sk';

export interface CompanyProfile {
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  vatId?: string;
  ico?: string; // IČO
  dic?: string; // DIČ
  iban?: string;
  bank?: string;
  logoUrl?: string;
  defaultLanguage: Language;
  currency: 'EUR';
  // Numbering config
  invoicePrefix?: string; // e.g. ""
  nextInvoice?: number;   // serial part, e.g. 1
}

export interface Client {
  id: string;
  name: string;
  address?: string;
  email?: string;
  vatId?: string;
  kvk?: string; // K.V.K broj (NL)
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  startDate?: string; // YYYY-MM-DD when service started
  endDate?: string;   // YYYY-MM-DD when service ended
}

export interface Invoice {
  id: string;
  clientId: string;
  issueDate: string; // ISO
  dueDate?: string; // ISO
  items: InvoiceItem[];
  notes?: string;
  language?: Language; // for export
  currency: 'EUR';
  number?: string; // formatted invoice number (e.g. 2025-0001 or INV2025-0001)
  paid?: boolean;
  paidDate?: string;
  deposit?: number; // upfront payment to subtract from total
  depositEnabled?: boolean; // controls showing deposit line in PDF
}

export function calcInvoiceTotal(inv: Invoice): number {
  return inv.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
}

export function calcInvoiceAmountDue(inv: Invoice): number {
  const total = calcInvoiceTotal(inv);
  const dep = Math.max(0, inv.deposit || 0);
  return Math.max(0, total - dep);
}
