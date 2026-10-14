// 하이스트 선생님 앱 알림용 서비스 워커
// 앱(Apps Script)이 FCM으로 보낸 알림을 받아 휴대폰 알림 + 아이콘 숫자(배지)를 띄움.
// FCM 데이터 메시지 형식: { data: { title, body, url, tag } }

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var p = {};
  try { p = e.data ? e.data.json() : {}; } catch (err) {}
  var d = p.data || p.notification || {};
  var title = d.title || '[하이스트] 선생님 앱';
  var opt = {
    body: d.body || '새 소식이 있습니다.',
    icon: 'icon-192.png',
    tag: d.tag || 'highest',
    renotify: true,
    data: { url: d.url || './' }
  };
  e.waitUntil(
    self.registration.showNotification(title, opt).then(function () {
      if (!self.navigator.setAppBadge) return;
      return self.registration.getNotifications().then(function (ns) {
        return self.navigator.setAppBadge(ns.length || 1);
      });
    }).catch(function () {})
  );
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = new URL((e.notification.data && e.notification.data.url) || './', self.location.href).href;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url === url && 'focus' in list[i]) return list[i].focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
