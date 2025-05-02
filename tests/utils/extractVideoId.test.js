import { describe, it, expect } from "vitest";
import { extractVideoId } from "../../src/utils/extractVideoId";

describe("extractVideoId", () => {
  it("extracts video ID from standard link", () => {
    const msg = "Check this out: https://www.youtube.com/watch?v=abc123xyz90";
    expect(extractVideoId(msg)).toBe("abc123xyz90");
  });

  it("extracts video ID from youtu.be link", () => {
    const msg = "https://youtu.be/abc123xyz90";
    expect(extractVideoId(msg)).toBe("abc123xyz90");
  });

  it("returns null if no video ID", () => {
    const msg = "hello world";
    expect(extractVideoId(msg)).toBe(null);
  });
});
