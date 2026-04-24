import { api } from "./client";

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
}

export interface LoginResponse {
  user: AuthUser;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  return api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logout(): Promise<void> {
  await api<void>("/auth/logout", { method: "POST" });
}

export async function me(): Promise<AuthUser> {
  const res = await api<{ user: AuthUser } | AuthUser>("/auth/me");
  if (res && typeof res === "object" && "user" in res) {
    return (res as { user: AuthUser }).user;
  }
  return res as AuthUser;
}
