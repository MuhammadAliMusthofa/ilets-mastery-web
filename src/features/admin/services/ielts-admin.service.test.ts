import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/src/libs/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import axiosInstance from '@/src/libs/axios';
import { ieltsAdminService } from './ielts-admin.service';

const envelope = <T>(data: T) => ({ data: { status: 'success', data } });

describe('ieltsAdminService.passages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list tanpa filter tidak mengirim parameter skill', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue(envelope([]));

    await ieltsAdminService.passages.list();

    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/passages', { params: {} });
  });

  it('list dengan filter skill meneruskannya sebagai query', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue(envelope([]));

    await ieltsAdminService.passages.list({ skill: 'READING' });

    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/passages', {
      params: { skill: 'READING' },
    });
  });

  it('remove memanggil endpoint dengan id', async () => {
    vi.mocked(axiosInstance.delete).mockResolvedValue(envelope({ id: 4 }));

    const result = await ieltsAdminService.passages.remove(4);

    expect(axiosInstance.delete).toHaveBeenCalledWith('/admin/passages/4');
    expect(result).toEqual({ id: 4 });
  });
});

describe('ieltsAdminService.questions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list meneruskan seluruh filter yang diisi', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue(envelope([]));

    await ieltsAdminService.questions.list({
      skill: 'LISTENING',
      question_type: 'MULTIPLE_CHOICE',
      difficulty: 'HARD',
    });

    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/questions', {
      params: { skill: 'LISTENING', question_type: 'MULTIPLE_CHOICE', difficulty: 'HARD' },
    });
  });

  it('create membuka amplop response', async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue(envelope({ id: 11 }));

    const result = await ieltsAdminService.questions.create({
      skill: 'READING',
      question_type: 'MULTIPLE_CHOICE',
      question_text: 'Soal',
      column_answer: null,
      options: [],
      attachments: [],
      accepted_answers: [],
      explanation: null,
      difficulty: 'MEDIUM',
      tags: [],
      order: 0,
      passage_id: null,
    });

    expect(result).toEqual({ id: 11 });
  });
});

describe('ieltsAdminService.packages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('setSections memakai PUT ke sub-resource sections', async () => {
    vi.mocked(axiosInstance.put).mockResolvedValue(envelope({ id: 2 }));

    await ieltsAdminService.packages.setSections(2, [
      { skill: 'READING', question_ids: [7, 9] },
    ]);

    expect(axiosInstance.put).toHaveBeenCalledWith('/admin/packages/2/sections', {
      sections: [{ skill: 'READING', question_ids: [7, 9] }],
    });
  });

  it('publish mengirim flag is_published', async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue(envelope({ id: 2 }));

    await ieltsAdminService.packages.publish(2, true);

    expect(axiosInstance.post).toHaveBeenCalledWith('/admin/packages/2/publish', {
      is_published: true,
    });
  });
});
