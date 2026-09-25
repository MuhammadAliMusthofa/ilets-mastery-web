import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionTypeFields, blankDraftFor, type QuestionDraft } from './QuestionTypeFields';

const draftFor = (type: QuestionDraft['question_type']): QuestionDraft => ({
  question_type: type,
  ...blankDraftFor(type),
});

/**
 * Untuk pengetikan multi-karakter, komponen terkendali butuh state yang
 * benar-benar berubah. Tanpa ini hanya karakter pertama yang pernah masuk,
 * karena `value` tidak pernah diperbarui di antara keystroke.
 */
function Harness({
  initial,
  onChange,
}: {
  initial: QuestionDraft;
  onChange: (next: QuestionDraft) => void;
}) {
  const [value, setValue] = useState(initial);

  return (
    <QuestionTypeFields
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

describe('blankDraftFor', () => {
  it('Multiple Choice mulai dengan dua pilihan kosong dan satu slot jawaban', () => {
    const draft = blankDraftFor('MULTIPLE_CHOICE');

    expect(draft.options).toHaveLength(2);
    expect(draft.accepted_answers).toEqual([[]]);
    expect(draft.column_answer).toBeNull();
  });

  it('Short Answer mulai dengan satu kotak isian', () => {
    const draft = blankDraftFor('SHORT_ANSWER');

    expect(draft.column_answer).toBe(1);
    expect(draft.accepted_answers).toHaveLength(1);
    expect(draft.options).toEqual([]);
  });

  it('Long Essay tidak punya pilihan maupun kunci jawaban', () => {
    const draft = blankDraftFor('LONG_ESSAY');

    expect(draft.options).toEqual([]);
    expect(draft.accepted_answers).toEqual([]);
    expect(draft.column_answer).toBeNull();
  });

  it('True/False/NG punya satu slot jawaban tanpa options', () => {
    const draft = blankDraftFor('TRUE_FALSE_NOT_GIVEN');

    expect(draft.options).toEqual([]);
    expect(draft.accepted_answers).toEqual([[]]);
  });
});

describe('QuestionTypeFields — Multiple Choice', () => {
  it('menampilkan satu baris per pilihan', () => {
    render(<QuestionTypeFields value={draftFor('MULTIPLE_CHOICE')} onChange={vi.fn()} />);

    expect(screen.getByLabelText('Option A text')).toBeInTheDocument();
    expect(screen.getByLabelText('Option B text')).toBeInTheDocument();
  });

  it('menambah pilihan baru dengan huruf berikutnya', async () => {
    const onChange = vi.fn();
    render(<QuestionTypeFields value={draftFor('MULTIPLE_CHOICE')} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /Add option/i }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
        ],
      })
    );
  });

  it('menandai satu pilihan sebagai jawaban benar', async () => {
    const onChange = vi.fn();
    render(<QuestionTypeFields value={draftFor('MULTIPLE_CHOICE')} onChange={onChange} />);

    await userEvent.click(screen.getByLabelText('Mark B as correct'));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ accepted_answers: [['B']] })
    );
  });
});

describe('QuestionTypeFields — Multiple Choice Complex', () => {
  it('memakai checkbox sehingga lebih dari satu jawaban bisa dipilih', async () => {
    const onChange = vi.fn();
    const value: QuestionDraft = {
      ...draftFor('MULTIPLE_CHOICE_COMPLEX'),
      accepted_answers: [['A']],
    };

    render(<QuestionTypeFields value={value} onChange={onChange} />);

    await userEvent.click(screen.getByLabelText('Mark B as correct'));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ accepted_answers: [['A', 'B']] })
    );
  });
});

describe('QuestionTypeFields — True/False/Not Given', () => {
  it('menawarkan tepat tiga pilihan jawaban', () => {
    render(<QuestionTypeFields value={draftFor('TRUE_FALSE_NOT_GIVEN')} onChange={vi.fn()} />);

    expect(screen.getByLabelText('Correct answer: TRUE')).toBeInTheDocument();
    expect(screen.getByLabelText('Correct answer: FALSE')).toBeInTheDocument();
    expect(screen.getByLabelText('Correct answer: NOT_GIVEN')).toBeInTheDocument();
  });

  it('tidak menampilkan editor pilihan jawaban', () => {
    render(<QuestionTypeFields value={draftFor('TRUE_FALSE_NOT_GIVEN')} onChange={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /Add option/i })).not.toBeInTheDocument();
  });
});

describe('QuestionTypeFields — Short Answer', () => {
  it('menambah kotak isian sekaligus slot jawabannya', async () => {
    const onChange = vi.fn();
    render(<QuestionTypeFields value={draftFor('SHORT_ANSWER')} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /Add a blank/i }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ column_answer: 2, accepted_answers: [[], []] })
    );
  });

  it('mengurangi kotak isian sekaligus membuang slot jawabannya', async () => {
    const onChange = vi.fn();
    const value: QuestionDraft = {
      ...draftFor('SHORT_ANSWER'),
      column_answer: 2,
      accepted_answers: [['koala'], ['wombat']],
    };

    render(<QuestionTypeFields value={value} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /Remove a blank/i }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ column_answer: 1, accepted_answers: [['koala']] })
    );
  });

  it('menerima beberapa varian jawaban dipisah koma', async () => {
    const onChange = vi.fn();
    render(<Harness initial={draftFor('SHORT_ANSWER')} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Accepted answers for blank 1'), 'colour, color');

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ accepted_answers: [['colour', 'color']] })
    );
  });
});

describe('QuestionTypeFields — Map Labeling', () => {
  it('meminta URL gambar denah', async () => {
    const onChange = vi.fn();
    render(<Harness initial={draftFor('MAP_LABELING')} onChange={onChange} />);

    await userEvent.type(
      screen.getByLabelText(/Map image URL/i),
      'https://cdn.example.com/denah.png'
    );

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        attachments: [{ type: 'image', path: 'https://cdn.example.com/denah.png' }],
      })
    );
  });
});

describe('QuestionTypeFields — Long Essay', () => {
  it('memberi tahu bahwa tipe ini dinilai lewat self-assessment', () => {
    render(<QuestionTypeFields value={draftFor('LONG_ESSAY')} onChange={vi.fn()} />);

    expect(screen.getByText(/self-assessment/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add option/i })).not.toBeInTheDocument();
  });
});
