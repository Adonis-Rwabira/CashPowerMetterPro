import { describe, it, expect } from 'vitest';
import { Arithmetics } from './arithmetics';
import type { ReadingEntity, TopupEntity } from '../db/database';

describe('Arithmetics Engine', () => {

  // --- Test de conversion et formatage ---
  it('should convert numbers to scaled integers (x1000)', () => {
    expect(Arithmetics.toScaled(14.52)).toBe(14520);
    expect(Arithmetics.toScaled(0.123)).toBe(123);
  });

  it('should convert scaled integers back to numbers', () => {
    expect(Arithmetics.fromScaled(14520)).toBe(14.52);
    expect(Arithmetics.fromScaled(123)).toBe(0.123);
  });

  it('should format scaled integers to a 3-decimal LCD string', () => {
    expect(Arithmetics.formatLCD(14520)).toBe('14.520');
    expect(Arithmetics.formatLCD(123)).toBe('0.123');
  });

  // --- Tests de la logique métier --- 

  describe('calculateBalance (pour un compteur individuel)', () => {
    it('doit calculer correctement le solde positif', () => {
        const totalRecharged = Arithmetics.toScaled(50);
        const initialIndex = Arithmetics.toScaled(100);
        const latestIndex = Arithmetics.toScaled(120);
        expect(Arithmetics.calculateBalance(initialIndex, latestIndex, totalRecharged)).toBe(Arithmetics.toScaled(30));
    });

    it('doit gérer un solde négatif (dette)', () => {
        const totalRecharged = Arithmetics.toScaled(10);
        const initialIndex = Arithmetics.toScaled(100);
        const latestIndex = Arithmetics.toScaled(125);
        expect(Arithmetics.calculateBalance(initialIndex, latestIndex, totalRecharged)).toBe(Arithmetics.toScaled(-15));
    });
  });

  describe('calculateEnergyLoss (logique obsolète)', () => {
    it('doit calculer la perte d\'énergie correctement', () => {
        const globalConso = Arithmetics.toScaled(100);
        const sumSubConso = Arithmetics.toScaled(97);
        const { loss, percent } = Arithmetics.calculateEnergyLoss(globalConso, sumSubConso);
        expect(loss).toBe(Arithmetics.toScaled(3));
        expect(percent).toBeCloseTo(3);
    });

    it('doit gérer une perte nulle', () => {
        const { loss, percent } = Arithmetics.calculateEnergyLoss(100000, 100000);
        expect(loss).toBe(0);
        expect(percent).toBe(0);
    });
  });

  describe('calculateFinancialBalance (logique principale)', () => {
    const dummyReadingProps = { id:'', meter_id:'', recorded_at:'', index_value: 0, is_rollover: false, created_at:''};
    const dummyTopupProps = { id:'', meter_id:'', recorded_at:'', sync_with_global: false, created_at:''};

    it('doit calculer le bilan financier quand les locataires sont en dette', () => {
        const readings: ReadingEntity[] = [
            { ...dummyReadingProps, delta_consumption: 50000 },
            { ...dummyReadingProps, delta_consumption: 30000 },
        ];
        const topups: TopupEntity[] = [
            { ...dummyTopupProps, amount_units: 60000 },
        ];
        const balance = Arithmetics.calculateFinancialBalance(readings, topups);
        expect(balance.totalConsumedUnits).toBe(80000);
        expect(balance.totalPaidUnits).toBe(60000);
        expect(balance.financialBalance).toBe(20000); // Dette de 20 unités
    });

    it('doit calculer le bilan financier quand les locataires sont en avance', () => {
        const readings: ReadingEntity[] = [
            { ...dummyReadingProps, delta_consumption: 50000 },
        ];
        const topups: TopupEntity[] = [
            { ...dummyTopupProps, amount_units: 60000 },
            { ...dummyTopupProps, amount_units: 10000 },
        ];
        const balance = Arithmetics.calculateFinancialBalance(readings, topups);
        expect(balance.totalConsumedUnits).toBe(50000);
        expect(balance.totalPaidUnits).toBe(70000);
        expect(balance.financialBalance).toBe(-20000); // Avance de 20 unités
    });

    it('doit retourner un bilan nul si aucune transaction n\'existe', () => {
        const balance = Arithmetics.calculateFinancialBalance([], []);
        expect(balance.totalConsumedUnits).toBe(0);
        expect(balance.totalPaidUnits).toBe(0);
        expect(balance.financialBalance).toBe(0);
    });
  });

});
