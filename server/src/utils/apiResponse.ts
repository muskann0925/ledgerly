export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export const createApiResponse = <T>(
  success: boolean,
  message: string,
  data?: T
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return response;
};
