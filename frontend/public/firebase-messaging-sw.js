importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDummy",
  authDomain: "placeholder.firebaseapp.com",
  projectId: "placeholder",
  storageBucket: "placeholder.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000",
};

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.notification?.title || data.data?.title || "Cars24";
  const options = {
    body: data.notification?.body || data.data?.body || "You have a new notification",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    image: data.notification?.image || undefined,
    data: {
      url: data.data?.url || "/",
      type: data.data?.type || "general",
    },
    tag: data.data?.type || "cars24-notification",
    requireInteraction: false,
    actions: [],
  };

  if (data.data?.action1) {
    options.actions.push({ action: "action1", title: data.data.action1 });
  }
  if (data.data?.action2) {
    options.actions.push({ action: "action2", title: data.data.action2 });
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  if (event.action === "action1" && event.notification.data?.action1Url) {
    event.waitUntil(clients.openWindow(event.notification.data.action1Url));
  } else if (event.action === "action2" && event.notification.data?.action2Url) {
    event.waitUntil(clients.openWindow(event.notification.data.action2Url));
  } else {
    event.waitUntil(clients.openWindow(url));
  }
});
