import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { Client, CompanyProfile, Invoice, calcInvoiceTotal } from './models';

const ACCENT = '#7c3aed';
const fmt = (s?: string) => {
  if (!s) return '';
  const parts = s.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d}.${m}.${y}`;
  }
  try {
    const d = new Date(s);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = d.getFullYear();
    return `${dd}.${mm}.${yy}`;
  } catch {
    return s;
  }
};
const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, color: '#0f172a' },
  header: { marginBottom: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flexDirection: 'column' },
  titleBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: ACCENT, color: '#fff', padding: 10, borderRadius: 6 },
  title: { fontSize: 18, fontWeight: 700, color: '#fff' },
  section: { marginTop: 14 },
  light: { color: '#475569' },
  tableHeader: { flexDirection: 'row', borderBottom: '1 solid #cbd5e1', paddingBottom: 6, marginBottom: 6, backgroundColor: '#f8fafc' },
  cell: { flex: 1 },
  th: { fontWeight: 700 },
  tr: { flexDirection: 'row', paddingVertical: 6, borderBottom: '1 solid #e2e8f0' },
  right: { textAlign: 'right' },
  footer: { position: 'absolute', fontSize: 10, color: '#64748b', bottom: 20, left: 36, right: 36, textAlign: 'center' },
  badgePaid: { color: ACCENT, border: `1 solid ${ACCENT}`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999, fontSize: 10 },
  summary: { backgroundColor: '#f1f5f9', borderRadius: 6, padding: 8, minWidth: 220 },
  amountDue: { fontSize: 14, fontWeight: 700 }
});

export function InvoicePdf({ profile, client, invoice, labels }: {
  profile: CompanyProfile;
  client: Client;
  invoice: Invoice;
  labels: Record<string, string>;
}) {
  const totalNum = calcInvoiceTotal(invoice);
  const total = totalNum.toFixed(2);
  const deposit = Math.max(0, invoice.deposit || 0);
  const showDeposit = (invoice.depositEnabled !== undefined) ? !!invoice.depositEnabled : (deposit > 0);
  const amountDue = Math.max(0, totalNum - deposit).toFixed(2);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleBar}>
            <View>
              <Text style={styles.title}>{labels['invoice'] || 'Invoice'}</Text>
              {!!invoice.number && <Text>{labels['invoiceNo'] || 'Invoice No.'}: {invoice.number}</Text>}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {profile.logoUrl ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={profile.logoUrl} style={{ width: 120, height: 40, objectFit: 'contain' }} />
              ) : (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 14, fontWeight: 700 }}>{profile.name}</Text>
                  {!!profile.address && <Text>{profile.address}</Text>}
                  {!!profile.email && <Text>{profile.email}</Text>}
                  {!!profile.phone && <Text>{profile.phone}</Text>}
                </View>
              )}
            </View>
          </View>
          <View style={[styles.row, { marginTop: 8 }]}>
            <View>
              <Text style={styles.light}>{labels['issueDate']}: {fmt(invoice.issueDate)}</Text>
              {!!invoice.dueDate && <Text style={styles.light}>{labels['dueDate']}: {fmt(invoice.dueDate)}</Text>}
              <Text style={styles.light}>{labels['currency']}: {invoice.currency}</Text>
            </View>
            {invoice.paid && (
              <View>
                <Text style={styles.badgePaid}>{labels['paid'] || 'Paid'}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={{ width: '48%' }}>
              <Text style={{ marginBottom: 4, fontSize: 12, fontWeight: 700 }}>{labels['billTo']}</Text>
              <Text>{client.name}</Text>
              {!!client.address && <Text>{client.address}</Text>}
              {!!client.email && <Text>{client.email}</Text>}
              {!!client.vatId && <Text>VAT: {client.vatId}</Text>}
              {!!client.kvk && <Text>K.V.K: {client.kvk}</Text>}
            </View>
            <View style={{ width: '48%' }}>
              <Text style={{ marginBottom: 4, fontSize: 12, fontWeight: 700 }}>{labels['from']}</Text>
              <Text>{profile.name}</Text>
              {!!profile.address && <Text>{profile.address}</Text>}
              {!!profile.email && <Text>{profile.email}</Text>}
              {!!profile.vatId && <Text>VAT: {profile.vatId}</Text>}
              {!!profile.ico && <Text>ICO: {profile.ico}</Text>}
              {!!profile.dic && <Text>DIC: {profile.dic}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, { flex: 5 }, styles.th]}>{labels['description']}</Text>
            <Text style={[styles.cell, styles.right, styles.th]}>{labels['qty']}</Text>
            <Text style={[styles.cell, styles.right, styles.th]}>{labels['price']}</Text>
            <Text style={[styles.cell, styles.right, styles.th]}>{labels['amount']}</Text>
          </View>
          {invoice.items.map((it, idx) => {
            const s = fmt(it.startDate);
            const e = fmt(it.endDate);
            const period = it.startDate || it.endDate ? ` (${s || ''}${s && e ? ' – ' : ''}${e || ''})` : '';
            return (
            <View key={idx} style={[styles.tr, { backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }] }>
              <Text style={{ flex: 5 }}>
                {it.description}
                {period ? <Text style={styles.light}>{period}</Text> : null}
              </Text>
              <Text style={[styles.cell, styles.right]}>{it.quantity}</Text>
              <Text style={[styles.cell, styles.right]}>{it.unitPrice.toFixed(2)}</Text>
              <Text style={[styles.cell, styles.right]}>{(it.quantity * it.unitPrice).toFixed(2)}</Text>
            </View>
          )})}
          <View style={{ borderTop: '1 solid #cbd5e1', marginTop: 8, paddingTop: 8, flexDirection: 'row', justifyContent: 'flex-end' }}>
            <View style={styles.summary}>
              <Text>{labels['total']}: {total} {invoice.currency}</Text>
              {showDeposit ? <Text>{labels['deposit']}: -{deposit.toFixed(2)} {invoice.currency}</Text> : null}
              <Text style={styles.amountDue}>{labels['amountDue']}: {amountDue} {invoice.currency}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          {(profile.bank || profile.iban) && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, marginBottom: 2, fontWeight: 700 }}>{labels['paymentInfo']}</Text>
              {!!profile.bank && <Text>{labels['bank']}: {profile.bank}</Text>}
              {!!profile.iban && <Text>{labels['iban']}: {profile.iban}</Text>}
            </View>
          )}
          {!!invoice.notes && (
            <View>
              <Text style={{ fontSize: 12, marginBottom: 2, fontWeight: 700 }}>{labels['notes']}</Text>
              <Text>{invoice.notes}</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `${labels['thankYou']} – ${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}

export const i18nLabels: Record<string, Record<string, string>> = {
  en: {
    invoice: 'Invoice', invoiceNo: 'Invoice No.', billTo: 'Bill to', from: 'From', description: 'Description', qty: 'Qty', price: 'Unit price', amount: 'Amount', total: 'Total', notes: 'Notes', issueDate: 'Issue date', dueDate: 'Due date', currency: 'Currency', paymentInfo: 'Payment information', bank: 'Bank', iban: 'IBAN', thankYou: 'Thank you for your business', paid: 'Paid', deposit: 'Deposit', amountDue: 'Amount due'
  },
  bs: {
    invoice: 'Faktura', invoiceNo: 'Broj fakture', billTo: 'Za:', from: 'Od', description: 'Opis', qty: 'Količina', price: 'Jedinična cijena', amount: 'Iznos', total: 'Ukupno', notes: 'Napomena', issueDate: 'Datum izdavanja', dueDate: 'Rok plaćanja', currency: 'Valuta', paymentInfo: 'Podaci za plaćanje', bank: 'Banka', iban: 'IBAN', thankYou: 'Hvala na saradnji', paid: 'Plaćeno', deposit: 'Depozit', amountDue: 'Za naplatu'
  },
  nl: {
    invoice: 'Factuur', invoiceNo: 'Factuurnummer', billTo: 'Aan', from: 'Van', description: 'Omschrijving', qty: 'Aantal', price: 'Prijs', amount: 'Bedrag', total: 'Totaal', notes: 'Opmerkingen', issueDate: 'Factuurdatum', dueDate: 'Vervaldatum', currency: 'Valuta', paymentInfo: 'Betaalinformatie', bank: 'Bank', iban: 'IBAN', thankYou: 'Bedankt voor uw vertrouwen', paid: 'Betaald', deposit: 'Aanbetaling', amountDue: 'Te betalen'
  },
  sk: {
    invoice: 'Faktúra', invoiceNo: 'Číslo faktúry', billTo: 'Pre', from: 'Od', description: 'Popis', qty: 'Množstvo', price: 'Cena', amount: 'Suma', total: 'Spolu', notes: 'Poznámky', issueDate: 'Dátum vystavenia', dueDate: 'Splatnosť', currency: 'Mena', paymentInfo: 'Platobné informácie', bank: 'Banka', iban: 'IBAN', thankYou: 'Ďakujeme za spoluprácu', paid: 'Zaplatené', deposit: 'Záloha', amountDue: 'Na úhradu'
  },
};
