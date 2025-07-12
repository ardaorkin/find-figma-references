import { describe, it, expect } from "bun:test";
import {
  filterCommitsWithFigmaUrls,
  transformToFigmaReferenceResult,
} from "./figmaReferenceService";

describe("Figma Reference Service", () => {
  describe("filterCommitsWithFigmaUrls", () => {
    it("should filter commits with Figma URLs", () => {
      const commits = [
        {
          prDetails: {
            figmaUrls: ["https://figma.com/file/abc"],
            jiraUrls: [],
          },
        },
        {
          prDetails: {
            figmaUrls: [],
            jiraUrls: ["https://jira.com/browse/123"],
          },
        },
        {
          prDetails: {
            figmaUrls: ["https://figma.com/design/xyz"],
            jiraUrls: [],
          },
        },
      ];

      const result = filterCommitsWithFigmaUrls(commits);
      expect(result).toHaveLength(2);
      expect(result[0].prDetails.figmaUrls).toContain(
        "https://figma.com/file/abc"
      );
      expect(result[1].prDetails.figmaUrls).toContain(
        "https://figma.com/design/xyz"
      );
    });

    it("should return empty array when no commits have Figma URLs", () => {
      const commits = [
        {
          prDetails: {
            figmaUrls: [],
            jiraUrls: ["https://jira.com/browse/123"],
          },
        },
        {
          prDetails: {
            figmaUrls: [],
            jiraUrls: [],
          },
        },
      ];

      const result = filterCommitsWithFigmaUrls(commits);
      expect(result).toEqual([]);
    });

    it("should handle commits without prDetails", () => {
      const commits = [
        { author: "John" },
        { prDetails: { figmaUrls: ["https://figma.com/file/abc"] } },
      ];

      const result = filterCommitsWithFigmaUrls(commits);
      expect(result).toHaveLength(1);
    });

    it("should handle commits with null prDetails", () => {
      const commits = [
        { prDetails: null },
        { prDetails: { figmaUrls: ["https://figma.com/file/abc"] } },
      ];

      const result = filterCommitsWithFigmaUrls(commits);
      expect(result).toHaveLength(1);
    });
  });

  describe("transformToFigmaReferenceResult", () => {
    it("should transform commit to FigmaReferenceResult", () => {
      const commit = {
        author: "John Doe",
        prUrl: "https://github.com/owner/repo/pull/123",
        prDetails: {
          figmaUrls: [
            "https://figma.com/file/abc",
            "https://figma.com/design/xyz",
          ],
        },
      };

      const result = transformToFigmaReferenceResult(commit);

      expect(result).toEqual({
        prUrl: "https://github.com/owner/repo/pull/123",
        author: "John Doe",
        figmaUrls: [
          "https://figma.com/file/abc",
          "https://figma.com/design/xyz",
        ],
      });
    });

    it("should handle missing prUrl", () => {
      const commit = {
        author: "John Doe",
        prDetails: {
          figmaUrls: ["https://figma.com/file/abc"],
        },
      };

      const result = transformToFigmaReferenceResult(commit);

      expect(result.prUrl).toBe("");
      expect(result.author).toBe("John Doe");
      expect(result.figmaUrls).toEqual(["https://figma.com/file/abc"]);
    });

    it("should handle missing author", () => {
      const commit = {
        prUrl: "https://github.com/owner/repo/pull/123",
        prDetails: {
          figmaUrls: ["https://figma.com/file/abc"],
        },
      };

      const result = transformToFigmaReferenceResult(commit);

      expect(result.prUrl).toBe("https://github.com/owner/repo/pull/123");
      expect(result.author).toBe("");
      expect(result.figmaUrls).toEqual(["https://figma.com/file/abc"]);
    });

    it("should handle missing prDetails", () => {
      const commit = {
        author: "John Doe",
        prUrl: "https://github.com/owner/repo/pull/123",
      };

      const result = transformToFigmaReferenceResult(commit);

      expect(result).toEqual({
        prUrl: "https://github.com/owner/repo/pull/123",
        author: "John Doe",
        figmaUrls: [],
      });
    });

    it("should handle empty figmaUrls", () => {
      const commit = {
        author: "John Doe",
        prUrl: "https://github.com/owner/repo/pull/123",
        prDetails: {
          figmaUrls: [],
        },
      };

      const result = transformToFigmaReferenceResult(commit);

      expect(result.figmaUrls).toEqual([]);
    });
  });
});
