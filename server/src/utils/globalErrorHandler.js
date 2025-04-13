// middlewares/errorHandler.js

import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Log error for debugging in development
  console.error(`[Error] ${statusCode} - ${message}`);

  if (err instanceof ApiError) {
    return res
      .status(statusCode)
      .json(new ApiResponse(statusCode, null, message));
  }

  // Handle unexpected errors
  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, null, "Something went wrong"));
};

export { globalErrorHandler };
