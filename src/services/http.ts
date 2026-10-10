import axios, { isAxiosError, type AxiosRequestConfig } from "axios";
import { env } from "@/config/env";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type QueryValue = string | number | boolean | undefined | null;
type Query = Record<string, QueryValue>;

const client = axios.create({
  baseURL: env.apiUrl,
  // Gửi kèm cookie đăng nhập (httpOnly) tới backend
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/** NestJS trả lỗi dạng { message: string | string[] }. */
function parseErrorMessage(data: unknown, fallback: string): string {
  const message = (data as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;
  return fallback;
}

/** Bỏ các tham số rỗng để không gửi `?weekStart=` lên backend. */
function cleanQuery(query?: Query): Query | undefined {
  if (!query) return undefined;
  return Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await client.request<T>(config);
    return response.data;
  } catch (error) {
    // Có phản hồi từ backend (401, 404, 500...): đổi thành ApiError để phần còn lại của app dùng thống nhất
    if (isAxiosError(error) && error.response) {
      const { status, statusText, data } = error.response;
      throw new ApiError(status, parseErrorMessage(data, statusText || "Yêu cầu thất bại"));
    }
    // Không có phản hồi (backend chưa chạy, mất mạng): giữ nguyên lỗi gốc
    throw error;
  }
}

/** Client gọi REST API của backend. Các service luôn gọi qua đây, không gọi axios trực tiếp. */
export const http = {
  get: <T>(path: string, query?: Query) =>
    request<T>({ method: "GET", url: path, params: cleanQuery(query) }),
  post: <T>(path: string, body?: unknown) => request<T>({ method: "POST", url: path, data: body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>({ method: "PATCH", url: path, data: body }),
  delete: <T>(path: string) => request<T>({ method: "DELETE", url: path }),
};