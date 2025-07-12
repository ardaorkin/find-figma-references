import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import type { GitCommit, CommitWithPR } from "../types";
import {
  extractRepositoryInfo,
  convertSshToHttps,
} from "../utils/urlDetection";

const execAsync = promisify(exec);

/**
 * Parameters for git log command
 */
interface GitLogParams {
  /** The file path to get git history for */
  filePath: string;
  /** The working directory for git commands */
  cwd: string;
}

/**
 * Parameters for getting remote URL
 */
interface RemoteUrlParams {
  /** The working directory for git commands */
  cwd: string;
}

/**
 * Executes a git log command for a specific file
 *
 * @param params - Parameters for the git log command
 * @returns Promise resolving to the git log output as string
 *
 * @example
 * ```typescript
 * const params = { filePath: 'src/file.ts', cwd: '/path/to/repo' };
 * const gitLog = await executeGitLog(params);
 * ```
 */
export async function executeGitLog(params: GitLogParams): Promise<string> {
  try {
    const { stdout } = await execAsync(
      `git log --pretty=format:"%H|%an|%ad|%s" --date=short --follow "${params.filePath}"`,
      { cwd: params.cwd }
    );

    return stdout;
  } catch (error) {
    console.error("[Git Service] Error executing git log:", error);
    throw new Error(`Failed to execute git log: ${error}`);
  }
}

/**
 * Gets the remote origin URL for a git repository
 *
 * @param params - Parameters for getting remote URL
 * @returns Promise resolving to the remote URL, or empty string if not found
 *
 * @example
 * ```typescript
 * const params = { cwd: '/path/to/repo' };
 * const remoteUrl = await getRemoteUrl(params);
 * ```
 */
export async function getRemoteUrl(params: RemoteUrlParams): Promise<string> {
  try {
    const { stdout } = await execAsync("git config --get remote.origin.url", {
      cwd: params.cwd,
    });

    return stdout.trim();
  } catch (error) {
    console.error("[Git Service] Error getting remote URL:", error);
    return "";
  }
}

/**
 * Gets the workspace folder for a given file path
 *
 * @param filePath - The file path to get workspace for
 * @returns The workspace folder, or null if file is not in a workspace
 *
 * @example
 * ```typescript
 * const workspace = getWorkspaceFolder('/path/to/file.ts');
 * if (workspace) {
 *   // File is in a workspace
 * }
 * ```
 */
export function getWorkspaceFolder(
  filePath: string
): vscode.WorkspaceFolder | null {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(
    vscode.Uri.file(filePath)
  );

  return workspaceFolder || null;
}

/**
 * Parses a single line of git log output into a GitCommit object
 *
 * @param line - A single line from git log output in format "hash|author|date|message"
 * @returns Parsed GitCommit object
 *
 * @example
 * ```typescript
 * const line = "abc123|John Doe|2023-01-01|feat: add new feature";
 * const commit = parseGitLogLine(line);
 * // Returns: { hash: "abc123", shortHash: "abc123", author: "John Doe", date: "2023-01-01", message: "feat: add new feature" }
 * ```
 */
export function parseGitLogLine(line: string): GitCommit {
  const [hash, author, date, message] = line.split("|");

  return {
    hash: hash || "",
    shortHash: (hash || "").substring(0, 7),
    author: author || "",
    date: date || "",
    message: message || "",
  };
}

/**
 * Extracts PR number from a commit message
 *
 * @param message - The commit message to search for PR number
 * @returns The PR number if found, or null if not found
 *
 * @example
 * ```typescript
 * const message = "feat: add new feature (#123)";
 * const prNumber = extractPRNumber(message);
 * // Returns: "123"
 * ```
 */
export function extractPRNumber(message: string): string | null {
  if (!message || typeof message !== "string") {
    return null;
  }

  const prMatch = message.match(/#(\d+)/);
  return prMatch ? prMatch[1] : null;
}

/**
 * Processes a git commit and enriches it with PR information
 *
 * @param commit - The base git commit
 * @param httpsUrl - The HTTPS URL of the repository
 * @param repoInfo - Repository information
 * @param prDetails - Optional PR details if already fetched
 * @returns Enriched commit with PR information
 *
 * @example
 * ```typescript
 * const commit = { hash: "abc123", author: "John", ... };
 * const httpsUrl = "https://github.com/owner/repo";
 * const repoInfo = { owner: "owner", repo: "repo" };
 * const enrichedCommit = processCommitWithPR(commit, httpsUrl, repoInfo);
 * ```
 */
export function processCommitWithPR(
  commit: GitCommit,
  httpsUrl: string,
  repoInfo: { owner: string; repo: string } | null,
  prDetails?: any
): CommitWithPR {
  const prNumber = extractPRNumber(commit.message);

  const result: CommitWithPR = {
    ...commit,
    prNumber: prNumber || undefined,
    prUrl: prNumber ? `${httpsUrl}/pull/${prNumber}` : undefined,
    prDetails: prDetails || undefined,
  };

  return result;
}

/**
 * Gets the complete git history for a file with PR information
 *
 * @param filePath - The file path to get git history for
 * @returns Promise resolving to array of commits with PR information
 *
 * @example
 * ```typescript
 * const commits = await getGitHistory('/path/to/file.ts');
 * for (const commit of commits) {
 *   console.log(`Commit ${commit.shortHash} by ${commit.author}`);
 * }
 * ```
 */
export async function getGitHistory(filePath: string): Promise<CommitWithPR[]> {
  const workspaceFolder = getWorkspaceFolder(filePath);
  if (!workspaceFolder) {
    throw new Error("File is not in a workspace folder");
  }

  const cwd = workspaceFolder.uri.fsPath;

  // Get git log
  const gitLogOutput = await executeGitLog({ filePath, cwd });
  if (!gitLogOutput.trim()) {
    return [];
  }

  // Get remote URL
  const remoteUrl = await getRemoteUrl({ cwd });
  const httpsUrl = convertSshToHttps(remoteUrl);
  const repoInfo = httpsUrl ? extractRepositoryInfo(httpsUrl) : null;

  // Parse git log lines
  const lines = gitLogOutput.trim().split("\n");
  const commits: CommitWithPR[] = [];

  for (const line of lines) {
    const commit = parseGitLogLine(line);
    const enrichedCommit = processCommitWithPR(commit, httpsUrl, repoInfo);
    commits.push(enrichedCommit);
  }

  return commits;
}
