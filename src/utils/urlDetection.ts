/**
 * Regular expression pattern for matching Figma URLs
 * Matches URLs like:
 * - https://figma.com/design/...
 * - https://figma.com/file/...
 * - https://www.figma.com/design/...
 * - https://www.figma.com/file/...
 */
const FIGMA_URL_PATTERN =
  /https?:\/\/(?:www\.)?figma\.com\/(?:design\/|file\/)[^\s]+/gi;

/**
 * Regular expression pattern for matching Jira URLs
 * Matches URLs like:
 * - https://company.atlassian.net/browse/PROJECT-123
 * - https://www.company.atlassian.net/browse/PROJECT-123
 */
const JIRA_URL_PATTERN =
  /https?:\/\/(?:www\.)?[^\/]+\.atlassian\.net\/browse\/[A-Z]+-\d+/gi;

/**
 * Regular expression pattern for matching GitHub URLs
 * Matches URLs like:
 * - https://github.com/owner/repo
 * - https://www.github.com/owner/repo
 */
const GITHUB_URL_PATTERN =
  /^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)/;

/**
 * Extracts all Figma URLs from a given text
 *
 * @param text - The text to search for Figma URLs
 * @returns Array of found Figma URLs, or empty array if none found
 *
 * @example
 * ```typescript
 * const text = "Check out this design: https://figma.com/file/abc123 and https://figma.com/design/xyz789";
 * const figmaUrls = findFigmaUrls(text);
 * // Returns: ["https://figma.com/file/abc123", "https://figma.com/design/xyz789"]
 * ```
 */
export function findFigmaUrls(text: string): string[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  const matches = text.match(FIGMA_URL_PATTERN);
  return matches || [];
}

/**
 * Extracts all Jira URLs from a given text
 *
 * @param text - The text to search for Jira URLs
 * @returns Array of found Jira URLs, or empty array if none found
 *
 * @example
 * ```typescript
 * const text = "Related to https://company.atlassian.net/browse/PAY-34584";
 * const jiraUrls = findJiraUrls(text);
 * // Returns: ["https://company.atlassian.net/browse/PAY-34584"]
 * ```
 */
export function findJiraUrls(text: string): string[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  const matches = text.match(JIRA_URL_PATTERN);
  return matches || [];
}

/**
 * Extracts GitHub repository information from a GitHub URL
 *
 * @param url - The GitHub URL to parse
 * @returns Repository information object with owner and repo, or null if URL is invalid
 *
 * @example
 * ```typescript
 * const url = "https://github.com/owner/repo.git";
 * const repoInfo = extractRepositoryInfo(url);
 * // Returns: { owner: "owner", repo: "repo" }
 * ```
 */
export function extractRepositoryInfo(
  url: string
): { owner: string; repo: string } | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  const match = url.match(GITHUB_URL_PATTERN);
  if (!match) {
    return null;
  }

  return {
    owner: match[1],
    repo: match[2].replace(".git", ""),
  };
}

/**
 * Converts a Git SSH URL to HTTPS format
 *
 * @param sshUrl - The SSH URL to convert
 * @returns The HTTPS equivalent URL, or the original URL if no conversion needed
 *
 * @example
 * ```typescript
 * const sshUrl = "git@github.com:owner/repo.git";
 * const httpsUrl = convertSshToHttps(sshUrl);
 * // Returns: "https://github.com/owner/repo"
 * ```
 */
export function convertSshToHttps(sshUrl: string): string {
  if (!sshUrl || typeof sshUrl !== "string") {
    return "";
  }

  let httpsUrl = sshUrl;

  // Convert SSH format to HTTPS
  if (httpsUrl.startsWith("git@")) {
    httpsUrl = httpsUrl.replace("git@github.com:", "https://github.com/");
  }

  // Remove .git extension
  if (httpsUrl.endsWith(".git")) {
    httpsUrl = httpsUrl.slice(0, -4);
  }

  return httpsUrl;
}
