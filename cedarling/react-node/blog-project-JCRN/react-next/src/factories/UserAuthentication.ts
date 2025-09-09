import type { User, UserManager } from "oidc-client-ts";

export interface IUserAuthentication {
  getAccessToken(): Promise<string | Error | undefined>;
  getUser(): Promise<Error | null | User>;
  signinRedirect(prompt: string | undefined): Promise<void>;
  verifyCodeAndGetAccessToken(): Promise<string | Error | undefined>;
  renewToken(): Promise<string | Error | undefined>;
  signoutRedirect(): Promise<void>;
}

export class UserAuthentication implements IUserAuthentication {
  constructor(private readonly userManager: UserManager) {}

  async getAccessToken(): Promise<string | Error | undefined> {
    try {
      const user = await this.userManager.getUser();
      return user?.access_token;
    } catch (e) {
      throw e;
    }
  }

  async getUser(): Promise<Error | null | User> {
    try {
      const user = await this.userManager.getUser();
      return user;
    } catch (e) {
      throw e;
    }
  }

  async getIdToken(): Promise<string | Error | undefined> {
    try {
      const user = await this.userManager.getUser();
      return user?.id_token;
    } catch (e) {
      throw e;
    }
  }

  async signinRedirect(prompt: string | undefined): Promise<void> {
    if (prompt) {
      return this.userManager.signinRedirect({ prompt });
    }
    return this.userManager.signinRedirect();
  }

  async verifyCodeAndGetAccessToken(): Promise<string | Error | undefined> {
    try {
      const user = await this.userManager.signinCallback();
      return user?.access_token;
    } catch (e) {
      throw e;
    }
  }

  async renewToken(): Promise<string | Error | undefined> {
    try {
      const user = await this.userManager.signinSilent();
      return user?.access_token;
    } catch (e) {
      throw e;
    }
  }

  async signoutRedirect(): Promise<void> {
    return this.userManager.signoutRedirect();
  }
}
