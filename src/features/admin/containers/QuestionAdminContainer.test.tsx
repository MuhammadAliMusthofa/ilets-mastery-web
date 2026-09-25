import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuestionAdminContainer } from './QuestionAdminContainer';
import { ieltsAdminService } from '../services/ielts-admin.service';

vi.mock('../services/ielts-admin.service', () => ({
  ieltsAdminService: {
    questions: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
    passages: { list: vi.fn() },
  },
}));

const question = {
  id: 11,
  passage_id: null,
  skill: 'READING' as const,
  question_type: 'MULTIPLE_CHOICE' as const,
  question_text: 'When does the library open?',
  column_answer: null,
  options: [
    { id: 'A', text: '8' },
    { id: 'B', text: '9' },
  ],
  attachments: [],
  accepted_answers: [['B']],
  explanation: null,
  difficulty: 'MEDIUM' as const,
  tags: [],
  order: 0,
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
};

const renderWithQuery = (ui: ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('QuestionAdminContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ieltsAdminService.questions.list).mockResolvedValue([question]);
    vi.mocked(ieltsAdminService.questions.create).mockResolvedValue(question);
    vi.mocked(ieltsAdminService.passages.list).mockResolvedValue([]);
  });

  it('menampilkan soal beserta label tipenya dalam bahasa manusia', async () => {
    renderWithQuery(<QuestionAdminContainer />);

    expect(await screen.findByText('When does the library open?')).toBeInTheDocument();
    // Label tipe muncul di baris tabel dan di daftar filter.
    expect(screen.getAllByText('Multiple choice').length).toBeGreaterThan(0);
  });

  it('menyaring berdasarkan skill', async () => {
    renderWithQuery(<QuestionAdminContainer />);
    await screen.findByText('When does the library open?');

    await userEvent.click(screen.getByRole('radio', { name: /Writing/i }));

    expect(screen.queryByText('When does the library open?')).not.toBeInTheDocument();
  });

  it('mengganti field form saat tipe soal diubah', async () => {
    renderWithQuery(<QuestionAdminContainer />);
    await screen.findByText('When does the library open?');

    await userEvent.click(screen.getByRole('button', { name: /New question/i }));
    expect(screen.getByLabelText('Option A text')).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText(/^Question type/i), 'SHORT_ANSWER');

    expect(screen.queryByLabelText('Option A text')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Accepted answers for blank 1')).toBeInTheDocument();
  });

  it('mengirim soal baru lengkap dengan payload sesuai tipenya', async () => {
    renderWithQuery(<QuestionAdminContainer />);
    await screen.findByText('When does the library open?');

    await userEvent.click(screen.getByRole('button', { name: /New question/i }));
    await userEvent.type(screen.getByLabelText(/^Question text/i), 'Kapan perpustakaan buka?');
    await userEvent.type(screen.getByLabelText('Option A text'), 'Jam 8');
    await userEvent.type(screen.getByLabelText('Option B text'), 'Jam 9');
    await userEvent.click(screen.getByLabelText('Mark B as correct'));
    await userEvent.click(screen.getByRole('button', { name: /Save question/i }));

    expect(ieltsAdminService.questions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        question_type: 'MULTIPLE_CHOICE',
        question_text: 'Kapan perpustakaan buka?',
        accepted_answers: [['B']],
        options: [
          { id: 'A', text: 'Jam 8' },
          { id: 'B', text: 'Jam 9' },
        ],
      })
    );
  });

  it('menampilkan pesan dari backend saat payload ditolak', async () => {
    vi.mocked(ieltsAdminService.questions.create).mockRejectedValue({
      response: { data: { message: 'Jawaban "Z" tidak ada di daftar options' } },
    });

    renderWithQuery(<QuestionAdminContainer />);
    await screen.findByText('When does the library open?');

    await userEvent.click(screen.getByRole('button', { name: /New question/i }));
    await userEvent.type(screen.getByLabelText(/^Question text/i), 'Soal');
    await userEvent.click(screen.getByRole('button', { name: /Save question/i }));

    expect(
      await screen.findByText(/Jawaban "Z" tidak ada di daftar options/i)
    ).toBeInTheDocument();
  });
});
