# Sito Giovanni Zito — pubblicazione Netlify

Questo progetto comprende il sito pubblico, /admin e le Netlify Functions.

## Pubblicazione corretta (necessaria per il pannello admin)
1. Crea un repository PRIVATO su GitHub e carica tutti i file di questa cartella nella radice del repository. Non caricare soltanto index.html.
2. In Netlify: Add new project > Import an existing project > GitHub > seleziona il repository.
3. Impostazioni build: lascia vuoto il build command; publish directory: `.`; functions directory: `netlify/functions` (configurate anche in netlify.toml).
4. Configura le variabili in Netlify > Project configuration > Environment variables:
   - ADMIN_EMAIL: indirizzo email scelto per l'admin
   - ADMIN_PASSWORD: password forte, unica
   - SESSION_SECRET: stringa casuale lunga almeno 40 caratteri
   - NETLIFY_API_TOKEN: token personale Netlify, necessario per visualizzare/eliminare i messaggi nel pannello
5. Esegui un nuovo deploy dopo aver impostato le variabili.
6. Apri https://NOME-SITO.netlify.app/admin/ e accedi.

Il dominio `*.netlify.app` è gratuito. Il sito pubblico è in `/`.

ATTENZIONE: il semplice drag-and-drop di una cartella/ZIP statico non configura correttamente le funzioni server del progetto. L'admin non è operativo finché il deploy e le variabili non sono configurati. Non inserire password o token nei file HTML o nel repository.

Il file index.html incluso nello ZIP originale è stato conservato perché contiene già l'integrazione `/api/guides` necessaria per mostrare le guide aggiunte dall'admin. Il file HTML separato ricevuto è sostanzialmente identico, ma non include quell'integrazione.
