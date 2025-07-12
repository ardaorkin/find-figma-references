import { describe, it, expect } from "bun:test";
import { extractUrlsFromPRBody, transformPRData } from "./githubService";

describe("GitHub Service", () => {
  describe("extractUrlsFromPRBody", () => {
    it("should extract Figma and Jira URLs from PR body", () => {
      const body = `
        Check out this design: https://figma.com/file/abc123
        Related to: https://company.atlassian.net/browse/PAY-34584
        Another design: https://figma.com/design/xyz789
      `;

      const result = extractUrlsFromPRBody(body);
      expect(result.figmaUrls).toContain("https://figma.com/file/abc123");
      expect(result.figmaUrls).toContain("https://figma.com/design/xyz789");
      expect(result.jiraUrls).toContain(
        "https://company.atlassian.net/browse/PAY-34584"
      );
    });

    it("should return empty arrays when no URLs found", () => {
      const body = "This is just regular text without any URLs";

      const result = extractUrlsFromPRBody(body);
      expect(result.figmaUrls).toEqual([]);
      expect(result.jiraUrls).toEqual([]);
    });

    it("should handle empty body", () => {
      const result = extractUrlsFromPRBody("");
      expect(result.figmaUrls).toEqual([]);
      expect(result.jiraUrls).toEqual([]);
    });
  });

  describe("transformPRData", () => {
    it("should transform raw PR data to PRDetails", () => {
      const rawData = {
        title: "Test PR",
        body: "Check out https://figma.com/file/abc123",
      };

      const result = transformPRData(rawData);
      expect(result.title).toBe("Test PR");
      expect(result.body).toBe("Check out https://figma.com/file/abc123");
      expect(result.figmaUrls).toContain("https://figma.com/file/abc123");
      expect(result.jiraUrls).toEqual([]);
    });

    it("should handle PR with no body", () => {
      const rawData = {
        title: "Test PR",
        body: null,
      };

      const result = transformPRData(rawData);
      expect(result.body).toBe("No description available");
    });

    it("should handle PR with empty body", () => {
      const rawData = {
        title: "Test PR",
        body: "",
      };

      const result = transformPRData(rawData);
      expect(result.body).toBe("No description available");
    });
  });
});
