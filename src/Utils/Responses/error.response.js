export const ErrorResponse = ({
  message = "Error",
  statusCode = 400,
  extra = undefined,
}) => {
  // error is string || Error constructor OOP
  const error = new Error(
    typeof message === "string" ? message : message?.message,
  );

  error.status = statusCode; // append/add property
  error.extra = extra;

  throw error;
};

export const BadRequestException = (
  message = "BadRequestException",
  extra = undefined,
) => {
  return ErrorResponse({ message, statusCode: 400, extra });
};

export const NOtFoundException = (
  message = "NotFoundException",
  extra = undefined,
) => {
  return ErrorResponse({ message, statusCode: 404, extra });
};

export const ConflictException = (
  message = "ConflictException",
  extra = undefined,
) => {
  return ErrorResponse({ message, statusCode: 409, extra });
};

export const UnauthorizedException = (
  message = "UnauthorizedException",
  extra = undefined,
) => {
  return ErrorResponse({ message, statusCode: 401, extra });
};

export const ForbiddenException = (
  message = "ForbiddenException",
  extra = undefined,
) => {
  return ErrorResponse({ message, statusCode: 403, extra });
};

export const TooManyRequestsException = (
  message = "TooManyRequestsException",
  extra = undefined,
) => {
  return ErrorResponse({ message, statusCode: 429, extra });
};

export const InternalServerError = (
  message = "InternalServerError",
  extra = undefined
) => {
  return ErrorResponse({message, statusCode: 500, extra});
}

export const globalErrorHandler = (err, req, res, next) => {
  const status = err.status ?? 500;

  return res
    .status(status)
    .json({ message: err.message, stack: err.stack, status, extra: err.extra });
};
