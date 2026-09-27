import { t } from 'i18next';
import { toast } from 'react-hot-toast';

/**
 * Affiche un toast personnalisé avec un bouton "Annuler".
 * Conforme à la spécification F-READ-003.
 * 
 * @param message Le message à afficher dans le toast.
 * @param onUndo La fonction à exécuter lorsque l'utilisateur clique sur "Annuler".
 */
export const showUndoToast = (message: string, onUndo: () => void) => {
  
  toast.custom(
    (ts) => (
      <div
        className={`
          bg-gray-800 text-white p-4 pr-10 rounded-lg shadow-2xl 
          flex items-center justify-between gap-4 
          transition-all duration-300 transform 
          ${ts.visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        `}
      >
        <span>{message}</span>
        <button
          onClick={() => {
            onUndo();
            toast.dismiss(ts.id);
          }}
          className="ml-4 px-3 py-1 rounded-md font-bold text-sm bg-yellow-500 text-black hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-600"
        >
          {t('undoToast.cancel')}
        </button>
      </div>
    ),
    {
      id: 'undo-toast',
      duration: 8000,
      position: 'bottom-center',
    }
  );
};
