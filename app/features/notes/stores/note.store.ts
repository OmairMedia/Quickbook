import { defineStore } from "pinia";
import { noteApi } from "../api/note.api";
import type {
  Note,
  CreateNotePayload,
  UpdateNotePayload,
  NotesListResponse,
} from "../types/note";

interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const dummyNotes: Note[] = [
  {
    id: "1",
    title: "Vue 3 Composition API",
    content:
      "Learn refs, reactive objects, computed properties, watchers, and composables.",
    tags: ["vue", "frontend", "javascript"],
    isFavorite: true,
    createdAt: "2026-08-10T09:00:00Z",
    updatedAt: "2026-08-10T09:00:00Z",
  },
  {
    id: "2",
    title: "Nuxt 4 Project Setup",
    content:
      "Configure TypeScript, Pinia, ESLint, Prettier, and project structure.",
    tags: ["nuxt", "typescript"],
    isFavorite: false,
    createdAt: "2026-08-11T10:30:00Z",
    updatedAt: "2026-08-12T08:15:00Z",
  },
  {
    id: "3",
    title: "Supabase Notes",
    content:
      "Implement CRUD operations with row-level security and user authentication.",
    tags: ["supabase", "backend"],
    isFavorite: true,
    createdAt: "2026-08-13T14:20:00Z",
    updatedAt: "2026-08-13T16:45:00Z",
  },
  {
    id: "4",
    title: "Freelancer Proposal Template",
    content:
      "Short, professional proposal template for web development projects.",
    tags: ["freelancing", "career"],
    isFavorite: false,
    createdAt: "2026-08-14T11:10:00Z",
    updatedAt: "2026-08-14T11:10:00Z",
  },
  {
    id: "5",
    title: "Performance Optimization Checklist",
    content:
      "Use lazy loading, code splitting, image optimization, and caching strategies.",
    tags: ["performance", "seo"],
    isFavorite: true,
    createdAt: "2026-08-15T08:00:00Z",
    updatedAt: "2026-08-15T13:30:00Z",
  },
  {
    id: "6",
    title: "Project Ideas",
    content:
      "Build a project management system, CMS, SaaS dashboard, and component library.",
    tags: ["ideas", "portfolio"],
    isFavorite: false,
    createdAt: "2026-08-16T17:00:00Z",
    updatedAt: "2026-08-16T17:00:00Z",
  },
];

export const useNoteStore = defineStore("notes", {
  state: (): NoteState => ({
    notes: dummyNotes,
    currentNote: null,
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchNotes(params?: {
      page?: number;
      limit?: number;
      search?: string;
      tag?: string;
    }) {
      this.loading = true;
      this.error = null;

      try {
        const response: NotesListResponse = await noteApi.list({
          page: this.page,
          limit: this.limit,
          ...params,
        });
        this.notes = response.notes;
        this.total = response.total;
        this.page = response.page;
        this.limit = response.limit;
        this.totalPages = response.totalPages;
      } catch (err: any) {
        this.error = err?.statusMessage ?? "Failed to load notes";
      } finally {
        this.loading = false;
      }
    },

    async fetchNote(id: string) {
      this.loading = true;
      this.error = null;

      try {
        this.currentNote = await noteApi.get(id);
      } catch (err: any) {
        this.error = err?.statusMessage ?? "Failed to load note";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createNote(payload: CreateNotePayload): Promise<Note> {
      this.loading = true;
      this.error = null;

      try {
        const note = await noteApi.create(payload);
        this.notes.unshift(note);
        this.total++;
        return note;
      } catch (err: any) {
        this.error = err?.statusMessage ?? "Failed to create note";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateNote(id: string, payload: UpdateNotePayload): Promise<Note> {
      this.loading = true;
      this.error = null;

      try {
        const note = await noteApi.update(id, payload);
        const index = this.notes.findIndex((n) => n.id === id);
        if (index !== -1) {
          this.notes[index] = note;
        }
        if (this.currentNote?.id === id) {
          this.currentNote = note;
        }
        return note;
      } catch (err: any) {
        this.error = err?.statusMessage ?? "Failed to update note";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteNote(id: string) {
      this.loading = true;
      this.error = null;

      try {
        await noteApi.delete(id);
        this.notes = this.notes.filter((n) => n.id !== id);
        this.total--;
        if (this.currentNote?.id === id) {
          this.currentNote = null;
        }
      } catch (err: any) {
        this.error = err?.statusMessage ?? "Failed to delete note";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    setPage(page: number) {
      this.page = page;
    },

    clearError() {
      this.error = null;
    },
  },
});
