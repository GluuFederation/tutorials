# Setup

Install Certs for docker to run both Frontend and Backend on same nginx HTTP server.

```sh
$ mkdir nginx/certs && mkcert -key-file nginx/certs/privkey.pem -cert-file nginx/certs/fullchain.pem cloud.gluu.local
```
