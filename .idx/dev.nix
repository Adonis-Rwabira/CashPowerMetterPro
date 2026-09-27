{ pkgs, ... }: {
  # Environnement de développement pour une application React (Vite)
  channel = "unstable"; # Utilise une version stable de Nix
  packages = [
    pkgs.nodejs_25
  ];

  # Configuration de l'aperçu du projet dans IDX
  idx = {
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT"];
          manager = "web";
          env = { PORT = "$PORT"; };
        };
      };
    };

    # Extensions VS Code recommandées pour ce type de projet
    extensions = [
      "dbaeumer.vscode-eslint" # Pour le linting du code JavaScript/React
      "esbenp.prettier-vscode" # Pour le formatage automatique du code
      "vscode.typescript-language-features" # Support de TypeScript
    ];

    workspace = {
      # Commandes à exécuter à la création de l'espace de travail
      onCreate = {
        # Crée une application React avec Vite dans le dossier courant et installe les dépendances
        init = "npm install";
      };

      # Actions à effectuer au démarrage de l'espace de travail
      onStart = {
        # Ouvre les fichiers pertinents pour le développement au démarrage
        defaut.openFiles = [ "src/App.tsx" "package.json" "README.md" ];
      };
    };
  };
}
