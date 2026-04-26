# ETF Tracker - Plug & Play

**ETF Tracker** e un'applicazione web completa per la gestione, analisi e simulazione di portafogli ETF. Architettura plug-and-play con database SQLite integrato, autenticazione JWT, generazione PDF/PPTX e invio email.

## Funzionalita

- **Autenticazione** - Registrazione/Login con JWT, password hash PBKDF2
- **Onboarding** - Wizard 3 passi con salvataggio risposte nel database
- **Tour Guidato** - Introduzione interattiva 6 step
- **Dashboard** - KPI reali dal DB, grafici andamento, allocazione, tabella posizioni
- **Ricerca ETF** - Filtri multipli, confronto fino a 3 ETF
- **Analisi** - Backtest, matrice correlazione, metriche di rischio
- **Simulazioni** - PAC vs PIC con calcolo interattivo
- **Portafogli Modello** - 6 strategie classiche
- **Community** - Bacheca con post persistenti nel DB
- **Manuale/Academy** - Moduli e capitoli formativi
- **Alert** - Soglie prezzo con persistenza DB
- **Report PDF/PPTX** - Generazione automatica con download
- **Email** - Invio report PDF/PPTX via SMTP
- **Impostazioni** - Profilo, notifiche, preferenze

## Tecnologie

**Backend:**
- Python 3.11+ / Flask / Flask-CORS
- SQLite (file-based, zero-config)
- PBKDF2 password hashing
- JWT stateless tokens
- Email SMTP (Gmail/Outlook/etc.)
- PDF: WeasyPrint + ReportLab fallback
- PPTX: python-pptx

**Frontend:**
- Vanilla JavaScript SPA
- Chart.js 4.4.1
- CSS3 con variabili e media queries
- REST API con Bearer token

## Installazione (Plug & Play)

```bash
# 1. Clona
git clone https://github.com/tuo-username/etf-tracker.git
cd etf-tracker

# 2. Installa dipendenze
pip install -r requirements.txt

# 3. Avvia (zero configurazione!)
python app.py

# 4. Apri http://localhost:5000
```

## Configurazione Email (opzionale)

Per abilitare l'invio email con report PDF/PPTX:

```bash
# Esporta variabili d'ambiente
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=tua-email@gmail.com
export SMTP_PASS=tua-app-password
export FROM_EMAIL=tua-email@gmail.com
```

O crea un file `.env` nella stessa cartella:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tua-email@gmail.com
SMTP_PASS=tua-app-password
FROM_EMAIL=tua-email@gmail.com
```

## Deploy su Render

1. Crea un nuovo **Web Service** su Render
2. Collega il repository GitHub
3. Render rilevera automaticamente `render.yaml`:
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn app:app`
4. Aggiungi variabile d'ambiente `SECRET_KEY` (32+ caratteri casuali)
5. Aggiungi variabili SMTP opzionali per l'email

## Struttura del Progetto

```
etf-tracker/
|-- app.py                  # Flask backend + API REST + DB + Email + Reports
|-- requirements.txt        # Dipendenze Python
|-- Procfile               # Config Render
|-- render.yaml            # Blueprint Render
|-- .gitignore             # Esclusioni Git
|-- README.md              # Questo file
|-- reports/               # Report PDF/PPTX generati
|-- templates/
|   '-- index.html         # Template base con CSS critico inline
'-- static/
    |-- css/style.css      # Foglio di stile completo
    |-- js/data.js         # Dati statici (ETF, modelli, academy)
    |-- js/utils.js        # Utilita, formattazione, icone SVG
    |-- js/charts.js       # Wrapper Chart.js
    '-- js/app.js          # SPA principale con API REST
```

## Database Schema (SQLite)

| Tabella | Descrizione |
|---------|-------------|
| `users` | Account utente, password hash, onboarding |
| `portfolios` | Portafogli creati dall'utente |
| `holdings` | Posizioni ETF (quote, prezzo medio) |
| `alerts` | Alert prezzo con soglie e canali |
| `settings` | Preferenze utente (key-value) |
| `reports` | Report generati (PDF/PPTX) |
| `community_posts` | Post della community |

## API Endpoints

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/auth/register` | POST | Crea account |
| `/api/auth/login` | POST | Login e ottieni token |
| `/api/auth/me` | GET | Info utente corrente |
| `/api/auth/onboarding` | POST | Salva risposte onboarding |
| `/api/portfolios` | GET/POST | Lista / Crea portafoglio |
| `/api/portfolios/:id/holdings` | POST | Aggiungi posizione |
| `/api/holdings/:id` | DELETE | Rimuovi posizione |
| `/api/alerts` | GET/POST | Lista / Crea alert |
| `/api/alerts/:id` | PATCH/DELETE | Toggle / Elimina alert |
| `/api/settings` | GET/PUT | Leggi / Salva impostazioni |
| `/api/reports/generate` | POST | Genera PDF/PPTX |
| `/api/reports/download/:id` | GET | Scarica report |
| `/api/reports/email` | POST | Invia report via email |
| `/api/community/posts` | GET/POST | Bacheca community |
| `/api/data/etfs` | GET | Lista ETF statica |
| `/api/data/models` | GET | Portafogli modello |

## Report Automatici

### PDF
Generato via HTML -> WeasyPrint (se installato) altrimenti ReportLab fallback. Include:
- Cover con nome utente e data
- KPI: Valore totale, Investito, P&L
- Tabella posizioni con prezzi e P&L

### PPTX
Generato via python-pptx. Include:
- Slide titolo con branding ETF Tracker
- Slide KPI con card colorate
- Slide tabella posizioni

### Email
Invia email HTML con riepilogo KPI + allegato PDF/PPTX. Richiede configurazione SMTP.

## Sicurezza
- Password: PBKDF2-HMAC-SHA256 con 100k iterazioni
- Token: JWT firmato con HMAC-SHA256, scadenza 7 giorni
- SQL Injection: protetto da parametrizzazione SQLite
- CORS: abilitato per frontend

## Licenza
MIT License

## Disclaimer
ETF Tracker e uno strumento di analisi e non costituisce consulenza finanziaria. Gli investimenti comportano rischi, inclusa la possibile perdita del capitale.
