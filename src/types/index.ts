/**
 * Represents the details of a GitHub Pull Request
 */
export interface PRDetails {
  /** The title of the pull request */
  title: string;
  /** The body/description of the pull request */
  body: string;
  /** Array of Figma URLs found in the PR body */
  figmaUrls: string[];
  /** Array of Jira URLs found in the PR body */
  jiraUrls: string[];
}

/**
 * Represents GitHub repository information
 */
export interface RepositoryInfo {
  /** The repository owner (username or organization) */
  owner: string;
  /** The repository name */
  repo: string;
}

/**
 * Represents a git commit with its metadata
 */
export interface GitCommit {
  /** The full commit hash */
  hash: string;
  /** The short commit hash (first 7 characters) */
  shortHash: string;
  /** The commit author name */
  author: string;
  /** The commit date in YYYY-MM-DD format */
  date: string;
  /** The commit message */
  message: string;
}

/**
 * Represents a commit with associated PR information
 */
export interface CommitWithPR extends GitCommit {
  /** The PR number if found in commit message */
  prNumber?: string;
  /** The PR URL if available */
  prUrl?: string;
  /** The PR details if fetched */
  prDetails?: PRDetails;
}

/**
 * Represents the result of a git history search with Figma references
 */
export interface FigmaReferenceResult {
  /** The PR URL */
  prUrl: string;
  /** The commit author */
  author: string;
  /** Array of Figma URLs found in the PR */
  figmaUrls: string[];
}

// All types are already exported above
