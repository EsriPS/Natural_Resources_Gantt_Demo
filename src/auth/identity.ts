/** ArcGIS OAuth session management for the portal and secured scene tiles. */

import IdentityManager from '@arcgis/core/identity/IdentityManager';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import { config } from '../config';

const OAUTH_PORTAL_URL = `${config.portalUrl.replace(/\/$/, '')}/sharing`;

if (config.oauthAppId) {
  IdentityManager.registerOAuthInfos([
    new OAuthInfo({
      appId: config.oauthAppId,
      portalUrl: config.portalUrl,
      popup: false,
    }),
  ]);
}

export interface AuthState {
  signedIn: boolean;
  /** epoch ms, or null when not signed in. */
  expires: number | null;
  username: string | null;
}

type AuthListener = (state: AuthState) => void;

class AuthService {
  private token: string | null = null;
  private expires: number | null = null;
  private username: string | null = null;
  private listeners = new Set<AuthListener>();
  private expiryTimer: number | null = null;

  getState(): AuthState {
    return { signedIn: this.token !== null, expires: this.expires, username: this.username };
  }

  subscribe(fn: AuthListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Restore a previously authorized OAuth session after the redirect. */
  async restore(): Promise<boolean> {
    if (!config.oauthAppId) return false;
    try {
      const credential = await IdentityManager.checkSignInStatus(OAUTH_PORTAL_URL);
      this.acceptCredential(credential);
      return true;
    } catch {
      return false;
    }
  }

  /** Start the ArcGIS OAuth redirect flow. */
  async signIn(): Promise<void> {
    if (!config.oauthAppId) {
      throw new Error('OAuth is not configured. Set VITE_ARCGIS_OAUTH_APP_ID to a registered ArcGIS app ID.');
    }
    const credential = await IdentityManager.getCredential(OAUTH_PORTAL_URL);
    this.acceptCredential(credential);
  }

  private acceptCredential(credential: __esri.Credential): void {
    const expires = credential.expires || Date.now() + 60 * 60_000;

    // Register for the portal and tile host so scene tile requests are authorized.
    IdentityManager.registerToken({
      server: config.portalUrl,
      token: credential.token,
      expires,
      ssl: true,
    });
    IdentityManager.registerToken({
      server: config.tileServer,
      token: credential.token,
      expires,
      ssl: true,
    });

    this.token = credential.token;
    this.expires = expires;
    this.username = credential.userId || null;

    this.armExpiryTimer();
    this.emit();
  }

  /** Clear in-memory auth (also used on expiry to force a re-prompt — R2.4). */
  signOut(): void {
    this.token = null;
    this.expires = null;
    this.username = null;
    if (this.expiryTimer !== null) {
      window.clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
    IdentityManager.destroyCredentials();
    this.emit();
  }

  /** True when a token exists and has not expired. */
  isValid(): boolean {
    return this.token !== null && this.expires !== null && Date.now() < this.expires;
  }

  /** Fire listeners shortly before expiry so the UI can re-open the form (R2.4). */
  private armExpiryTimer(): void {
    if (this.expiryTimer !== null) window.clearTimeout(this.expiryTimer);
    if (this.expires === null) return;
    // Re-prompt 60s before the token actually dies.
    const lead = 60_000;
    const delay = Math.max(0, this.expires - Date.now() - lead);
    this.expiryTimer = window.setTimeout(() => {
      // Treat as signed out; listeners (sign-in form) will re-challenge.
      this.signOut();
    }, delay);
  }

  private emit(): void {
    const state = this.getState();
    for (const fn of this.listeners) fn(state);
  }
}

/** Singleton — the app has one auth session. */
export const auth = new AuthService();
