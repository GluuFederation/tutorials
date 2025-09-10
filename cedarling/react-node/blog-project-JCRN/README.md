# Article

https://medium.com/@kdhttps/backend-node-js-and-frontend-react-js-authorization-with-the-janssen-cedarling-029921b5844e

# Setup

- Configure Backend app. Below is `.env` in nodejs directory.

```sh
PORT=3000
APP_URL=https://cloud.gluu.local
FRONTEND_URL=https://cloud.gluu.local
LOG_LEVEL=debug
NODE_ENV=development
JWT_SECRET=yourjwtsecret
AUTH_ENDPOINT=https://<your_op_server>/jans-auth/restv1/authorize
TOKEN_ENDPOINT=https://<your_op_server>/jans-auth/restv1/token
END_SESSION_ENDPOINT=https://<your_op_server>/jans-auth/restv1/end_session
CLIENT_ID=a3c24a81-d533-xxxxxx
CLIENT_SECRET=30d39a2d-fc2b-xxxxx
```

- Configure React app. Below is `.env` in react-next directory.

```sh
NEXT_PUBLIC_OP_SERVER=https://<your_op_server>
NEXT_PUBLIC_URL=https://cloud.gluu.local
NEXT_PUBLIC_API_URL=https://cloud.gluu.local/api
```

- Install Certs for docker to run both Frontend and Backend on same nginx HTTP server.

```sh
mkdir nginx/certs && mkcert -key-file nginx/certs/privkey.pem -cert-file nginx/certs/fullchain.pem cloud.gluu.local
```

- Start application using docker

```sh
docker compose up frontend backend nginx
```
