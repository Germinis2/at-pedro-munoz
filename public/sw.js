// Service worker: solo muestra los avisos push y abre la página al tocarlos (no guarda nada en caché)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'At. Pedro Muñoz', {
      body: data.body,
      tag: data.tag,
      icon: '/icon-192.png',
      badge: '/badge.png',
      data: { url: data.url || '/' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const win = list.find((c) => c.url.startsWith(self.location.origin))
      if (win) return win.focus().then(() => win.navigate(url))
      return self.clients.openWindow(url)
    }),
  )
})
