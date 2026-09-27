import { ReadingEntity, TopupEntity } from '../db/database';

/**
 * Représente le bilan financier global de l'installation.
 */
export interface FinancialBalance {
    totalConsumedUnits: number; // Total des unités (ex: kWh) consommées par les locataires
    totalPaidUnits: number;     // Total des unités (ex: kWh) payées/rechargées par les locataires
    financialBalance: number;   // Bilan : > 0 = Dette des locataires, < 0 = Avance des locataires
}

/**
 * Moteur Arithmétique Déterministe en Nombres Scalés (x1000)
 * Ir Adonis Rwabira
 */
export class Arithmetics {

  // Convertit 14.520 -> 14520 milli-unités
  static toScaled(val: number): number {
    return Math.round(val * 1000);
  }

  // Convertit 14520 -> 14.520
  static fromScaled(milliVal: number): number {
    return milliVal / 1000;
  }

  // Formattage pour affichage LCD
  static formatLCD(milliVal: number): string {
    return (milliVal / 1000).toFixed(3);
  }

  // Calcul du solde restant pour UN compteur: Somme(Recharges) - Somme(Consommations)
  static calculateBalance(initialIndex: number, latestIndex: number, totalRecharged: number): number {
    const totalConso = Math.max(0, latestIndex - initialIndex);
    return totalRecharged - totalConso;
  }

  /**
   * Calcule le bilan de PERTE D'ÉNERGIE (obsolète car nécessite lecture du compteur global)
   */
  static calculateEnergyLoss(globalConso: number, sumSubConso: number): { loss: number; percent: number } {
    const loss = globalConso - sumSubConso;
    const percent = globalConso > 0 ? (loss / globalConso) * 100 : 0;
    return { loss, percent };
  }

  /**
   * Calcule le BILAN FINANCIER (Consommé vs. Payé) pour un ensemble de transactions.
   * @param readings - Toutes les lectures des sous-compteurs.
   * @param topups - Toutes les recharges des sous-compteurs.
   * @returns Un objet représentant le bilan financier.
   */
  static calculateFinancialBalance(readings: ReadingEntity[], topups: TopupEntity[]): FinancialBalance {
    const totalConsumedUnits = readings.reduce((sum, reading) => sum + reading.delta_consumption, 0);
    const totalPaidUnits = topups.reduce((sum, topup) => sum + topup.amount_units, 0);
    const financialBalance = totalConsumedUnits - totalPaidUnits;

    return {
        totalConsumedUnits,
        totalPaidUnits,
        financialBalance
    };
  }

  // Détermine le statut visuel basé sur le solde
  static getStatusFromBalance(balanceScaled: number): 'red' | 'amber' | 'green' {
    if (balanceScaled <= 0) return 'red';
    // Exemple: Seuil d'alerte à 10 unités restantes
    if (balanceScaled < 10 * 1000) return 'amber'; 
    return 'green';
  }

   /**
   * Calcule la consommation totale pour une période donnée à partir des relevés.
   * @param readings - Une liste d'entités de relevés.
   * @returns La consommation totale en unités scalées (milli-unités).
   */
  static calculateTotalConsumptionFromReadings(readings: ReadingEntity[]): number {
    if (readings.length < 2) {
      return 0;
    }
    const firstReading = readings[0];
    const lastReading = readings[readings.length - 1];
    return Math.max(0, lastReading.index_value - firstReading.index_value);
  }

  /**
   * Estime la puissance active basée sur les deux derniers relevés.
   * @param readings - Une liste d'entités de relevés (au moins deux).
   * @returns La puissance active estimée en kW.
   */
  static calculateActivePower(readings: ReadingEntity[]): number {
    if (readings.length < 2) {
      return 0;
    }
    const last = readings[readings.length - 1];
    const secondLast = readings[readings.length - 2];

    const consumptionDiff = this.fromScaled(last.index_value - secondLast.index_value);
    const timeDiffHours = (new Date(last.recorded_at).getTime() - new Date(secondLast.recorded_at).getTime()) / (1000 * 60 * 60);

    if (timeDiffHours === 0) {
      return 0;
    }

    const activePower = consumptionDiff / timeDiffHours;
    return activePower;
  }
}
