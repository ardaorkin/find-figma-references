import * as vscode from "vscode";

/**
 * Saves the GitHub token to VSCode settings
 *
 * @param token - The GitHub personal access token to save
 * @returns Promise that resolves when the token is saved
 *
 * @example
 * ```typescript
 * await saveGitHubToken('ghp_...');
 * ```
 */
export async function saveGitHubToken(token: string): Promise<void> {
  const config = vscode.workspace.getConfiguration();
  await config.update("github.token", token, vscode.ConfigurationTarget.Global);
}

/**
 * Retrieves the GitHub token from VSCode settings
 *
 * @returns The GitHub token if found, or null if not available
 *
 * @example
 * ```typescript
 * const token = getGitHubTokenFromSettings();
 * if (token) {
 *   // Use token for API calls
 * }
 * ```
 */
export function getGitHubTokenFromSettings(): string | null {
  const config = vscode.workspace.getConfiguration();
  const token = config.get("github.token") as string;
  return token || null;
}

/**
 * Checks if a GitHub token is configured in VSCode settings
 *
 * @returns True if a token is configured, false otherwise
 *
 * @example
 * ```typescript
 * if (hasGitHubToken()) {
 *   // Token is configured
 * }
 * ```
 */
export function hasGitHubToken(): boolean {
  return getGitHubTokenFromSettings() !== null;
}
