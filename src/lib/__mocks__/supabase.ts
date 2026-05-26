import { vi } from "vitest";

const mockSelect = vi.fn().mockResolvedValue({ data: null, error: null });
const mockUpdate = vi.fn().mockResolvedValue({ error: null });
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockStorageUpload = vi.fn().mockResolvedValue({ error: null });
const mockStorageGetPublicUrl = vi
  .fn()
  .mockReturnValue({ data: { publicUrl: "https://cdn.example.com/logo.png" } });

export const supabase = {
  from: (_table: string) => ({
    select: () => ({
      eq: () => ({
        maybeSingle: mockSelect,
      }),
    }),
    upsert: mockUpsert,
    update: () => ({ eq: mockUpdate }),
    insert: mockInsert,
  }),
  storage: {
    from: () => ({
      upload: mockStorageUpload,
      getPublicUrl: mockStorageGetPublicUrl,
    }),
  },
};
