import { db } from '../db/database';

/**
 * Calcule la consommation totale d'un compteur sur une période donnée en jours.
 * @param meterId L'ID du compteur.
 * @param days La période en jours (ex: 30 jours).
 * @returns La consommation totale en unités scalées (x1000).
 */
export const getConsumptionForPeriod = async (meterId: string, days: number): Promise<number> => {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const readings = await db.readings
    .where('meter_id').equals(meterId)
    .and(reading => new Date(reading.recorded_at) >= startDate)
    .sortBy('recorded_at');

  if (readings.length < 2) {
    return 0; // Pas assez de données pour calculer une consommation
  }

  const firstReading = readings[0];
  const lastReading = readings[readings.length - 1];

  // La consommation est simplement la différence entre le dernier et le premier index de la période
  const totalConsumption = lastReading.index_value - firstReading.index_value;

  return totalConsumption;
};
