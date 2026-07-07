// SmartSchool Service Worker — Call Notification System
// Handles OS-level push notifications for incoming voice and video calls.
// Supports: Chrome, Edge, Firefox, Safari 16+ (when installed as PWA on iOS)

const CACHE_NAME = 'smartschool-v1';

// ── Install & Activate ──────────────────────────────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// ── Message Handler — receive commands from the main React app ──────────────
self.addEventListener('message', event => {
  const data = event.data;
  if (!data || !data.type) return;

  // ── Show incoming call notification ────────────────────────────────────────
  if (data.type === 'SHOW_CALL_NOTIFICATION') {
    const { callId, callerName, callType, groupName, callerAvatar } = data;

    const isGroup = Boolean(groupName);
    const callTypeLabel = callType === 'video' ? 'gọi video' : 'gọi thoại';
    const body = isGroup
      ? `${callerName} đang gọi nhóm "${groupName}" — nhấn để tham gia`
      : `${callerName} đang ${callTypeLabel} cho bạn`;

    const notificationOptions = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `call-${callId}`,
      renotify: false,
      requireInteraction: true,
      silent: false,
      // vibrate: [300, 100, 300, 100, 300, 100, 300],  // Android vibration pattern
      actions: [
        {
          action: 'decline',
          title: '❌ Từ chối',
        },
        {
          action: 'accept',
          title: callType === 'video' ? '📹 Nhận (Video)' : '📞 Nhận',
        },
      ],
      data: {
        callId,
        url: self.location.origin,
        callType,
        callerName,
        groupName: groupName || null,
      },
    };

    event.waitUntil(
      self.registration.showNotification(
        isGroup
          ? `📞 Cuộc gọi nhóm — SmartSchool`
          : `📞 Cuộc gọi đến — SmartSchool`,
        notificationOptions
      )
    );
  }

  // ── Close existing call notification ───────────────────────────────────────
  if (data.type === 'CLOSE_CALL_NOTIFICATION') {
    const { callId } = data;
    event.waitUntil(
      self.registration.getNotifications({ tag: `call-${callId}` }).then(notifs => {
        notifs.forEach(n => n.close());
      })
    );
  }

  // ── Close ALL call notifications (e.g., on logout) ─────────────────────────
  if (data.type === 'CLOSE_ALL_CALL_NOTIFICATIONS') {
    event.waitUntil(
      self.registration.getNotifications().then(notifs => {
        notifs.filter(n => n.tag && n.tag.startsWith('call-')).forEach(n => n.close());
      })
    );
  }
});

// ── Notification Click Handler ──────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const action = event.action;
  const { callId, url } = notification.data || {};

  notification.close();

  if (action === 'accept') {
    // Relay CALL_ACCEPTED message to the focused app window, open if needed
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        // Find existing SmartSchool tab
        for (const client of clientList) {
          if (client.url.startsWith(url || self.location.origin)) {
            client.focus();
            client.postMessage({ type: 'CALL_ACCEPTED', callId });
            return;
          }
        }
        // No existing tab — open a new one and post message after load
        return clients.openWindow(url || '/').then(newClient => {
          if (newClient) {
            // Wait a moment for the page to initialize before posting
            setTimeout(() => {
              newClient.postMessage({ type: 'CALL_ACCEPTED', callId });
            }, 3000);
          }
        });
      })
    );
  } else if (action === 'decline') {
    // Relay CALL_DECLINED message to the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        for (const client of clientList) {
          if (client.url.startsWith(url || self.location.origin)) {
            client.postMessage({ type: 'CALL_DECLINED', callId });
            return;
          }
        }
        // App not open — just close the notification (already done above)
      })
    );
  } else {
    // User clicked the notification body (not an action button) → focus the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        for (const client of clientList) {
          if (client.url.startsWith(url || self.location.origin)) {
            client.focus();
            return;
          }
        }
        return clients.openWindow(url || '/');
      })
    );
  }
});

// ── Notification Close Handler (user dismissed) ────────────────────────────
self.addEventListener('notificationclose', event => {
  const { callId } = event.notification.data || {};
  if (!callId) return;

  // Inform the app that the notification was dismissed
  clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
    for (const client of clientList) {
      client.postMessage({ type: 'CALL_NOTIFICATION_DISMISSED', callId });
    }
  });
});
