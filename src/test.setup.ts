import 'fake-indexeddb/auto';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Exécute un nettoyage après chaque test (par exemple, démonte les composants React)
afterEach(() => {
  cleanup();
});
