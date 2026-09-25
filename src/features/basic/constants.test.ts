import { describe, it, expect } from "vitest";
import { QUICK_CHECK_PASS, passMarkOf } from "./constants";

describe("passMarkOf", () => {
  it("membulatkan ke atas supaya ambangnya tidak pernah di bawah batas", () => {
    // 70% dari 4 = 2,8 → butuh 3; dari 10 = 7 tepat.
    expect(passMarkOf(4)).toBe(3);
    expect(passMarkOf(10)).toBe(7);
    expect(passMarkOf(12)).toBe(9);
  });

  it("selalu minimal satu jawaban benar untuk kuis yang sangat pendek", () => {
    expect(passMarkOf(1)).toBe(1);
    expect(passMarkOf(2)).toBe(2);
  });

  it("tidak meminta apa pun bila kuisnya kosong", () => {
    expect(passMarkOf(0)).toBe(0);
  });

  it("hasilnya tidak pernah di bawah ambang persennya", () => {
    for (const total of [1, 2, 3, 4, 5, 8, 12, 16]) {
      expect(passMarkOf(total) / total).toBeGreaterThanOrEqual(QUICK_CHECK_PASS);
    }
  });
});
