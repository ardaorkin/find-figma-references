import type { FigmaReferenceResult } from "../types";
import { getGitHistory } from "./gitService";
import { getPRDetails } from "./githubService";

/**
 * Parameters for finding Figma references
 */
interface FindFigmaReferencesParams {
  /** The file path to search for Figma references */
  filePath: string;
  /** Callback function to handle results as they're found */
  onResultFound?: (result: FigmaReferenceResult) => void;
  /** Callback function to update loading progress */
  onProgress?: (processed: number, total: number) => void;
}

/**
 * Configuration for chunked processing
 */
interface ChunkConfig {
  /** Number of commits to process in each chunk */
  chunkSize: number;
  /** Delay between chunks in milliseconds */
  chunkDelay: number;
}

/**
 * Default chunk configuration
 */
const DEFAULT_CHUNK_CONFIG: ChunkConfig = {
  chunkSize: 5,
  chunkDelay: 100,
};

/**
 * Fetches PR details for a commit if it has a PR number
 *
 * @param commit - The commit to fetch PR details for
 * @param repoInfo - Repository information
 * @returns Promise resolving to PR details, or null if no PR or fetch fails
 *
 * @example
 * ```typescript
 * const commit = { prNumber: "123", ... };
 * const repoInfo = { owner: "owner", repo: "repo" };
 * const prDetails = await fetchPRDetailsForCommit(commit, repoInfo);
 * ```
 */
async function fetchPRDetailsForCommit(
  commit: any,
  repoInfo: { owner: string; repo: string } | null
): Promise<any | null> {
  if (!commit.prNumber || !repoInfo) {
    return null;
  }

  try {
    const prDetails = await getPRDetails(
      repoInfo.owner,
      repoInfo.repo,
      commit.prNumber
    );

    return prDetails;
  } catch (error) {
    return null;
  }
}

/**
 * Filters commits to only include those with Figma URLs in their PR body
 *
 * @param commits - Array of commits with PR information
 * @returns Array of commits that have Figma URLs in their PR body
 *
 * @example
 * ```typescript
 * const commits = [commit1, commit2, commit3];
 * const commitsWithFigma = filterCommitsWithFigmaUrls(commits);
 * ```
 */
export function filterCommitsWithFigmaUrls(commits: any[]): any[] {
  return commits.filter(
    (commit) =>
      commit.prDetails &&
      commit.prDetails.figmaUrls &&
      commit.prDetails.figmaUrls.length > 0
  );
}

/**
 * Transforms a commit with PR details into a FigmaReferenceResult
 *
 * @param commit - The commit with PR details
 * @returns FigmaReferenceResult object
 *
 * @example
 * ```typescript
 * const commit = {
 *   author: "John Doe",
 *   prUrl: "https://github.com/owner/repo/pull/123",
 *   prDetails: { figmaUrls: ["https://figma.com/file/abc"] }
 * };
 * const result = transformToFigmaReferenceResult(commit);
 * // Returns: { prUrl: "...", author: "John Doe", figmaUrls: ["..."] }
 * ```
 */
export function transformToFigmaReferenceResult(
  commit: any
): FigmaReferenceResult {
  return {
    prUrl: commit.prUrl || "",
    author: commit.author || "",
    figmaUrls: commit.prDetails?.figmaUrls || [],
  };
}

/**
 * Processes a single commit and returns Figma reference result if found
 *
 * @param commit - The commit to process
 * @param repoInfo - Repository information
 * @returns Promise resolving to FigmaReferenceResult if found, null otherwise
 *
 * @example
 * ```typescript
 * const commit = { prNumber: "123", ... };
 * const repoInfo = { owner: "owner", repo: "repo" };
 * const result = await processSingleCommit(commit, repoInfo);
 * ```
 */
async function processSingleCommit(
  commit: any,
  repoInfo: { owner: string; repo: string } | null
): Promise<FigmaReferenceResult | null> {
  if (!commit.prNumber) {
    return null;
  }

  const prDetails = await fetchPRDetailsForCommit(commit, repoInfo);
  if (!prDetails || !prDetails.figmaUrls || prDetails.figmaUrls.length === 0) {
    return null;
  }

  return transformToFigmaReferenceResult({ ...commit, prDetails });
}

/**
 * Processes commits in chunks with delay between chunks
 *
 * @param commits - Array of commits to process
 * @param repoInfo - Repository information
 * @param config - Chunk configuration
 * @param onResultFound - Callback for when a result is found
 * @param onProgress - Callback for progress updates
 * @returns Promise resolving to array of all found results
 *
 * @example
 * ```typescript
 * const commits = [commit1, commit2, ...];
 * const repoInfo = { owner: "owner", repo: "repo" };
 * const results = await processCommitsInChunks(commits, repoInfo, config, onResult, onProgress);
 * ```
 */
async function processCommitsInChunks(
  commits: any[],
  repoInfo: { owner: string; repo: string } | null,
  config: ChunkConfig,
  onResultFound?: (result: FigmaReferenceResult) => void,
  onProgress?: (processed: number, total: number) => void
): Promise<FigmaReferenceResult[]> {
  const results: FigmaReferenceResult[] = [];
  const total = commits.length;
  let processed = 0;

  // Process commits in chunks
  for (let i = 0; i < commits.length; i += config.chunkSize) {
    const chunk = commits.slice(i, i + config.chunkSize);

    // Process all commits in the current chunk concurrently
    const chunkPromises = chunk.map(async (commit) => {
      const result = await processSingleCommit(commit, repoInfo);
      processed++;

      if (onProgress) {
        onProgress(processed, total);
      }

      return result;
    });

    const chunkResults = await Promise.all(chunkPromises);

    // Add found results and trigger callbacks
    for (const result of chunkResults) {
      if (result) {
        results.push(result);
        if (onResultFound) {
          onResultFound(result);
        }
      }
    }

    // Add delay between chunks (except for the last chunk)
    if (i + config.chunkSize < commits.length) {
      await new Promise((resolve) => setTimeout(resolve, config.chunkDelay));
    }
  }

  return results;
}

/**
 * Main function to find Figma references in git history for a file
 *
 * @param params - Parameters for finding Figma references
 * @returns Promise resolving to array of FigmaReferenceResult objects
 *
 * @example
 * ```typescript
 * const params = { filePath: '/path/to/file.ts' };
 * const result = await findFigmaReferences(params);
 * ```
 */
export async function findFigmaReferences(
  params: FindFigmaReferencesParams
): Promise<FigmaReferenceResult[]> {
  try {
    // Get git history for the file
    const commits = await getGitHistory(params.filePath);

    if (commits.length === 0) {
      return [];
    }

    // Extract repo info from the first commit that has a PR URL
    const commitWithPR = commits.find((commit) => commit.prUrl);
    const repoInfo = commitWithPR?.prUrl
      ? {
          owner: commitWithPR.prUrl.split("/")[3],
          repo: commitWithPR.prUrl.split("/")[4],
        }
      : null;

    // Process commits in chunks with streaming results
    const results = await processCommitsInChunks(
      commits,
      repoInfo,
      DEFAULT_CHUNK_CONFIG,
      params.onResultFound,
      params.onProgress
    );

    return results;
  } catch (error) {
    throw new Error(`Failed to find Figma references: ${error}`);
  }
}
