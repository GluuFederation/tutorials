import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { v4 as uuid } from 'uuid';

import logger from './utils/logger';
import aticleRoutes from './routes/articles.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/errorHandler';
import swaggerDocs from './utils/swagger';

import { cedarlingBootstrapProperties, cedarlingClient } from './utils/cedarlingUtils';

const app = express();
const PORT = process.env.PORT || 3000;
const store = new session.MemoryStore();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: 'super-secret',
    resave: false,
    saveUninitialized: false,
    store,
    cookie: undefined, // no Set-Cookie header
    genid: () => uuid(), // custom session ID generator
  }) as any,
);

// Middleware to read session ID from header
app.use((req, _res, next) => {
  const sid = req.header('x-session-id');
  if (sid) {
    (req as any).sessionID = sid;
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// api middleware
app.use('/api/auth', authRoutes);
app.use('/api/article', aticleRoutes);
app.use('/api/user', userRoutes);

// Error handler should be last middleware
app.use(errorHandler);

app.listen(PORT, () => {
  cedarlingClient
    .initialize(cedarlingBootstrapProperties)
    // .then(async () => {
    //   // Cedarling authorization
    //   const request = {
    //     tokens: {
    //       access_token: `eyJraWQiOiJjb25uZWN0X2UwNWFiZjAzLTJkNWMtNDcwMC05NWFjLWJjNGZiZWI3OGViN19zaWdfcnMyNTYiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJyZVRObFNRMWdtenJqbzhzbE9UTThnQ25JWGt2Y3liU0JqS1ZzS1RDemxvIiwiaXNzIjoiaHR0cHM6Ly9qYW5zLXVpLmphbnMuaW8iLCJ0b2tlbl90eXBlIjoiQmVhcmVyIiwiY2xpZW50X2lkIjoiYTNjMjRhODEtZDUzMy00NTc4LWIyMjItYzM3NmQ3ZmRjNWU1IiwiYXVkIjoiYTNjMjRhODEtZDUzMy00NTc4LWIyMjItYzM3NmQ3ZmRjNWU1IiwiYWNyIjoiYmFzaWMiLCJ4NXQjUzI1NiI6IiIsIm5iZiI6MTc1Njk3NTk1NSwic2NvcGUiOlsicm9sZSIsIm9wZW5pZCIsInByb2ZpbGUiLCJvZmZsaW5lX2FjY2VzcyIsImVtYWlsIl0sImF1dGhfdGltZSI6MTc1Njk3NTk1NCwiZXhwIjoxNzU2OTc2MjU1LCJpYXQiOjE3NTY5NzU5NTUsImp0aSI6ImVGY2taYzNiUlhxTTBkMHNtcUg3NEEiLCJ1c2VybmFtZSI6ImRob25pIiwic3RhdHVzIjp7InN0YXR1c19saXN0Ijp7ImlkeCI6NTAwLCJ1cmkiOiJodHRwczovL2phbnMtdWkuamFucy5pby9qYW5zLWF1dGgvcmVzdHYxL3N0YXR1c19saXN0In19fQ.LCyH2PaQ2Ah08folFeLxArru_19qRyleou_2po5mjIVNMuJwg5rE4D1DTneUPwteV1EiMx1AHTmx1UJwop-7cDRKhawhF-APSoTbGlM_26gXMHbo09uDeZtcuTAT4WEc48mhmw3C9nn-x8XZRpJTH0xZiwzdvGEtwDWJ20a-cs5g-MyLsFDrgH-e5IkQxUfY5ka_HasrOAdMLwZO4xpoW-UZRAVg-ztYYAx3HPtwqwWJuAoSL3opmspOva0IyVkUQWwQWD_NEdfOjDobn_0NZxuSp3Zn_HXQjAOmgD_YThdO0qqULWknoB2IFVihIwBdS4ZObXAgOC29EfGSwOOl1A`,
    //       id_token: `eyJraWQiOiJjb25uZWN0X2UwNWFiZjAzLTJkNWMtNDcwMC05NWFjLWJjNGZiZWI3OGViN19zaWdfcnMyNTYiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiTk9fZ3VjM2p4UlBWVGlCWUZiRE1FdyIsInN1YiI6InJlVE5sU1ExZ216cmpvOHNsT1RNOGdDbklYa3ZjeWJTQmpLVnNLVEN6bG8iLCJyb2xlIjpbIm1hbmFnZXIiXSwiYW1yIjpbIjEwIl0sImlzcyI6Imh0dHBzOi8vamFucy11aS5qYW5zLmlvIiwiaW51bSI6ImU0YTAwYzQ3LTJiYmQtNGY5NC04YTAzLWJmYTc0OTVlZjE2NiIsInNpZCI6ImFiOTFlODBlLWQ0NTMtNDVmOS1iNGY1LThlYmMwNjNiMjI3NyIsImphbnNPcGVuSURDb25uZWN0VmVyc2lvbiI6Im9wZW5pZGNvbm5lY3QtMS4wIiwiYWNyIjoiYmFzaWMiLCJ1cGRhdGVkX2F0IjoxNzU1MDk0NTA5LCJhdXRoX3RpbWUiOjE3NTY5NzU5NTQsIm5pY2tuYW1lIjoiIiwiZXhwIjoxNzU2OTc5NTU1LCJpYXQiOjE3NTY5NzU5NTUsInBsYW4iOiJiYXNpYyIsImp0aSI6IlA2R2x6MjMwU3ZXNUdkOVNKQlVhNWciLCJlbWFpbCI6ImRob25pQGdsdXUub3JnIiwiZ2l2ZW5fbmFtZSI6ImRob25pIiwibWlkZGxlX25hbWUiOiJtIiwiYXVkIjoiYTNjMjRhODEtZDUzMy00NTc4LWIyMjItYzM3NmQ3ZmRjNWU1IiwiY19oYXNoIjoiY0dzdVBHelFkajJHNjN0ZlI2UU5fQSIsIm5iZiI6MTc1Njk3NTk1NSwibmFtZSI6ImRob25pIiwiZ3JhbnQiOiJhdXRob3JpemF0aW9uX2NvZGUiLCJmYW1pbHlfbmFtZSI6Im0iLCJzdGF0dXMiOnsic3RhdHVzX2xpc3QiOnsiaWR4Ijo1MDEsInVyaSI6Imh0dHBzOi8vamFucy11aS5qYW5zLmlvL2phbnMtYXV0aC9yZXN0djEvc3RhdHVzX2xpc3QifX19.LQsEUePL8Ex8MFm1SAOHoZAbdDkVwKuz20o-ZqVhpuN4gKgWAmp_AtFV3y1FJQl4VJo234vr9fkvkpOaN6oOjZnPWo1pWK6-Z-EDFBahmTGWMm6iglo9nmwbEpykGgDu0KTZ1hvlTHZkiT-89naGZ_k5Nv1eJiaJlmw-odhhilYMaBTokZdgWkx-NNsBHbCGipeeOhLWo6Q6hMKXRBteul2phq6-RCaPE9MuhVK8ZcFrzvKL1SmLg6qrB03EVbKX2QhzO59E-P3R1ga9amz1uJMmGyIu9CpuR_sfjXTDbb93hsySHDtMStufaxjGT3yad-SFi_9JNuLvWkhZRZZErg`,
    //     },
    //     action: `Jans::Action::"View"`,
    //     resource: {
    //       name: 'JansBlogPlatform',
    //       cedar_entity_mapping: {
    //         entity_type: 'Jans::Article',
    //         id: 'JansBlogPlatform',
    //       },
    //       url: {
    //         host: 'jans.test',
    //         path: '/',
    //         protocol: 'http',
    //       },
    //     },
    //     context: {},
    //   };

    //   logger.info(`Request: ${JSON.stringify(request)}`);

    //   const result = await cedarlingClient.authorize(request);
    //   logger.info(`Authentication result: ${result.decision}`);
    // })
    .catch(console.error);
  logger.info(`Server running on http://localhost:${PORT}`);
  swaggerDocs(app, Number(PORT));
});
