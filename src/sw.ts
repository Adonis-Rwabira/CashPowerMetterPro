import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { clientsClaim } from 'workbox-core';
import { checkMetersAndGenerateNotifications } from './core/notifications';

declare let self: ServiceWorkerGlobalScope;

// Définition de type pour SyncEvent pour contourner le problème de typage
// Elle doit hériter de ExtendableEvent pour avoir accès à waitUntil
interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
  readonly lastChance: boolean;
}
declare global {
    interface ServiceWorkerGlobalScopeEventMap {
        sync: SyncEvent;
    }
}

// --- 1. CYCLE DE VIE ET MISE EN CACHE --- 

// Précachage de tous les assets générés par Vite
precacheAndRoute(self.__WB_MANIFEST || []);

// Force le nouveau Service Worker à devenir actif immédiatement
self.addEventListener('install', () => {
  self.skipWaiting();
});
clientsClaim();

// Stratégie Cache-First pour la navigation. Indispensable pour une PWA 100% offline.
// Cela garantit que l'app shell (index.html) est toujours servi depuis le cache en priorité.
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler);
registerRoute(navigationRoute);


// --- 2. TÂCHES DE FOND & NOTIFICATIONS LOCALES --- 

/**
 * NOTE : Le listener 'push' est conçu pour les notifications PUSH envoyées par un serveur.
 * Dans notre architecture 100% hors-ligne, nous n'utiliserons que des notifications locales
 * déclenchées par l'application ou des Background Sync. Ce code est conservé à titre
 * d'exemple pour une future évolution potentielle vers un modèle hybride.
 */
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Nouvelle Notification';
  const options = {
    body: data.body || 'Vous avez une nouvelle alerte.',
    icon: data.icon || '/icon.svg',
    badge: '/icon.svg',
    tag: data.tag || 'default',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Écouteur pour la synchronisation en arrière-plan.
 * Permet de déclencher des tâches même si l'onglet de l'app est fermé.
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-meters-background') {
    console.log("Service Worker: 'Sync' event pour 'check-meters-background' reçu.");
    event.waitUntil(checkAndNotify());
  }
});

async function checkAndNotify() {
    try {
        const newNotifications = await checkMetersAndGenerateNotifications();
        if (newNotifications.length > 0) {
            console.log(`Service Worker: ${newNotifications.length} notification(s) générée(s) en arrière-plan.`);
            // Ici, vous pourriez déclencher une notification locale pour informer l'utilisateur
            // que de nouvelles alertes sont disponibles dans l'app.
            self.registration.showNotification('Nouvelles Alertes de Compteur', {
                body: `Vous avez ${newNotifications.length} nouvelle(s) alerte(s) à consulter.`,
                icon: '/icon.svg',
                tag: 'meter-update'
            });
        }
    } catch (error) {
        console.error("Service Worker: Erreur durant la vérification en arrière-plan des compteurs.", error);
    }
}
