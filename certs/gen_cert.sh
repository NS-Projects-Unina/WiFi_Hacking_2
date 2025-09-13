#Chiave privata
openssl genrsa -out RootCA.key 2048  
#Certificato autofirmato
openssl req -x509 -new -nodes -key RootCA.key -sha256 -days 365 -out RootCA.pem
