import { describe, it, expect } from "bun:test";
import {
  findFigmaUrls,
  findJiraUrls,
  extractRepositoryInfo,
  convertSshToHttps,
} from "./urlDetection";

describe("URL Detection Utils", () => {
  describe("findFigmaUrls", () => {
    it("should find Figma design URLs", () => {
      const text = "Check out this design: https://figma.com/design/abc123";
      const result = findFigmaUrls(text);
      expect(result).toEqual(["https://figma.com/design/abc123"]);
    });

    it("should find Figma file URLs", () => {
      const text = "Here's the file: https://figma.com/file/xyz789";
      const result = findFigmaUrls(text);
      expect(result).toEqual(["https://figma.com/file/xyz789"]);
    });

    it("should find multiple Figma URLs", () => {
      const text =
        "Design: https://figma.com/design/abc123 and file: https://figma.com/file/xyz789";
      const result = findFigmaUrls(text);
      expect(result).toEqual([
        "https://figma.com/design/abc123",
        "https://figma.com/file/xyz789",
      ]);
    });

    it("should handle www subdomain", () => {
      const text = "https://www.figma.com/design/abc123";
      const result = findFigmaUrls(text);
      expect(result).toEqual(["https://www.figma.com/design/abc123"]);
    });

    it("should return empty array for no Figma URLs", () => {
      const text = "This is just regular text without Figma URLs";
      const result = findFigmaUrls(text);
      expect(result).toEqual([]);
    });

    it("should handle null and undefined input", () => {
      expect(findFigmaUrls(null as any)).toEqual([]);
      expect(findFigmaUrls(undefined as any)).toEqual([]);
    });

    it("should handle empty string", () => {
      expect(findFigmaUrls("")).toEqual([]);
    });
  });

  describe("findJiraUrls", () => {
    it("should find Jira URLs", () => {
      const text = "Related to https://company.atlassian.net/browse/PAY-34584";
      const result = findJiraUrls(text);
      expect(result).toEqual([
        "https://company.atlassian.net/browse/PAY-34584",
      ]);
    });

    it("should find multiple Jira URLs", () => {
      const text =
        "Issues: https://company.atlassian.net/browse/PAY-34584 and https://company.atlassian.net/browse/DEV-123";
      const result = findJiraUrls(text);
      expect(result).toEqual([
        "https://company.atlassian.net/browse/PAY-34584",
        "https://company.atlassian.net/browse/DEV-123",
      ]);
    });

    it("should handle www subdomain", () => {
      const text = "https://www.company.atlassian.net/browse/PAY-34584";
      const result = findJiraUrls(text);
      expect(result).toEqual([
        "https://www.company.atlassian.net/browse/PAY-34584",
      ]);
    });

    it("should return empty array for no Jira URLs", () => {
      const text = "This is just regular text without Jira URLs";
      const result = findJiraUrls(text);
      expect(result).toEqual([]);
    });

    it("should handle null and undefined input", () => {
      expect(findJiraUrls(null as any)).toEqual([]);
      expect(findJiraUrls(undefined as any)).toEqual([]);
    });
  });

  describe("extractRepositoryInfo", () => {
    it("should extract owner and repo from GitHub URL", () => {
      const url = "https://github.com/owner/repo";
      const result = extractRepositoryInfo(url);
      expect(result).toEqual({ owner: "owner", repo: "repo" });
    });

    it("should handle .git extension", () => {
      const url = "https://github.com/owner/repo.git";
      const result = extractRepositoryInfo(url);
      expect(result).toEqual({ owner: "owner", repo: "repo" });
    });

    it("should return null for invalid URL", () => {
      const url = "https://notgithub.com/owner/repo";
      const result = extractRepositoryInfo(url);
      expect(result).toBeNull();
    });

    it("should return null for non-GitHub URL", () => {
      const url = "https://gitlab.com/owner/repo";
      const result = extractRepositoryInfo(url);
      expect(result).toBeNull();
    });

    it("should handle null and undefined input", () => {
      expect(extractRepositoryInfo(null as any)).toBeNull();
      expect(extractRepositoryInfo(undefined as any)).toBeNull();
    });
  });

  describe("convertSshToHttps", () => {
    it("should convert SSH URL to HTTPS", () => {
      const sshUrl = "git@github.com:owner/repo.git";
      const result = convertSshToHttps(sshUrl);
      expect(result).toBe("https://github.com/owner/repo");
    });

    it("should handle HTTPS URL unchanged", () => {
      const httpsUrl = "https://github.com/owner/repo";
      const result = convertSshToHttps(httpsUrl);
      expect(result).toBe("https://github.com/owner/repo");
    });

    it("should remove .git extension", () => {
      const url = "https://github.com/owner/repo.git";
      const result = convertSshToHttps(url);
      expect(result).toBe("https://github.com/owner/repo");
    });

    it("should handle null and undefined input", () => {
      expect(convertSshToHttps(null as any)).toBe("");
      expect(convertSshToHttps(undefined as any)).toBe("");
    });
  });
});
