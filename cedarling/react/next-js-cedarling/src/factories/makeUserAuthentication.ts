import { UserAuthentication } from "@/factories/UserAuthentication";
import {
  InMemoryWebStorage,
  UserManager,
  WebStorageStateStore,
  UserManagerSettings,
} from "oidc-client-ts";

const userManagerSettings: UserManagerSettings = {
  authority: process.env.NEXT_PUBLIC_OP_SERVER as string,
  client_id: process.env.NEXT_PUBLIC_OP_CLIENT_ID as string,
  redirect_uri: `${process.env.NEXT_PUBLIC_URL}/login`,
  post_logout_redirect_uri: `${process.env.NEXT_PUBLIC_URL}/logout`,
  response_type: "code",
  scope: "openid email profile offline_access permission",
  automaticSilentRenew: true,
  validateSubOnSilentRenew: true,
  userStore: new WebStorageStateStore({ store: new InMemoryWebStorage() }),
};
const userManager = new UserManager(userManagerSettings);
const userAuthentication = new UserAuthentication(userManager);

export const makeUserAuthentication = () => {
  return userAuthentication;
};
