import { describe, it, expect } from "vitest";
import {
  maskMobileNumber,
  formatCurrency,
  formatDate,
  isValidMobileNumber,
} from "../src/lib/utils";

describe("utils", () => {
  describe("maskMobileNumber", () => {
    it("masks a 9-digit number", () => {
      expect(maskMobileNumber("770001234")).toBe("77XXXXX34");
    });

    it("masks a 10-digit number", () => {
      expect(maskMobileNumber("0770001234")).toBe("07XXXXXX34");
    });

    it("returns short numbers unchanged", () => {
      expect(maskMobileNumber("123")).toBe("123");
    });

    it("handles empty string", () => {
      expect(maskMobileNumber("")).toBe("");
    });

    it("strips spaces before masking", () => {
      expect(maskMobileNumber("77 000 1234")).toBe("77XXXXX34");
    });
  });

  describe("formatCurrency", () => {
    it("formats a number as FCFA", () => {
      const result = formatCurrency(150000);
      expect(result).toContain("150");
      expect(result).toContain("000");
      expect(result).toContain("FCFA");
    });

    it("formats zero", () => {
      expect(formatCurrency(0)).toContain("0");
      expect(formatCurrency(0)).toContain("FCFA");
    });
  });

  describe("formatDate", () => {
    it("formats a timestamp as FR date", () => {
      const date = new Date("2026-03-26T10:00:00Z").getTime();
      const result = formatDate(date);
      expect(result).toContain("26");
      expect(result).toContain("03");
      expect(result).toContain("2026");
    });
  });

  describe("isValidMobileNumber", () => {
    it("accepts 9-digit number", () => {
      expect(isValidMobileNumber("770001234")).toBe(true);
    });

    it("accepts 10-digit number", () => {
      expect(isValidMobileNumber("0770001234")).toBe(true);
    });

    it("accepts number with spaces", () => {
      expect(isValidMobileNumber("77 000 1234")).toBe(true);
    });

    it("rejects too short number", () => {
      expect(isValidMobileNumber("12345678")).toBe(false);
    });

    it("rejects too long number", () => {
      expect(isValidMobileNumber("12345678901")).toBe(false);
    });

    it("rejects letters", () => {
      expect(isValidMobileNumber("77abc1234")).toBe(false);
    });
  });
});
