import { db, NotificationEntity } from '../db/database';
import { getEstimatedDaysRemaining } from './prediction';
import { v4 as uuidv4 } from 'uuid';

const LOW_BALANCE_THRESHOLD_DAYS = 3;

/**
 * Vérifie l'état de tous les compteurs et génère les notifications nécessaires.
 * @returns Une liste des nouvelles notifications créées.
 */
export const checkMetersAndGenerateNotifications = async (): Promise<NotificationEntity[]> => {
  console.log('Exécution du moteur de vérification des notifications...');

  const meters = await db.meters.where('status').equals('ACTIVE').and(m => m.type === 'SUB_METER').toArray();
  const newNotifications: NotificationEntity[] = [];

  for (const meter of meters) {
    const daysRemaining = await getEstimatedDaysRemaining(meter.id, meter.current_cached_balance);

    const commonData = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        is_read: 0 as 0 | 1,
        meter_id: meter.id,
    };

    // Scénario 1: Solde critique (négatif)
    if (meter.current_cached_balance < 0) {
        const notif: NotificationEntity = {
            ...commonData,
            type: 'critical',
            title: `Crédit Épuisé - ${meter.tenant_name}`,
            message: `Le solde du compteur ${meter.module_number} est négatif. Une recharge est requise.`,
        };
        newNotifications.push(notif);
    }
    // Scénario 2: Avertissement de solde bas
    else if (daysRemaining > 0 && daysRemaining <= LOW_BALANCE_THRESHOLD_DAYS) {
        const notif: NotificationEntity = {
            ...commonData,
            type: 'warning',
            title: `Solde Faible - ${meter.tenant_name}`,
            message: `Le crédit du compteur ${meter.module_number} est bas. Coupure estimée dans ~${Math.floor(daysRemaining)} jours.`,
        };
        newNotifications.push(notif);
    }
  }

  if (newNotifications.length > 0) {
    // On vérifie qu'on ne duplique pas une notification récente pour le même compteur et le même type
    const notificationsToSave = [];
    for (const notif of newNotifications) {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const existing = await db.notifications
            .where('meter_id').equals(notif.meter_id!)
            .and(n => n.type === notif.type && n.timestamp > thirtyMinutesAgo)
            .first();
        
        if (!existing) {
            notificationsToSave.push(notif);
        }
    }

    if(notificationsToSave.length > 0) {
        await db.notifications.bulkAdd(notificationsToSave);
        console.log(`${notificationsToSave.length} nouvelle(s) notification(s) enregistrée(s).`);
        return notificationsToSave;
    }
  }
  
  console.log('Aucune nouvelle notification à générer.');
  return [];
};
