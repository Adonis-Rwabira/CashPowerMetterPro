import Dexie, { type Table } from 'dexie';

// -------------------------------------------------------------------------
// 1. DÉFINITION DES INTERFACES TYPÉES
// -------------------------------------------------------------------------

export type MeterType = 'GLOBAL' | 'SUB_METER';
export type UnitType = 'kWh' | 'm3' | 'CUSTOM';
export type MeterStatus = 'ACTIVE' | 'ARCHIVED';
export type NotificationType = 'warning' | 'critical' | 'info';

/**
 * Représente un compteur, qu'il soit global (maître) ou un sous-compteur (divisionnaire).
 */
export interface MeterEntity {
  id: string; // UUID v4
  type: MeterType;
  label: string; // Libellé/Nom (ex: "Appt 101", "Compteur Principal")
  module_number: string; // Identifiant physique unique (ex: "A01") ou "GLOBAL"
  unit_type: UnitType;
  
  // Pour GLOBAL: L'index initial est TOUJOURS 0. C'est un odomètre virtuel de la consommation totale.
  // Pour SUB_METER: C'est l'index de départ physique du compteur du locataire.
  initial_index: number; // Index de départ (x1000)
  
  // Pour GLOBAL: L'index actuel est la SOMME de toutes les consommations des sous-compteurs.
  // Pour SUB_METER: C'est le dernier index physique relevé.
  current_cached_index: number; // Dernier index connu pour calculs rapides (x1000)
  
  // Pour GLOBAL: C'est la Réserve Collective d'Énergie, le stock principal.
  // Pour SUB_METER: C'est le Solde net personnel du locataire (Payé - Consommé).
  current_cached_balance: number; // (x1000)
  
  status: MeterStatus;
  theme_color: string; // Code Hex pour l'UI
  created_at: string; // ISO-8601 UTC
  updated_at: string; // ISO-8601 UTC
}

/**
 * Enregistre un relevé d'index de consommation à un instant T.
 */
export interface ReadingEntity {
  id: string; // UUID v4
  meter_id: string; // FK -> MeterEntity.id
  index_value: number; // Valeur lue sur le compteur (x1000)
  delta_consumption: number; // Consommation depuis le dernier relevé (x1000)
  recorded_at: string; // Date/Heure du relevé (ISO-8601 UTC)
  created_at: string; // Date d'insertion système (ISO-8601 UTC)
  notes?: string; // Notes optionnelles sur le relevé
  is_rollover?: boolean; // True si le compteur a passé 99999 -> 00000
}

/**
 * Enregistre une recharge de crédit pour un sous-compteur ou pour la réserve globale.
 */
export interface TopupEntity {
  id: string; // UUID v4
  meter_id: string; // FK -> MeterEntity.id
  amount_units: number; // Quantité d'unités créditées (x1000)
  recorded_at: string; // Date de l'opération (ISO-8601 UTC)
  created_at: string; // Date d'insertion système (ISO-8601 UTC)
}

export interface NotificationEntity {
    id: string; // UUID v4
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string; // ISO-8601 UTC
    is_read: 0 | 1; // 0 for false, 1 for true
    meter_id?: string;
}

export interface AuditLogEntity {
  id: string; // UUID v4
  event_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'ROLLBACK';
  entity_type: 'METERS' | 'READINGS' | 'TOPUPS';
  entity_id: string;
  payload_json: string; // Snapshot de l'entité pour restauration
  created_at: string; // ISO-8601 UTC
}

export interface AppSettingEntity {
    key: string;
    value_json: string;
    updated_at: string;
}

// -------------------------------------------------------------------------
// 2. DÉCLARATION DU DATABASE STORE DEXIE
// -------------------------------------------------------------------------

export class MeterMasterDatabase extends Dexie {
  meters!: Table<MeterEntity, string>;
  readings!: Table<ReadingEntity, string>;
  topups!: Table<TopupEntity, string>;
  notifications!: Table<NotificationEntity, string>;
  audit_logs!: Table<AuditLogEntity, string>;
  app_settings!: Table<AppSettingEntity, string>;

  constructor() {
    super('MeterMasterDB');

    // Version 1 du Schéma
    this.version(1).stores({
      meters: 'id, type, module_number',
      readings: 'id, meter_id, recorded_at',
      topups: 'id, meter_id, recorded_at',
      notifications: 'id, is_read, timestamp',
      audit_logs: 'id, event_type, created_at',
      app_settings: 'key',
    });
  }
}

// Instance singleton exportée pour un accès global et sécurisé
export const db = new MeterMasterDatabase();
