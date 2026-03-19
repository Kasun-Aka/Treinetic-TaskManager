export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt?: string;
}
