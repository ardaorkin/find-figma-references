import type { FigmaReferenceResult } from "../types";
import { getGitHistory } from "./gitService";
import { getPRDetails } from "./githubService";

/**
 * Parameters for finding Figma references
 */
interface FindFigmaReferencesParams {
  /** The file path to search for Figma references */
  filePath: string;
}

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
    console.log("[Figma Reference Service] Fetching PR details...");
    const prDetails = await getPRDetails(
      repoInfo.owner,
      repoInfo.repo,
      commit.prNumber
    );

    if (prDetails) {
      console.log(
        "[Figma Reference Service] PR details:",
        JSON.stringify({ prDetails })
      );
    }

    return prDetails;
  } catch (error) {
    console.error(
      "[Figma Reference Service] Error fetching PR details:",
      error
    );
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
function filterCommitsWithFigmaUrls(commits: any[]): any[] {
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
function transformToFigmaReferenceResult(commit: any): FigmaReferenceResult {
  return {
    prUrl: commit.prUrl || "",
    author: commit.author || "",
    figmaUrls: commit.prDetails?.figmaUrls || [],
  };
}

/**
 * Formats Figma reference results into a readable string
 *
 * @param results - Array of Figma reference results
 * @returns Formatted string representation of the results
 *
 * @example
 * ```typescript
 * const results = [
 *   { prUrl: "https://github.com/owner/repo/pull/123", author: "John", figmaUrls: ["https://figma.com/file/abc"] }
 * ];
 * const formatted = formatFigmaReferenceResults(results);
 * ```
 */
function formatFigmaReferenceResults(results: FigmaReferenceResult[]): string {
  if (results.length === 0) {
    return "No commits with Figma URLs found for this file.";
  }

  return results
    .map(
      (result) =>
        `PR: ${result.prUrl} | Author: ${
          result.author
        } | Figma URLs: ${result.figmaUrls.join(", ")}`
    )
    .join("\n");
}

/**
 * Main function to find Figma references in git history for a file
 *
 * @param params - Parameters for finding Figma references
 * @returns Promise resolving to formatted string of Figma references found
 *
 * @example
 * ```typescript
 * const params = { filePath: '/path/to/file.ts' };
 * const result = await findFigmaReferences(params);
 * console.log(result);
 * ```
 */
export async function findFigmaReferences(
  params: FindFigmaReferencesParams
): Promise<string> {
  try {
    // Get git history for the file
    const commits = await getGitHistory(params.filePath);

    if (commits.length === 0) {
      return "No git history found for this file.";
    }

    // Process each commit to fetch PR details
    const commitsWithPRDetails = await Promise.all(
      commits.map(async (commit) => {
        if (commit.prNumber) {
          // Extract repo info from the commit's prUrl
          const repoInfo = commit.prUrl
            ? {
                owner: commit.prUrl.split("/")[3],
                repo: commit.prUrl.split("/")[4],
              }
            : null;

          const prDetails = await fetchPRDetailsForCommit(commit, repoInfo);
          if (prDetails) {
            return { ...commit, prDetails };
          }
        }
        return commit;
      })
    );

    // Filter commits that have Figma URLs
    const commitsWithFigma = filterCommitsWithFigmaUrls(commitsWithPRDetails);

    // Transform to result format
    const results = commitsWithFigma.map(transformToFigmaReferenceResult);

    // Format the results
    return formatFigmaReferenceResults(results);
  } catch (error) {
    throw new Error(`Failed to find Figma references: ${error}`);
  }
}
