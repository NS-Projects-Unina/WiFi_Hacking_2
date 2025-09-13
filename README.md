# Simulazione MITM su Wi-Fi Pubblico

### STUDENTE: ``AURELIO SALVATI``


## Descrizione

Questo progetto realizza una simulazione di un attacco **Man-in-the-Middle (MITM)** in una rete Wi-Fi pubblica fittizia. 

Il repository contiene codice, script e materiale di supporto per ricreare l’ambiente di test (Access Point simulato, captive portal, server back-end, proxy MITM, logging e analisi). 

---

## Architettura del sistema

L’ambiente di test è composto dalle seguenti componenti principali:

- **Access Point simulato**— punto d’ingresso per i client di test.  
- **Captive portal** — pagina di autenticazione che, nel contesto della simulazione, propone l’installazione di una Root CA fittizia.  
- **Servizio DHCP/DNS (dnsmasq)** — fornisce indirizzi IP e risoluzione DNS ai client della rete simulata.  
- **Routing e firewall (iptables)** — regole per reindirizzare il traffico verso il captive portal e verso il proxy.  
- **Proxy MITM** — componente principale dell'attacco.  

---

## Struttura del repository


Il repository è organizzato in diverse cartelle, ciascuna con uno scopo specifico:

- **`/cert/`**  
  Contiene i file relativi alla generazione e allo storage della **Root CA** e dei certificati utilizzati per l’intercettazione del traffico HTTPS.

- **`/mitm/`**  
  Include lo **script Python** per il proxy MITM, responsabile dell’intercettazione e della possibile modifica delle richieste e risposte HTTPS.

- **`/portal/`**  
  Contiene il backend Node.js e le risorse del captive portal:  
  - **`server.js`** → gestisce le richieste dei client, il captive portal e lo sblocco delle rotte dopo l’installazione del certificato.  
  - **`/public/`** → file front-end del captive portal (HTML, CSS, JS).

- **`/scripts_avvio/`**  
  Raccoglie gli **script automatici** utilizzati per l’avvio e l’orchestrazione dell’ambiente operativo.

  ---
  ## Avvio dell'ambiente

Per eseguire il progetto, seguire i seguenti passaggi:

1. **Avviare la modalità monitor e il fake AP**

   ```bash
   ./scripts_avvio/fake_ap.sh
   ```

2. **Impostare le regole di default di IPTables**

   ```bash
   ./scripts_avvio/regole_iptables.sh
   ```

3. **Avviare il server DHCP/DNS con dnsmasq**

   ```bash
   sudo dnsmasq -C dnsmasq.conf -d
   ```

4. **Avviare il backend Node.js del captive portal**

   ```bash
   sudo node server.js
   ```

5. **Avviare il proxy MITM**

   ```bash
   mitmweb --mode transparent --set confdir=certs --listen-host 0.0.0.0 --listen-port 8080 -s ./mitm/mitm.py
   ```

---

Per approfondimenti e dettagli sulle scelte progettuali e implementative, si rimanda alla documentazione disponibile all'interno della repository.

---

**Nota:** questo repository contiene materiale a scopo didattico e di ricerca sulle tecniche di analisi delle reti Wi-Fi pubbliche e sulle possibili contromisure. L'autore non si assume responsabilità per usi impropri.
