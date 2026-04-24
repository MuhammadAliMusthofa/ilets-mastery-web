// src/constants/mockExamData.ts

// Kita ekspor interface-nya biar bisa dipakai di tempat lain kalau butuh
export interface IOption {
  id: string;
  text: string;
  file?: string | null;
}

export interface IAttachment {
  type: string;
  path: string;
}

export interface IQuestionData {
  id: string | number;
  type_question_id: string | number; 
  text?: string; // Teks bacaan/stimulus (HTML)
  text_image?: string; // Gambar pendamping bacaan
  question_text: string; // Pertanyaan utama
  column_answer?: number; // ✅ TAMBAHAN: Buat nentuin jumlah kotak di Short Essay & Map Labeling
  Options: IOption[];
  AttachmentQuestion?: IAttachment[];
}

export const MOCK_QUESTIONS: IQuestionData[] = [
  {
    // --- SKENARIO 1: TYPE 1 - MULTIPLE CHOICE (Reading) ---
    id: 101,
    type_question_id: "1", 
    text: `
      <p>If you go back far enough, everything lived in the sea. At various points in evolutionary history, enterprising individuals within many different animal groups moved out onto the land, sometimes even to the most parched deserts, taking their own private seawater with them in blood and cellular fluids.</p>
    `,
    text_image: "https://placehold.co/600x300/f8fafc/475569?text=Evolution+Illustration", 
    question_text: "According to the first paragraph, what is true about the migration of animals to land?",
    Options: [
      { id: "A", text: "It happened all at once." },
      { id: "B", text: "It involved taking saltwater with them." },
      { id: "C", text: "Mammals were the first to do it." },
      { id: "D", text: "It only happened in desert areas." }
    ],
    AttachmentQuestion: []
  },

  {
    // --- SKENARIO 2: TYPE 1 - MULTIPLE CHOICE (Listening Audio) ---
    id: 102,
    type_question_id: "1",
    text: "", // Listening gak ada teks bacaan
    question_text: "Listen to the audio recording. What does the speaker say about plant migration?",
    Options: [
      { id: "A", text: "It happened after the animals migrated." },
      { id: "B", text: "It was less important than animal migration." },
      { id: "C", text: "It was a necessary condition for animal migration." }
    ],
    AttachmentQuestion: [
      { 
        type: "audio", 
        path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
      }
    ]
  },

  {
    // --- SKENARIO 3: TYPE 3 - TRUE / FALSE / NOT GIVEN ---
    id: 103,
    type_question_id: "3", 
    text: `
      <p>Marie Curie was a Polish and naturalised-French physicist and chemist who conducted pioneering research on radioactivity. She was the first woman to win a Nobel Prize, the first person and the only woman to win the Nobel Prize twice.</p>
    `,
    question_text: "Marie Curie won the Nobel Prize for her work in biology.",
    Options: [], // T/F/NG gak butuh options dari database karena udah di-hardcode di UI
    AttachmentQuestion: []
  },

  {
    // --- SKENARIO 4: TYPE 5 - SHORT ESSAY (Isian Singkat / Fill in the Blanks) ---
    id: 104,
    type_question_id: "5",
    text: `
      <p>The koala is an arboreal herbivorous marsupial native to Australia. It is the only extant representative of the family Phascolarctidae and its closest living relatives are the wombats.</p>
    `,
    question_text: "Name <strong>TWO</strong> closest living relatives of the koala mentioned in the text:",
    column_answer: 2, // ✅ Ini bakal ngebikin 2 kotak input muncul
    Options: [],
    AttachmentQuestion: []
  },

  {
    // --- SKENARIO 5: TYPE 6 - LONG ESSAY (Writing Task 1) ---
    id: 105,
    type_question_id: "6",
    text: `
      <p><strong>Writing Task 1</strong></p>
      <p>You should spend about 20 minutes on this task.</p>
      <p><em>The chart below shows the number of men and women in further education in Britain in three periods and whether they were studying full-time or part-time.</em></p>
      <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
    `,
    text_image: "https://placehold.co/600x400/e2e8f0/0f172a?text=Bar+Chart+Education",
    question_text: "Write at least 150 words.",
    Options: [],
    AttachmentQuestion: []
  },

  {
    // --- SKENARIO 6: TYPE 8 - MAP / DIAGRAM LABELING ---
    id: 106,
    type_question_id: "8",
    text: `
      <p><strong>Part 2: Map Labeling</strong></p>
      <p>Look at the map of the new town library below. You will hear the librarian explaining the layout. Label the rooms 11 to 13.</p>
    `,
    question_text: "Write the correct labels for the designated areas.",
    column_answer: 3, // ✅ Ini bakal ngebikin 3 kotak isian (nomor 11, 12, 13)
    Options: [],
    AttachmentQuestion: [
      { 
        type: "image", 
        // Ini gambar map-nya yang bakal muncul di tengah komponen MapLabeling
        path: "https://placehold.co/800x500/f8fafc/3b82f6?text=Library+Floor+Plan" 
      }
    ]
  }
];