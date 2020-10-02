# App Auth Angular with Gluu CE

[App-Auth JS](https://github.com/openid/AppAuth-JS) integration with the Angular App and Gluu CE OpenID Connect Provider.

![angular-flow](./src/assets/angular-flow.gif)

## Prerequisites

1. Node JS >= 12.x.x
1. @angular/cli >= 10.1.2
1. [Gluu CE](https://gluu.org/docs/gluu-server) >= 4.x.x, I am using Gluu Server as a OpenID Connect Provider. [Check here for more details about Gluu Server](https://gluu.org/docs/gluu-server)

## Configuration

Use `environment.ts` to set OP Client configuration.

## Start

1. Install Dependencies

```
npm install
```

2. Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
