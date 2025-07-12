import { describe, it, expect } from "bun:test";
import {
  parseGitLogLine,
  extractPRNumber,
  processCommitWithPR,
} from "./gitService";

describe("Git Service", () => {
  describe("parseGitLogLine", () => {
    it("should parse git log line correctly", () => {
      const line = "abc123|John Doe|2023-01-01|feat: add new feature";
      const result = parseGitLogLine(line);

      expect(result).toEqual({
        hash: "abc123",
        shortHash: "abc123",
        author: "John Doe",
        date: "2023-01-01",
        message: "feat: add new feature",
      });
    });

    it("should handle empty fields", () => {
      const line = "abc123|||";
      const result = parseGitLogLine(line);

      expect(result).toEqual({
        hash: "abc123",
        shortHash: "abc123",
        author: "",
        date: "",
        message: "",
      });
    });

    it("should handle short hash correctly", () => {
      const line = "abcdef123456|John Doe|2023-01-01|feat: add new feature";
      const result = parseGitLogLine(line);

      expect(result.shortHash).toBe("abcdef1");
    });
  });

  describe("extractPRNumber", () => {
    it("should extract PR number from commit message", () => {
      const message = "feat: add new feature (#123)";
      const result = extractPRNumber(message);
      expect(result).toBe("123");
    });

    it("should extract PR number with different formats", () => {
      expect(extractPRNumber("fix: bug (#456)")).toBe("456");
      expect(extractPRNumber("docs: update (#789)")).toBe("789");
    });

    it("should return null when no PR number found", () => {
      const message = "feat: add new feature";
      const result = extractPRNumber(message);
      expect(result).toBeNull();
    });

    it("should handle null and undefined input", () => {
      expect(extractPRNumber(null as any)).toBeNull();
      expect(extractPRNumber(undefined as any)).toBeNull();
    });

    it("should handle empty string", () => {
      expect(extractPRNumber("")).toBeNull();
    });
  });

  describe("processCommitWithPR", () => {
    it("should enrich commit with PR information", () => {
      const commit = {
        hash: "abc123",
        shortHash: "abc123",
        author: "John Doe",
        date: "2023-01-01",
        message: "feat: add new feature (#123)",
      };

      const httpsUrl = "https://github.com/owner/repo";
      const repoInfo = { owner: "owner", repo: "repo" };
      const prDetails = {
        title: "Test PR",
        body: "Test body",
        figmaUrls: ["https://figma.com/file/abc"],
        jiraUrls: [],
      };

      const result = processCommitWithPR(commit, httpsUrl, repoInfo, prDetails);

      expect(result).toEqual({
        ...commit,
        prNumber: "123",
        prUrl: "https://github.com/owner/repo/pull/123",
        prDetails: prDetails,
      });
    });

    it("should handle commit without PR number", () => {
      const commit = {
        hash: "abc123",
        shortHash: "abc123",
        author: "John Doe",
        date: "2023-01-01",
        message: "feat: add new feature",
      };

      const httpsUrl = "https://github.com/owner/repo";
      const repoInfo = { owner: "owner", repo: "repo" };

      const result = processCommitWithPR(commit, httpsUrl, repoInfo);

      expect(result).toEqual({
        ...commit,
        prNumber: undefined,
        prUrl: undefined,
        prDetails: undefined,
      });
    });

    it("should handle null repo info", () => {
      const commit = {
        hash: "abc123",
        shortHash: "abc123",
        author: "John Doe",
        date: "2023-01-01",
        message: "feat: add new feature (#123)",
      };

      const httpsUrl = "https://github.com/owner/repo";

      const result = processCommitWithPR(commit, httpsUrl, null);

      expect(result.prNumber).toBe("123");
      expect(result.prUrl).toBe("https://github.com/owner/repo/pull/123");
      expect(result.prDetails).toBeUndefined();
    });
  });
});
