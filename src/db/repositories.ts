import { db, MeterEntity, ReadingEntity, NotificationEntity, AppSettingEntity, TopupEntity } from './database';
import { v4 as uuidv4 } from 'uuid';

// --- Types --- 

export type HistoryEvent = (ReadingEntity & { eventType: 'reading' }) | (TopupEntity & { eventType: 'topup' });

// --- Fonctions de Lecture (Read) ---

export const getAllMeters = async (): Promise<MeterEntity[]> => {
  return await db.meters.orderBy('module_number').toArray();
};

export const getMeterById = async (id: string): Promise<MeterEntity | undefined> => {
  return await db.meters.get(id);
};

export const getReadingsForMeter = async (meterId: string): Promise<ReadingEntity[]> => {
    return await db.readings.where({ meter_id: meterId }).sortBy('recorded_at');
}

export const getHistoryEvents = async (meterId?: string): Promise<HistoryEvent[]> => {
    const readingQuery = meterId ? db.readings.where({ meter_id: meterId }) : db.readings;
    const topupQuery = meterId ? db.topups.where({ meter_id: meterId }) : db.topups;

    const readings = await readingQuery.toArray();
    const topups = await topupQuery.toArray();

    const history: HistoryEvent[] = [
        ...readings.map(r => ({ ...r, eventType: 'reading' as const })),
        ...topups.map(t => ({ ...t, eventType: 'topup' as const }))
    ];

    // Tri par date, du plus récent au plus ancien
    return history.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
};

export const getAllReadings = async (): Promise<ReadingEntity[]> => {
    return await db.readings.orderBy('recorded_at').toArray();
}

export const getLatestNotifications = async (limit: number = 3): Promise<NotificationEntity[]> => {
    return await db.notifications.orderBy('timestamp').reverse().limit(limit).toArray();
}

// --- Fonctions d'Écriture (Write) ---

export const createMeter = async (meterData: Omit<MeterEntity, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
    const newId = uuidv4();
    const newMeter: MeterEntity = {
        ...meterData,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    await db.meters.add(newMeter);
    return newId;
};

export const updateMeterDetails = (id: string, updates: Partial<Pick<MeterEntity, 'label' | 'module_number' | 'theme_color'>>) => {
  return db.meters.update(id, { ...updates, updated_at: new Date().toISOString() });
};

export const deleteMeterAndAssociatedData = async (id: string) => {
    return db.transaction('rw', db.meters, db.readings, db.notifications, db.topups, async () => {
        await db.readings.where('meter_id').equals(id).delete();
        await db.topups.where('meter_id').equals(id).delete();
        await db.notifications.where('meter_id').equals(id).delete();
        await db.meters.delete(id);
    });
}

export const addReading = async (readingData: Omit<ReadingEntity, 'id' | 'created_at' | 'delta_consumption'>): Promise<string> => {
    return await db.transaction('rw', db.meters, db.readings, async (tx) => {
        const meter = await tx.table('meters').get(readingData.meter_id);
        if (!meter) throw new Error("Compteur non trouvé.");

        const newId = uuidv4();
        let delta = 0;

        if (meter.type === 'SUB_METER') {
            // Logique de consommation pour un sous-compteur
            const lastReading = await tx.table('readings').where({ meter_id: readingData.meter_id }).last();
            const previousIndex = lastReading ? lastReading.index_value : meter.initial_index;
            if (readingData.index_value < previousIndex && !readingData.is_rollover) {
                throw new Error("L'index du nouveau relevé ne peut être inférieur au précédent.");
            }
            delta = readingData.index_value - previousIndex;

            // 1. Déduire la consommation du solde du locataire
            const newBalance = meter.current_cached_balance - delta;
            await tx.table('meters').update(meter.id, { 
                current_cached_index: readingData.index_value, 
                current_cached_balance: newBalance,
                updated_at: new Date().toISOString()
            });

            // 2. Déduire la consommation de la réserve globale
            const globalMeter = await tx.table('meters').where({ type: 'GLOBAL' }).first();
            if (globalMeter) {
                const newGlobalReserve = (globalMeter.current_cached_balance || 0) - delta;
                await tx.table('meters').update(globalMeter.id, {
                    current_cached_balance: newGlobalReserve,
                    updated_at: new Date().toISOString()
                });
            }
        } else { // GLOBAL_METER - Logique de Réconciliation de la Réserve
            // Pour le compteur global, la valeur saisie n'est pas un index mais la *réserve réelle* constatée.
            const previousReserve = meter.current_cached_balance;
            const actualReserve = readingData.index_value; // La valeur saisie EST la réserve réelle
            
            // Le delta représente la consommation du propriétaire / des communs / les pertes.
            delta = previousReserve - actualReserve; 
            
            // On enregistre un relevé pour historiser cette "consommation du propriétaire"
            // La valeur d'index de ce relevé est la réserve réelle pour traçabilité.

            // On calibre la réserve de l'application sur la valeur réelle constatée.
            await tx.table('meters').update(meter.id, {
                current_cached_balance: actualReserve, 
                updated_at: new Date().toISOString()
            });
        }
        
        const newReading: ReadingEntity = {
            ...readingData,
            id: newId,
            delta_consumption: delta, // Pour un relevé global, c'est la consommation non-attribuée
            created_at: new Date().toISOString()
        }
        
        await tx.table('readings').add(newReading);
        
        return newId;
    });
}

export const addTopup = async (topupData: Omit<TopupEntity, 'id' | 'created_at'>): Promise<string> => {
    return db.transaction('rw', db.meters, db.topups, async (tx) => {
        const meter = await tx.table('meters').get(topupData.meter_id);
        if (!meter) throw new Error("Compteur non trouvé.");

        const newId = uuidv4();
        const newTopup: TopupEntity = {
            ...topupData,
            id: newId,
            created_at: new Date().toISOString()
        };

        await tx.table('topups').add(newTopup);

        const newBalance = meter.current_cached_balance + newTopup.amount_units;
        await tx.table('meters').update(meter.id, { 
            current_cached_balance: newBalance,
            updated_at: new Date().toISOString()
        });

        // Si c'est un sous-compteur, on crédite aussi la réserve globale.
        if (meter.type === 'SUB_METER') {
            const globalMeter = await tx.table('meters').where({ type: 'GLOBAL' }).first();
            if (globalMeter) {
                const newGlobalReserve = (globalMeter.current_cached_balance || 0) + newTopup.amount_units;
                await tx.table('meters').update(globalMeter.id, {
                    current_cached_balance: newGlobalReserve,
                    updated_at: new Date().toISOString()
                });
            }
        }

        return newId;
    });
};

export const deleteReading = async (readingId: string): Promise<void> => {
    return await db.transaction('rw', db.meters, db.readings, async (tx) => {
        const readingToDelete = await tx.table('readings').get(readingId);
        if (!readingToDelete) return;

        const meter = await tx.table('meters').get(readingToDelete.meter_id);
        if (!meter) return;

        const deltaToRestore = readingToDelete.delta_consumption;
        await tx.table('readings').delete(readingId);

        if (meter.type === 'SUB_METER') {
            // Annulation d'un relevé de consommation de locataire
            const latestReading = await tx.table('readings').where({ meter_id: meter.id }).last();
            const newIndex = latestReading ? latestReading.index_value : meter.initial_index;
            
            // 1. Restaurer le solde du locataire
            const newBalance = meter.current_cached_balance + deltaToRestore;
            await tx.table('meters').update(meter.id, {
                current_cached_balance: newBalance,
                current_cached_index: newIndex,
                updated_at: new Date().toISOString()
            });

            // 2. Restaurer la réserve globale
            const globalMeter = await tx.table('meters').where({ type: 'GLOBAL' }).first();
            if (globalMeter) {
                const newGlobalReserve = (globalMeter.current_cached_balance || 0) + deltaToRestore;
                await tx.table('meters').update(globalMeter.id, {
                    current_cached_balance: newGlobalReserve,
                    updated_at: new Date().toISOString()
                });
            }
        } else { // GLOBAL_METER - Annulation d'une réconciliation
            // On restaure la réserve telle qu'elle était avant la correction.
            const restoredReserve = meter.current_cached_balance + deltaToRestore;
            await tx.table('meters').update(meter.id, {
                current_cached_balance: restoredReserve,
                updated_at: new Date().toISOString()
            });
        }
    });
};

export const deleteTopup = async (topupId: string): Promise<void> => {
    return db.transaction('rw', db.meters, db.topups, async (tx) => {
        const topupToDelete = await tx.table('topups').get(topupId);
        if (!topupToDelete) return;

        const meter = await tx.table('meters').get(topupToDelete.meter_id);
        if (!meter) return;

        await tx.table('topups').delete(topupId);

        const newBalance = meter.current_cached_balance - topupToDelete.amount_units;
        await tx.table('meters').update(meter.id, {
            current_cached_balance: newBalance,
            updated_at: new Date().toISOString()
        });

        // Si c'était un sous-compteur, on annule aussi le crédit sur la réserve globale.
        if (meter.type === 'SUB_METER') {
            const globalMeter = await tx.table('meters').where({ type: 'GLOBAL' }).first();
            if (globalMeter) {
                const newGlobalReserve = (globalMeter.current_cached_balance || 0) - topupToDelete.amount_units;
                await tx.table('meters').update(globalMeter.id, {
                    current_cached_balance: newGlobalReserve,
                    updated_at: new Date().toISOString()
                });
            }
        }
    });
};

// --- Fonctions pour les Paramètres ---

/**
 * Récupère un paramètre spécifique depuis la base de données.
 * @param key La clé du paramètre (ex: 'language')
 * @returns La valeur du paramètre parsée, ou null s'il n'existe pas.
 */
export const getSetting = async <T>(key: string): Promise<T | null> => {
  const setting = await db.app_settings.get(key);
  if (setting) {
    try {
      return JSON.parse(setting.value_json) as T;
    } catch (error) {
      console.error(`Erreur lors du parsing du paramètre '${key}':`, error);
      return null;
    }
  }
  return null;
};

/**
 * Enregistre ou met à jour un paramètre dans la base de données.
 * @param key La clé du paramètre.
 * @param value La valeur à enregistrer (sera sérialisée en JSON).
 */
export const saveSetting = async <T>(key: string, value: T): Promise<void> => {
  const setting: AppSettingEntity = {
    key,
    value_json: JSON.stringify(value),
    updated_at: new Date().toISOString(),
  };
  await db.app_settings.put(setting);
};


// --- Fonctions de Portabilité ---

export const exportData = async (): Promise<string> => {
    const allMeters = await db.meters.toArray();
    const allReadings = await db.readings.toArray();
    const allTopups = await db.topups.toArray();
    const allSettings = await db.app_settings.toArray();

    const data = {
        meters: allMeters,
        readings: allReadings,
        topups: allTopups,
        app_settings: allSettings,
        export_format_version: '1.0',
        exported_at: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
}

export const importData = async (jsonData: string): Promise<void> => {
    const data = JSON.parse(jsonData);

    if (!data.meters || !data.readings) {
        throw new Error("Fichier de sauvegarde invalide ou corrompu (champs manquants).");
    }

    await db.transaction('rw', db.meters, db.readings, db.topups, db.app_settings, async () => {
        await db.meters.clear();
        await db.readings.clear();
        await db.topups.clear();
        await db.app_settings.clear();

        await db.meters.bulkAdd(data.meters);
        await db.readings.bulkAdd(data.readings);
        await db.topups.bulkAdd(data.topups || []);
        
        if (data.app_settings) {
            await db.app_settings.bulkAdd(data.app_settings);
        }
    });
}

export const resetDatabase = async (): Promise<void> => {
    await Promise.all([
        db.meters.clear(), 
        db.readings.clear(), 
        db.topups.clear(),
        db.app_settings.clear()
    ]);
}
