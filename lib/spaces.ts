import { ApiError, apiRequest } from "@/lib/api";
import type { Space } from "@/lib/data";

export async function getSpaces(): Promise<Space[]> {
  return apiRequest<Space[]>("/spaces/");
}

// اگر فضا وجود نداشته باشد یا غیرفعال باشد null برمی‌گرداند.
export async function getSpace(id: string): Promise<Space | null> {
  try {
    return await apiRequest<Space>(`/spaces/${encodeURIComponent(id)}/`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}