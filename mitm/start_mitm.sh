#!/bin/bash
mitmweb --mode transparent --set confdir=certs --listen-host 0.0.0.0 --listen-port 8080 -s mitm.py
