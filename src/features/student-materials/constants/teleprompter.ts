// src/constants/teleprompterData.ts

export interface TeleprompterScript {
  id: string;
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
  content: string; // Teks yang akan berjalan
}

export const DUMMY_SCRIPTS: TeleprompterScript[] = [
  {
    id: "spk-pt2-001",
    title: "Describe a memorable journey",
    topic: "IELTS Part 2",
    difficulty: "Medium",
    estimatedTime: "2 Mins",
    content: "I would like to talk about a memorable journey I took a few years ago. It was a road trip to the mountains with my closest friends. We started our journey early in the morning just as the sun was rising. The scenery along the way was absolutely breathtaking, with lush green hills and a clear blue sky. During the trip, we faced a minor issue when our car got a flat tire, but we managed to fix it together, which actually made the trip more fun and memorable. I felt incredibly relaxed and happy during this trip because it was a great escape from my busy routine."
  },
  {
    id: "spk-pt1-002",
    title: "Talking about Hometown",
    topic: "IELTS Part 1",
    difficulty: "Easy",
    estimatedTime: "1 Min",
    content: "I was born and raised in a small, quiet town in the southern part of the country. It is famous for its historical landmarks and beautiful local parks. I really love living there because the people are incredibly friendly and the pace of life is quite relaxed compared to the big city. However, the only downside is the lack of public transportation, which makes commuting a bit difficult."
  },
  {
    id: "biz-003",
    title: "Opening a Formal Presentation",
    topic: "Business",
    difficulty: "Hard",
    estimatedTime: "3 Mins",
    content: "Good morning, ladies and gentlemen. Thank you all for being here today. My name is Alex, and I am the lead project manager for the new software implementation. The primary purpose of today's presentation is to introduce you to the updated workflow systems that will be rolled out next quarter. If you have any questions during my talk, please feel free to interrupt, or we can discuss them during the Q&A session at the end."
  }
];

// List kategori unik untuk filter
export const SCRIPT_TOPICS = ["All", "IELTS Part 1", "IELTS Part 2", "Business"];