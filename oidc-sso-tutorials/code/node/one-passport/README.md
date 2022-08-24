# Passport in One file

##  Make .env and add below environments

```
JANS_SERVER_URL=https://your.jans.org
JANS_POST_URL=https://your.jans.org/jans-auth/postlogin.htm
GOOGLE_CLIENT_ID=xxxxxxx
GOOGLE_CLIENT_SECRET=xxxxxxx
PORT=8090
SALT_FILE_PATH=/etc/jans/conf/salt
KEY_FILE_PATH=/etc/passport/keys/keystore.pem
KEY_ALG=RS512
KEY_ID=your-kid
```

## Installation and start node server

```
npm init -y
npm i cookie-session crypto dotenv express jsonwebtoken passport passport-google-oauth20 uuid
node index.js
```