echo -e "Impostazione regole Forwarding.."
#Cancella tutte le regole attive in tutte le tabelle
sudo iptables -F
sudo iptables -t nat -F
sudo iptables -t mangle -F

# Elimina tutte le catene personalizzate
sudo iptables -X
sudo iptables -t nat -X
sudo iptables -t mangle -X

# Policy di default su ACCEPT 
sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT

# Esclusione query DNS
sudo iptables -t nat -A PREROUTING -i at0 -p udp --dport 53 -j ACCEPT
sudo iptables -t nat -A PREROUTING -i at0 -p tcp --dport 53 -j ACCEPT

# Reindirizza tutto il resto verso il processo locale su 10.0.0.1
sudo iptables -t nat -A PREROUTING -i at0 -j DNAT --to-destination 10.0.0.1
