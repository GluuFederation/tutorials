import { atom } from "jotai";

export const accountAtom = atom({
  isAuthenticate: false,
  email: "",
  name: "",
  roles: [],
  userId: "",
});
