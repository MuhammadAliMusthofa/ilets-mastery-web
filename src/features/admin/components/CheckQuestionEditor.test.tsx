import { describe, it, expect } from "vitest";
import { blankQuestion, cleanQuestion, questionProblems } from "./CheckQuestionEditor";
import type { CheckQuestion } from "@/src/models/basic";

const why = "Because the subject is singular.";

describe("questionProblems", () => {
  it("menerima soal pilihan ganda yang lengkap", () => {
    expect(questionProblems({ type: "choice", question: "Pick a noun", options: ["run", "cat"], answer: 1, why })).toEqual([]);
  });

  it("menolak opsi kosong dan opsi kembar", () => {
    const problems = questionProblems({ type: "choice", question: "Pick", options: ["cat", ""], answer: 0, why });
    expect(problems).toContain("Fill in every option.");

    const twins = questionProblems({ type: "choice", question: "Pick", options: ["Cat", "cat"], answer: 0, why });
    expect(twins).toContain("Options must be different.");
  });

  it("meminta tanda ___ pada soal ketik", () => {
    expect(questionProblems({ type: "type", question: "She is happy.", answers: ["is"], why })).toContain(
      "Add ___ where the student types."
    );
    expect(questionProblems({ type: "type", question: "She ___ happy.", answers: ["is"], why })).toEqual([]);
  });

  it("meminta minimal dua kata pada soal susun kalimat", () => {
    expect(questionProblems({ type: "order", question: "Build it", words: ["Hello"], why })).toContain(
      "The sentence needs at least 2 words."
    );
  });

  it("menolak kelompok yang tidak berisi kata", () => {
    const problems = questionProblems({
      type: "sort",
      question: "Sort",
      buckets: ["Noun", "Verb"],
      items: [
        { text: "cat", bucket: 0 },
        { text: "dog", bucket: 0 },
      ],
      why,
    });
    expect(problems).toContain("Group Verb has no words.");
  });

  it("selalu meminta pertanyaan dan alasannya", () => {
    const problems = questionProblems({ type: "choice", question: "  ", options: ["a", "b"], answer: 0, why: "" });
    expect(problems).toContain("Write the question.");
    expect(problems).toContain("Explain why the answer is correct.");
  });
});

describe("blankQuestion", () => {
  it("mempertahankan pertanyaan dan alasan saat tipe diganti", () => {
    const next = blankQuestion("sort", { question: "Sort these", why });
    expect(next.question).toBe("Sort these");
    expect(next.why).toBe(why);
    expect(next.type).toBe("sort");
  });

  it("memberi dua opsi kosong untuk pilihan ganda baru", () => {
    const next = blankQuestion("choice") as Extract<CheckQuestion, { type: "choice" }>;
    expect(next.options).toHaveLength(2);
    expect(next.answer).toBe(0);
  });
});

describe("cleanQuestion", () => {
  it("merapikan spasi di semua bagian soal", () => {
    const cleaned = cleanQuestion({
      type: "sort",
      question: "  Sort these  ",
      buckets: [" Noun ", "Verb"],
      items: [{ text: " cat ", bucket: 0 }],
      why: "  reason  ",
    }) as Extract<CheckQuestion, { type: "sort" }>;

    expect(cleaned.question).toBe("Sort these");
    expect(cleaned.why).toBe("reason");
    expect(cleaned.buckets[0]).toBe("Noun");
    expect(cleaned.items[0].text).toBe("cat");
  });
});
