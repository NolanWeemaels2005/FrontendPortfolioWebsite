let adminToken = "";

export function getAdminToken() {
  return adminToken;
}

export function setAdminToken(token: string) {
  adminToken = token;
  window.dispatchEvent(new Event("admin-auth-change"));
}

export function clearAdminToken() {
  adminToken = "";
  window.dispatchEvent(new Event("admin-auth-change"));
}
