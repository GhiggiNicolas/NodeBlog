# NodeBlog

Questo progetto è un'applicazione di blog basata su Node.js e MongoDB, che permette la gestione di utenti, post e like. È strutturato per gestire e memorizzare dati su un database MongoDB con tre collezioni principali: `users`, `posts`, e `likes`.

## Struttura del Database

### Nome del Database:
- `nodeblog_db`

### Collezioni del Database:
- **users**: Memorizza i dati degli utenti (es. nome, email, password).
- **posts**: Contiene i post creati dagli utenti, con titoli, contenuti e metadati.
- **likes**: Gestisce i like sui post degli utenti.

## Requisiti

Per eseguire questo progetto, assicurati di avere i seguenti software installati sul tuo sistema:

- [Node.js](https://nodejs.org/) (versione 12.x o superiore)
- [MongoDB](https://www.mongodb.com/) (per un'istanza locale o MongoDB Atlas per il cloud)

## Installazione

1. Clona il repository:
    ```bash
    git clone https://github.com/tuo-username/nodeblog.git
2. Vai nella cartella del progetto:
    ```bash
    cd nodeblog
3. Inizializza il progetto Node.js (se non l'hai già fatto):
    ```bash
    npm init -y
4. Installa le dipendenze necessarie:
    ```bash
    npm install