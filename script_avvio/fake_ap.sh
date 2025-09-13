#!/bin/bash

echo "Abilitazione monitor mode su wlan0..."
sudo ifconfig wlan0 down
sudo iwconfig wlan0 mode monitor
sudo ifconfig wlan0 up

# Controllo che la modalità sia attiva
iwconfig wlan0 | grep -i "Mode:Monitor" > /dev/null
if [[ $? -eq 0 ]]; then
    echo "[+] wlan0 è in monitor mode"
else
    echo "[-] Errore: wlan0 non è in monitor mode"
    exit 1
fi

echo "Avvio fake AP con airbase-ng..."
sudo airbase-ng -e "Test" -c 6 wlan0 &

sleep 5

echo "Configurazione interfaccia at0..."
sudo ifconfig at0 10.0.0.1 netmask 255.255.255.0 up

echo "Abilitazione IP forwarding..."
sudo sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"

echo "Fake AP avviato con successo!"
echo "SSID: Test"
echo "Canale: 6"
echo "IP assegnato a at0: 10.0.0.1"
