const PREFIX='ai-ledger-'+self.registration.scope;
const CACHE=PREFIX+'v2';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  // Never forward or cache transaction query parameters.
  event.respondWith(fetch(new URL('./index.html',self.registration.scope),{cache:'no-cache'}).then(async response=>{if(!response.ok)throw Error('Offline');const cache=await caches.open(CACHE);await cache.put('./index.html',response.clone());return response}).catch(()=>caches.match('./index.html')));
  return;
 }
 if(url.search||!ASSETS.some(path=>new URL(path,self.registration.scope).href===url.href))return;
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
