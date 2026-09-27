import { getConsumptionForPeriod } from './aggregation';
import { Arithmetics } from './arithmetics';

const ROLLING_AVERAGE_DAYS = 30; // Période pour calculer la moyenne glissante

/**
 * Calcule la consommation journalière moyenne d'un compteur.
 * @param meterId L'ID du compteur.
 * @returns La consommation moyenne en unités scalées (x1000).
 */
export const getDailyAverageConsumption = async (meterId: string): Promise<number> => {
  const totalConsumption = await getConsumptionForPeriod(meterId, ROLLING_AVERAGE_DAYS);

  if (totalConsumption <= 0) {
    return 0;
  }

  return totalConsumption / ROLLING_AVERAGE_DAYS;
};

/**
 * Estime le nombre de jours d'autonomie restants pour un compteur.
 * @param meterId L'ID du compteur.
 * @param currentBalanceScaled Le solde actuel du compteur en unités scalées.
 * @returns Le nombre de jours restants. Retourne Infinity si la consommation est nulle.
 */
export const getEstimatedDaysRemaining = async (meterId: string, currentBalanceScaled: number): Promise<number> => {
  if (currentBalanceScaled <= 0) {
    return 0;
  }

  const dailyAverage = await getDailyAverageConsumption(meterId);

  if (dailyAverage <= 0) {
    return Infinity; // Consommation nulle, donc autonomie infinie
  }
  
  const balance = Arithmetics.fromScaled(currentBalanceScaled);
  const average = Arithmetics.fromScaled(dailyAverage);

  return balance / average;
};
