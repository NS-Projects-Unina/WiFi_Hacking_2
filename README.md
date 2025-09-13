# Simulazione MITM su Wi-Fi Pubblico — Progetto di Network Security

Studente: Aurelio Salvati M63001919

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

La struttura del progetto è la seguente:

/README.md
/cert/ # generazione e storage della Root CA e dei certificati
/mitm/ # script Python per mitmproxy (logica di intercettazione/modifica)
/portal/
server.js # backend Node.js che gestisce il captive portal e lo sblocco delle rotte
public/ # risorse front-end del captive portal (HTML, CSS, JS)
/scripts_avvio/ # script automatici per avviare l'ambiente (orchestrazione)



**Nota:** questo repository contiene materiale a scopo didattico e di ricerca sulle tecniche di analisi delle reti Wi-Fi pubbliche e sulle possibili contromisure. L'autore non si assume responsabilità per usi impropri.
