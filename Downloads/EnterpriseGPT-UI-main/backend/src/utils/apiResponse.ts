export interface ApiResponseBody<T> {
  success: boolean;
  data: T | null;
  message: string;
  errors: string[];
}

export class ApiResponse {
  static success<T>(data: T, message = 'Success'): ApiResponseBody<T> {
    return { success: true, data, message, errors: [] };
  }

  static error(message: string, errors: string[] = []): ApiResponseBody<null> {
    return { success: false, data: null, message, errors: errors.length ? errors : [message] };
  }
}
