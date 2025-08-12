import { OrgWebSiteSchema } from "./organization";
import { describe, test, expect } from "vitest";

describe("OrgWebSiteSchema", () => {
  test.each([
    // Valid URLs that get normalized (trailing slash added)
    {
      input: "https://example.com",
      expected: "https://example.com/",
      description: "https URL normalized with trailing slash",
    },
    {
      input: "http://example.com",
      expected: "http://example.com/",
      description: "http URL normalized with trailing slash",
    },
    {
      input: "https://www.example.com",
      expected: "https://www.example.com/",
      description: "www subdomain normalized",
    },
    {
      input: "http://subdomain.example.com",
      expected: "http://subdomain.example.com/",
      description: "subdomain normalized",
    },
    {
      input: "https://example.com/path",
      expected: "https://example.com/path",
      description: "URL with path unchanged",
    },
    {
      input: "https://example.com:8080",
      expected: "https://example.com:8080/",
      description: "URL with port normalized",
    },

    // Domain names that should get https:// prepended and normalized
    {
      input: "example.com",
      expected: "https://example.com/",
      description: "domain gets https prefix and normalized",
    },
    {
      input: "www.example.com",
      expected: "https://www.example.com/",
      description: "www domain gets https prefix and normalized",
    },
    {
      input: "subdomain.example.com",
      expected: "https://subdomain.example.com/",
      description: "subdomain gets https prefix and normalized",
    },
    {
      input: "myorg.com",
      expected: "https://myorg.com/",
      description: "simple domain gets https prefix and normalized",
    },
    {
      input: "charity.org",
      expected: "https://charity.org/",
      description: "org domain gets https prefix and normalized",
    },
    {
      input: "example.co.uk",
      expected: "https://example.co.uk/",
      description: "country domain gets https prefix and normalized",
    },

    // Edge cases
    { input: "", expected: "", description: "empty string remains empty" },
    {
      input: "  ",
      expected: "",
      description: "whitespace gets trimmed",
    },
    {
      input: "  example.com  ",
      expected: "https://example.com/",
      description: "whitespace trimmed then https added and normalized",
    },
    {
      input: "  https://example.com  ",
      expected: "https://example.com/",
      description: "whitespace trimmed from https URL and normalized",
    },
  ])("$input => $expected ($description)", ({ input, expected }) => {
    const result = OrgWebSiteSchema.parse(input);
    expect(result).toBe(expected);
  });

  test.each([
    { input: "http://", description: "protocol only" },
    { input: "https://", description: "https protocol only" },
    { input: "ftp://example.com", description: "unsupported protocol" },
    { input: "invalid url", description: "spaces in URL" },
    { input: "http:example.com", description: "malformed protocol" },
    { input: "not-a-url", description: "invalid domain format (no TLD)" },
    { input: "localhost", description: "localhost not valid domain" },
    { input: "127.0.0.1", description: "IP address not valid domain" },
    { input: ".example.com", description: "domain starting with dot" },
    { input: "example.", description: "domain ending with dot only" },
  ])("rejects: $input ($description)", ({ input }) => {
    expect(() => OrgWebSiteSchema.parse(input)).toThrow();
  });

  test("optional field accepts undefined", () => {
    const result = OrgWebSiteSchema.parse(undefined);
    expect(result).toBeUndefined();
  });
});