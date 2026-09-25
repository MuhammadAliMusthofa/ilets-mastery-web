import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/src/libs/axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import axiosInstance from '@/src/libs/axios';
import { modulesService } from './modules.service';

const summary = {
  key: 'IELTS_GT' as const,
  name: 'English for IELTS General Training',
  description: 'Persiapan IELTS General Training sampai target band tercapai.',
  enrolled: true,
  status: 'ACTIVE' as const,
  started_at: '2026-02-01T00:00:00.000Z',
};

describe('modulesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list membuka amplop response backend', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({ data: { status: 'success', data: [summary] } });

    const result = await modulesService.list();

    expect(axiosInstance.get).toHaveBeenCalledWith('/modules');
    expect(result).toEqual([summary]);
  });

  it('enroll memanggil endpoint module yang benar', async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue({ data: { status: 'success', data: summary } });

    const result = await modulesService.enroll('IELTS_GT');

    expect(axiosInstance.post).toHaveBeenCalledWith('/modules/IELTS_GT/enroll');
    expect(result).toEqual(summary);
  });
});
