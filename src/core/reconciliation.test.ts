import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFinancialHistory } from './reconciliation';
import { db } from '../db/database';
import type { ReadingEntity, TopupEntity, MeterEntity } from '../db/database';

// Mock de la base de données
vi.mock('../db/database', () => ({
  db: {
    readings: { toArray: vi.fn() },
    topups: { toArray: vi.fn() },
    meters: { where: vi.fn().mockReturnThis(), equals: vi.fn().mockReturnThis(), toArray: vi.fn() },
  },
}));

describe('Moteur d\'Agrégation Temporelle', () => {

  beforeEach(() => {
    vi.mocked(db.readings.toArray).mockClear();
    vi.mocked(db.topups.toArray).mockClear();
    vi.mocked(db.meters.toArray).mockClear();
  });

  describe('getFinancialHistory', () => {

    const mockSubMeters: MeterEntity[] = [
      { id: 'sub-1', type: 'SUB_METER', label: 'Sub 1', module_number: '1', unit_type: 'kWh', initial_index: 0, current_cached_index:0, current_cached_balance:0, status:'ACTIVE', theme_color:'', created_at:'', updated_at:'' },
      { id: 'sub-2', type: 'SUB_METER', label: 'Sub 2', module_number: '2', unit_type: 'kWh', initial_index: 0, current_cached_index:0, current_cached_balance:0, status:'ACTIVE', theme_color:'', created_at:'', updated_at:'' },
    ];

    it('doit calculer correctement l\'historique cumulé sur plusieurs jours', async () => {
      // Arrange
      const mockReadings: ReadingEntity[] = [
        { id: 'r1', meter_id: 'sub-1', recorded_at: '2024-01-01T10:00:00Z', delta_consumption: 10000, index_value: 10000, is_rollover: false, created_at: '' }, // Conso: 10
        { id: 'r2', meter_id: 'sub-2', recorded_at: '2024-01-02T10:00:00Z', delta_consumption: 5000, index_value: 5000, is_rollover: false, created_at: '' }, // Conso: 5
        { id: 'r3', meter_id: 'sub-1', recorded_at: '2024-01-02T11:00:00Z', delta_consumption: 2000, index_value: 12000, is_rollover: false, created_at: '' }, // Conso: 2
      ];
      const mockTopups: TopupEntity[] = [
        { id: 't1', meter_id: 'sub-1', recorded_at: '2024-01-01T12:00:00Z', amount_units: 15000, created_at: '' }, // Recharge: 15
        { id: 't2', meter_id: 'sub-2', recorded_at: '2024-01-03T14:00:00Z', amount_units: 10000, created_at: '' }, // Recharge: 10
      ];

      vi.mocked(db.meters.toArray).mockResolvedValue(mockSubMeters);
      vi.mocked(db.readings.toArray).mockResolvedValue(mockReadings);
      vi.mocked(db.topups.toArray).mockResolvedValue(mockTopups);

      // Act
      const history = await getFinancialHistory(30);

      // Assert
      expect(history).toHaveLength(3);
      
      // Jour 1
      expect(history[0].date).toBe('2024-01-01');
      expect(history[0].cumulativeConsumed).toBe(10000);
      expect(history[0].cumulativePaid).toBe(15000);
      expect(history[0].balance).toBe(-5000); // Avance

      // Jour 2 (cumulé)
      expect(history[1].date).toBe('2024-01-02');
      expect(history[1].cumulativeConsumed).toBe(10000 + 5000 + 2000); // 17000
      expect(history[1].cumulativePaid).toBe(15000); // Pas de recharge ce jour
      expect(history[1].balance).toBe(2000); // Dette

      // Jour 3 (cumulé)
      expect(history[2].date).toBe('2024-01-03');
      expect(history[2].cumulativeConsumed).toBe(17000);
      expect(history[2].cumulativePaid).toBe(15000 + 10000); // 25000
      expect(history[2].balance).toBe(-8000); // Avance
    });

    it('doit retourner un tableau vide si aucune donnée n\'existe', async () => {
      vi.mocked(db.meters.toArray).mockResolvedValue(mockSubMeters);
      vi.mocked(db.readings.toArray).mockResolvedValue([]);
      vi.mocked(db.topups.toArray).mockResolvedValue([]);
      const history = await getFinancialHistory();
      expect(history).toEqual([]);
    });

    it('doit respecter la limite de jours demandée', async () => {
        const readings = [
            { id: 'r1', meter_id: 'sub-1', recorded_at: '2024-03-10T10:00:00Z', delta_consumption: 1000, index_value: 1000, is_rollover: false, created_at: '' },
            { id: 'r2', meter_id: 'sub-1', recorded_at: '2024-03-11T10:00:00Z', delta_consumption: 1000, index_value: 2000, is_rollover: false, created_at: '' },
            { id: 'r3', meter_id: 'sub-1', recorded_at: '2024-03-12T10:00:00Z', delta_consumption: 1000, index_value: 3000, is_rollover: false, created_at: '' },
        ];
        vi.mocked(db.meters.toArray).mockResolvedValue(mockSubMeters);
        vi.mocked(db.readings.toArray).mockResolvedValue(readings);
        vi.mocked(db.topups.toArray).mockResolvedValue([]);

        const history = await getFinancialHistory(2); // Demande les 2 derniers jours

        expect(history).toHaveLength(2);
        expect(history[0].date).toBe('2024-03-11');
        expect(history[1].date).toBe('2024-03-12');
    });
  });
});
