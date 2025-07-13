import * as vscode from "vscode";
import { Octokit } from "octokit";
import type { PRDetails } from "../types";
import { findFigmaUrls, findJiraUrls } from "../utils/urlDetection";

/**
 * Configuration for GitHub API requests
 */
interface GitHubConfig {
  /** GitHub personal access token */
  token: string;
  /** API version to use */
  apiVersion: string;
}

/**
 * Parameters for fetching PR details
 */
interface FetchPRParams {
  /** Repository owner (username or organization) */
  owner: string;
  /** Repository name */
  repo: string;
  /** Pull request number */
  prNumber: string;
}

/**
 * Retrieves GitHub token from environment variables or VSCode settings
 *
 * @returns The GitHub token if found, or null if not available
 *
 * @example
 * ```typescript
 * const token = getGitHubToken();
 * if (token) {
 *   // Use token for API calls
 * }
 * ```
 */
export function getGitHubToken(): string | null {
  const envToken = process.env.GITHUB_TOKEN;
  const configToken = vscode.workspace
    .getConfiguration()
    .get("github.token") as string;

  const token = envToken || configToken;

  return token || null;
}

/**
 * Creates an Octokit instance with the provided configuration
 *
 * @param config - GitHub API configuration
 * @returns Configured Octokit instance
 *
 * @example
 * ```typescript
 * const config = { token: 'ghp_...', apiVersion: '2022-11-28' };
 * const octokit = createOctokitInstance(config);
 * ```
 */
export function createOctokitInstance(config: GitHubConfig): Octokit {
  return new Octokit({
    auth: config.token,
  });
}

/**
 * Fetches raw PR data from GitHub API
 *
 * @param octokit - Configured Octokit instance
 * @param params - Parameters for fetching PR details
 * @returns Raw PR data from GitHub API, or null if request fails
 *
 * @example
 * ```typescript
 * const octokit = createOctokitInstance(config);
 * const params = { owner: 'owner', repo: 'repo', prNumber: '123' };
 * const prData = await fetchRawPRData(octokit, params);
 * ```
 */
export async function fetchRawPRData(
  octokit: Octokit,
  params: FetchPRParams
): Promise<any | null> {
  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}",
      {
        owner: params.owner,
        repo: params.repo,
        pull_number: parseInt(params.prNumber),
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (response.status !== 200) {
      return null;
    }

    return response.data;
  } catch (error) {
    return null;
  }
}

/**
 * Extracts URLs from PR body text
 *
 * @param body - The PR body text to analyze
 * @returns Object containing arrays of Figma and Jira URLs found
 *
 * @example
 * ```typescript
 * const body = "Check out https://figma.com/file/abc and https://company.atlassian.net/browse/PAY-123";
 * const urls = extractUrlsFromPRBody(body);
 * // Returns: { figmaUrls: ["https://figma.com/file/abc"], jiraUrls: ["https://company.atlassian.net/browse/PAY-123"] }
 * ```
 */
export function extractUrlsFromPRBody(body: string): {
  figmaUrls: string[];
  jiraUrls: string[];
} {
  const figmaUrls = findFigmaUrls(body);
  const jiraUrls = findJiraUrls(body);

  return { figmaUrls, jiraUrls };
}

/**
 * Transforms raw PR data into structured PRDetails object
 *
 * @param rawData - Raw PR data from GitHub API
 * @returns Structured PRDetails object
 *
 * @example
 * ```typescript
 * const rawData = { title: 'PR Title', body: 'PR body with URLs...' };
 * const prDetails = transformPRData(rawData);
 * ```
 */
export function transformPRData(rawData: any): PRDetails {
  const body = rawData.body || "No description available";
  const { figmaUrls, jiraUrls } = extractUrlsFromPRBody(body);

  return {
    title: rawData.title,
    body: body,
    figmaUrls: figmaUrls,
    jiraUrls: jiraUrls,
  };
}

/**
 * Fetches complete PR details including extracted URLs
 *
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param prNumber - Pull request number
 * @returns Promise resolving to PRDetails object, or null if fetch fails
 *
 * @example
 * ```typescript
 * const prDetails = await getPRDetails('owner', 'repo', '123');
 * if (prDetails) {
 *   // Access Figma URLs
 * }
 * ```
 */
export async function getPRDetails(
  owner: string,
  repo: string,
  prNumber: string
): Promise<PRDetails | null> {
  const token = getGitHubToken();
  if (!token) {
    throw new Error(
      "GitHub token not found. Please set GITHUB_TOKEN environment variable or configure github.token in VSCode settings."
    );
  }

  const config: GitHubConfig = {
    token,
    apiVersion: "2022-11-28",
  };

  const octokit = createOctokitInstance(config);
  const params: FetchPRParams = { owner, repo, prNumber };

  const rawData = await fetchRawPRData(octokit, params);
  if (!rawData) {
    return null;
  }

  return transformPRData(rawData);
}
