Recoverable Error

Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

See more info here: https://nextjs.org/docs/messages/react-hydration-error


  ...
    <LoadingBoundary loading={null}>
      <HTTPAccessFallbackBoundary notFound={undefined} forbidden={undefined} unauthorized={undefined}>
        <RedirectBoundary>
          <RedirectErrorBoundary router={{...}}>
            <InnerLayoutRouter url="/invoices/new" tree={[...]} cacheNode={{lazyData:null, ...}} segmentPath={[...]}>
              <SegmentViewNode type="page" pagePath="invoices/n...">
                <SegmentTrieNode>
                <ClientPageRoot Component={function NewInvoicePage} searchParams={{}} params={{}}>
                  <NewInvoicePage params={Promise} searchParams={Promise}>
                    <main className="max-w-4xl ...">
                      <h1>
                      <div>
                      <div>
                      <div>
                      <div>
                      <div>
                      <div className="mt-4">
                        <Calendar>
                          <div className="calendar c...">
                            <div className="flex items...">
                              <button>
                              <div className="text-sm font-medium">
+                               2025 M09
-                               septembar 2025.
                              ...
                            ...
                      ...
              ...
            ...
src\components\Calendar.tsx (28:9) @ Calendar


  26 |       <div className="flex items-center justify-between mb-2">
  27 |         <button className="btn btn-outline px-2 py-1" onClick={prevMonth} aria-label="Previous month">‹</button>
> 28 |         <div className="text-sm font-medium">{title}</div>
     |         ^
  29 |         <button className="btn btn-outline px-2 py-1" onClick={nextMonth} aria-label="Next month">›</button>
  30 |       </div>
  31 |       <div className="grid grid-cols-7 text-xs text-[var(--subtle)] mb-1">
Call Stack