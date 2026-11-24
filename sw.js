/* Service worker — keeps the app working without internet */
const CACHE='uos-v1795546778';
const SHELL=['./','./index.html','./config.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;               // data goes to the Google server, never cached here
  const u=new URL(r.url);
  if(u.hostname.endsWith('script.google.com')||u.hostname.endsWith('googleusercontent.com'))return;
  const page=r.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/config.js');
  if(page){ // newest version when online, saved copy when offline
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r.mode==='navigate'?'./index.html':r,cp));return res;})
      .catch(()=>caches.match(r.mode==='navigate'?'./index.html':r).then(x=>x||caches.match('./index.html'))));return;}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;})));
});
