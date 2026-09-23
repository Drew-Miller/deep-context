import { describe, expect, it } from "vitest";
import { parseMarkdown, renderMarkdown } from "../src/frontmatter/index.js";

describe("frontmatter", () => {
  it("round trips human-readable metadata", () => {
    const rendered = renderMarkdown({ id: "REQ-X-001", origin: "confirmed", tags: ["x"] }, "# Requirement\n\nBody");
    const parsed = parseMarkdown(rendered);
    expect(parsed.data).toMatchObject({ id: "REQ-X-001", origin: "confirmed", tags: ["x"] });
    expect(parsed.body).toContain("Body");
  });

  it("rejects unclosed frontmatter", () => {
    expect(() => parseMarkdown("---\nid: broken\n")).toThrow("Unclosed");
  });
});
