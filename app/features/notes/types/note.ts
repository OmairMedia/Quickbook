export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotePayload {
  title: string;
  content?: string;
  tags?: string[];
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface NotesListResponse {
  notes: Note[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
