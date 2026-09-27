import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from './database';
import { createMeter, addReading, addTopup, getHistoryEvents, getMeterById, deleteReading, deleteTopup } from './repositories';
import Dexie from 'dexie';

// Mock de la base de données en mémoire pour l'isolation des tests
// On utilise une instance séparée de Dexie qui pointe vers une DB en mémoire.
describe('Repositories Business Logic', () => {

  // Cette configuration est essentielle pour que les tests soient indépendants et ne partagent pas d'état.
  beforeEach(async () => {
    // On reconfigure la bd 'db' pour utiliser une version en mémoire avant chaque test.
    // C'est une technique de mock pour Dexie.
    const inMemoryDb = new Dexie('TestDB');
    inMemoryDb.version(1).stores({
        meters: 'id, type, module_number',
        readings: 'id, meter_id, recorded_at',
        topups: 'id, meter_id, recorded_at',
        notifications: 'id, is_read, timestamp',
        audit_logs: 'id, event_type, created_at',
        app_settings: 'key',
    });
    // @ts-expect-error - Astuce pour rediriger l'instance db exportée vers notre DB de test.
    db.close(); db.backendDB = () => inMemoryDb;
    await db.open();
  });

  afterEach(async () => {
    await db.delete(); // Supprime la base de données en mémoire
    await db.close();
  });

  const commonMeterData = {
    unit_type: 'kWh' as const,
    status: 'ACTIVE' as const,
    theme_color: '#00E5FF',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('should add a reading and correctly update balances of sub-meter and global meter', async () => {
    const globalMeterId = await createMeter({ ...commonMeterData, type: 'GLOBAL', label: 'Global', module_number: 'GLOBAL', initial_index: 0, current_cached_index: 0, current_cached_balance: 1000 * 1000 });
    const subMeterId = await createMeter({ ...commonMeterData, type: 'SUB_METER', label: 'Sub', module_number: 'A01', initial_index: 50 * 1000, current_cached_index: 50 * 1000, current_cached_balance: 100 * 1000 });

    await addReading({ meter_id: subMeterId, index_value: 65 * 1000, recorded_at: new Date().toISOString() });

    const updatedSubMeter = await getMeterById(subMeterId);
    const updatedGlobalMeter = await getMeterById(globalMeterId);

    // Delta de consommation est de 15 kWh (65 - 50).
    // Le solde du sous-compteur doit diminuer de 15 (100 -> 85).
    expect(updatedSubMeter?.current_cached_balance).toBe(85 * 1000);
    expect(updatedSubMeter?.current_cached_index).toBe(65 * 1000);

    // La réserve globale doit aussi diminuer de 15 (1000 -> 985).
    expect(updatedGlobalMeter?.current_cached_balance).toBe(985 * 1000);
  });

  it('should add a topup and correctly update balances of sub-meter and global meter', async () => {
    const globalMeterId = await createMeter({ ...commonMeterData, type: 'GLOBAL', label: 'Global', module_number: 'GLOBAL', initial_index: 0, current_cached_index: 0, current_cached_balance: 1000 * 1000 });
    const subMeterId = await createMeter({ ...commonMeterData, type: 'SUB_METER', label: 'Sub', module_number: 'A01', initial_index: 50 * 1000, current_cached_index: 50 * 1000, current_cached_balance: 100 * 1000 });

    await addTopup({ meter_id: subMeterId, amount_units: 50 * 1000, recorded_at: new Date().toISOString() });

    const updatedSubMeter = await getMeterById(subMeterId);
    const updatedGlobalMeter = await getMeterById(globalMeterId);

    // Le solde du sous-compteur doit augmenter de 50 (100 -> 150).
    expect(updatedSubMeter?.current_cached_balance).toBe(150 * 1000);

    // La réserve globale doit aussi augmenter de 50 (1000 -> 1050).
    expect(updatedGlobalMeter?.current_cached_balance).toBe(1050 * 1000);
  });
  
  it('should correctly revert balances after deleting a reading', async () => {
    const globalMeterId = await createMeter({ ...commonMeterData, type: 'GLOBAL', label: 'Global', module_number: 'GLOBAL', initial_index: 0, current_cached_index: 0, current_cached_balance: 1000 * 1000 });
    const subMeterId = await createMeter({ ...commonMeterData, type: 'SUB_METER', label: 'Sub', module_number: 'A01', initial_index: 50000, current_cached_index: 65000, current_cached_balance: 85000, status: 'ACTIVE' });
    
    const readingId = 'test-reading-id';
    await db.readings.add({ id: readingId, meter_id: subMeterId, index_value: 65000, delta_consumption: 15000, recorded_at: new Date().toISOString(), created_at: new Date().toISOString() });

    // On simule la déduction de la réserve globale qui aurait eu lieu lors du relevé
    await db.meters.update(globalMeterId, { current_cached_balance: (1000 * 1000) - 15000 });

    await deleteReading(readingId);

    const updatedSubMeter = await getMeterById(subMeterId);
    const updatedGlobalMeter = await getMeterById(globalMeterId);

    // Le solde du sous-compteur doit être restauré (85 + 15 = 100).
    expect(updatedSubMeter?.current_cached_balance).toBe(100000);

    // La réserve globale doit aussi être restaurée à sa valeur d'origine.
    expect(updatedGlobalMeter?.current_cached_balance).toBe(1000 * 1000);
  });

  it('should correctly revert balances after deleting a topup', async () => {
    const globalMeterId = await createMeter({ ...commonMeterData, type: 'GLOBAL', label: 'Global', module_number: 'GLOBAL', initial_index: 0, current_cached_index: 0, current_cached_balance: 1050 * 1000 });
    const subMeterId = await createMeter({ ...commonMeterData, type: 'SUB_METER', label: 'Sub', module_number: 'A01', initial_index: 50000, current_cached_index: 50000, current_cached_balance: 150000 });
    
    const topupId = 'test-topup-id';
    await db.topups.add({ id: topupId, meter_id: subMeterId, amount_units: 50000, recorded_at: new Date().toISOString(), created_at: new Date().toISOString() });

    await deleteTopup(topupId);

    const updatedSubMeter = await getMeterById(subMeterId);
    const updatedGlobalMeter = await getMeterById(globalMeterId);

    // Le solde du sous-compteur doit revenir à son état initial (150 - 50 = 100).
    expect(updatedSubMeter?.current_cached_balance).toBe(100000);
    
    // La réserve globale doit aussi revenir à son état initial (1050 - 50 = 1000).
    expect(updatedGlobalMeter?.current_cached_balance).toBe(1000 * 1000);
  });

  it('should return a merged and sorted history of readings and topups', async () => {
    const subMeterId = await createMeter({ ...commonMeterData, type: 'SUB_METER', label: 'Sub', module_number: 'A01', initial_index: 0, current_cached_index: 0, current_cached_balance: 0 });

    // Ajout d'événements dans un ordre non chronologique pour tester le tri
    await addTopup({ meter_id: subMeterId, amount_units: 100000, recorded_at: '2023-01-01T10:00:00Z' });
    await addReading({ meter_id: subMeterId, index_value: 10000, recorded_at: '2023-01-02T12:00:00Z' });
    await addTopup({ meter_id: subMeterId, amount_units: 50000, recorded_at: '2023-01-03T14:00:00Z' });
    await addReading({ meter_id: subMeterId, index_value: 25000, recorded_at: '2023-01-04T16:00:00Z' });

    const history = await getHistoryEvents(subMeterId);

    expect(history).toHaveLength(4);
    expect(history[0].eventType).toBe('reading');
    expect(history[0].recorded_at).toBe('2023-01-04T16:00:00Z');
    expect(history[3].eventType).toBe('topup');
    expect(history[3].recorded_at).toBe('2023-01-01T10:00:00Z');
  });
});
