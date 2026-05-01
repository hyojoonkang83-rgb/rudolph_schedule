export type MemoColor = 'yellow' | 'pink' | 'blue' | 'green' | 'gray';

export interface Memo {
  id: string;
  content: string;
  color: MemoColor;
  createdAt: string;
  updatedAt: string;
}
