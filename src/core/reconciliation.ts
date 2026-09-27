import { db } from "../db/database";

/**
 * Moteur d'Agrégation Temporelle pour les Bilans Financiers.
 * Ce module prépare les données historiques pour les visualisations.
 * Ir Adonis Rwabira
 */

/**
 * Représente un point de données dans l'historique du bilan financier.
 */
export interface FinancialHistoryEntry {
    date: string;                   // Le jour (format YYYY-MM-DD)
    cumulativeConsumed: number;     // Consommation cumulée jusqu'à ce jour (scalée)
    cumulativePaid: number;         // Paiements cumulés jusqu'à ce jour (scalés)
    balance: number;                // Bilan financier à la fin de ce jour
}

/**
 * Génère un historique jour par jour du bilan financier (consommé vs. payé).
 * @param days - Le nombre de jours d'historique à retourner.
 * @returns Une promesse résolvant vers un tableau d'entrées d'historique financier.
 */
export async function getFinancialHistory(days = 30): Promise<FinancialHistoryEntry[]> {
    const allReadings = await db.readings.toArray();
    const allTopups = await db.topups.toArray();

    const subMeters = await db.meters.where('type').equals('SUB_METER').toArray();
    const subMeterIds = new Set(subMeters.map(m => m.id));

    // Regrouper toutes les transactions par jour
    const dailyTransactions: Record<string, { consumed: number, paid: number }> = {};

    allReadings.forEach(r => {
        if (!subMeterIds.has(r.meter_id)) return;
        const day = r.recorded_at.split('T')[0];
        if (!dailyTransactions[day]) dailyTransactions[day] = { consumed: 0, paid: 0 };
        dailyTransactions[day].consumed += r.delta_consumption;
    });

    allTopups.forEach(t => {
        if (!subMeterIds.has(t.meter_id)) return;
        const day = t.recorded_at.split('T')[0];
        if (!dailyTransactions[day]) dailyTransactions[day] = { consumed: 0, paid: 0 };
        dailyTransactions[day].paid += t.amount_units;
    });

    const sortedDays = Object.keys(dailyTransactions).sort();
    
    const history: FinancialHistoryEntry[] = [];
    let cumulativeConsumed = 0;
    let cumulativePaid = 0;

    for (const day of sortedDays) {
        const daily = dailyTransactions[day];
        cumulativeConsumed += daily.consumed;
        cumulativePaid += daily.paid;

        history.push({
            date: day,
            cumulativeConsumed,
            cumulativePaid,
            balance: cumulativeConsumed - cumulativePaid
        });
    }

    return history.slice(-days);
}
