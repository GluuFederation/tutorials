This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Make `.env` file in root and add below config for OAuth Login

```
NEXT_PUBLIC_OP_SERVER=https://your-op-server
NEXT_PUBLIC_OP_CLIENT_ID=
NEXT_PUBLIC_URL=http://localhost:3000
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Docker

Make `.env` file in root folder.

```sh
NEXT_PUBLIC_OP_SERVER=https://your-op-server
NEXT_PUBLIC_OP_CLIENT_ID=
NEXT_PUBLIC_URL=http://localhost:3000
```

```bash
docker build -t next-js-cedarling .

docker run -p 3000:3000 next-js-cedarling
```

Open `http://localhost:3000/` URL in your browser to access application.
