Build Error

Module not found: Can't resolve 'jszip'

./src/app/invoices/page.tsx (27:26)

Module not found: Can't resolve 'jszip'
  25 |   const exportZip = async () => {
  26 |     if (!profile) { alert('Nedostaje profil.'); return; }
> 27 |     const JSZip = (await import('jszip')).default;
     |                          ^
  28 |     const { pdf } = await import('@react-pdf/renderer');
  29 |     const { InvoicePdf, i18nLabels } = await import('@/lib/pdf');
  30 |     const zip = new JSZip();

https://nextjs.org/docs/messages/module-not-found