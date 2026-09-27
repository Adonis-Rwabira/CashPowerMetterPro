
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getSetting, saveSetting as saveSettingToDb } from '../db/repositories';

// -------------------------------------------------------------------------
// 1. DÉFINITION DES TYPES DE PARAMÈTRES
// -------------------------------------------------------------------------

export type BaseTheme = 'light' | 'dark' | 'system';
export type AccentTheme = 'industrial' | 'neon' | 'retro' | 'lab' | 'contrast';
export type DialStyle = 'SKEUO_3D_REALISTIC' | 'FLAT_MODERN';
export type MeterFont = 'DIGITAL_7SEG' | 'TECH_MONO' | 'CLEAN_SANS';
export type Language = 'fr' | 'en' | 'sw';

export interface Settings {
  baseTheme: BaseTheme;
  accentTheme: AccentTheme;
  dialStyle: DialStyle;
  meterFont: MeterFont;
  language: Language;
}

interface SettingsContextType {
  settings: Settings;
  saveSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: Settings = {
    baseTheme: 'system',
    accentTheme: 'industrial',
    dialStyle: 'SKEUO_3D_REALISTIC',
    meterFont: 'DIGITAL_7SEG',
    language: 'fr',
};

// -------------------------------------------------------------------------
// 2. FOURNISSEUR DE CONTEXTE (PROVIDER)
// -------------------------------------------------------------------------

const THEME_STORAGE_KEY = 'app_theme';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    const loadInitialSettings = async () => {
      setIsLoading(true);

      const keys = Object.keys(defaultSettings) as Array<keyof Settings>;
      
      const settingsPromises = keys.map(key => 
        getSetting<Settings[typeof key]>(key).then(value => ({ key, value }))
      );
      const settledSettings = await Promise.all(settingsPromises);

      const settingsFromDb = settledSettings.reduce((acc, { key, value }) => {
        if (value !== null) {
          return { ...acc, [key]: value };
        }
        return acc;
      }, {} as Partial<Settings>);

      const loadedSettings = { ...defaultSettings, ...settingsFromDb };
      setSettings(loadedSettings);
      
      if (loadedSettings.language && i18n.language !== loadedSettings.language) {
        await i18n.changeLanguage(loadedSettings.language);
      }

      setIsLoading(false);
    };

    loadInitialSettings();
  }, [i18n]);

  const saveSetting = useCallback(async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prevSettings => ({ ...prevSettings, [key]: value }));

    await saveSettingToDb(key, value);

    if (key === 'language') {
      if (i18n.language !== value) {
        await i18n.changeLanguage(value as string);
      }
    }


    if (key === 'baseTheme') {
      localStorage.setItem(THEME_STORAGE_KEY, value);
    }
  }, [i18n]);

  const contextValue = {
    settings,
    saveSetting,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {!isLoading ? children : null}
    </SettingsContext.Provider>
  );
};

// -------------------------------------------------------------------------
// 3. HOOK PERSONNALISÉ POUR UTILISER LE CONTEXTE
// -------------------------------------------------------------------------

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings doit être utilisé à l'intérieur d'un SettingsProvider");
  }
  return context;
};
