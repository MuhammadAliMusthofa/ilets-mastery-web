export const MOCK_ROUTES = {
  list: "/ielts/mock",
  detail: (packageId: number | string) => `/ielts/mock/${packageId}`,
  exam: (packageId: number | string, attemptId: number | string) =>
    `/ielts/mock/${packageId}/exam?attempt=${attemptId}`,
  review: (packageId: number | string, attemptId: number | string) =>
    `/ielts/mock/${packageId}/review?attempt=${attemptId}`,
  result: (packageId: number | string, attemptId: number | string) =>
    `/ielts/mock/${packageId}/result?attempt=${attemptId}`,
} as const;
