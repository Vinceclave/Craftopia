export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export const createError = (message: string, statusCode: number = 400): never => {
  throw new AppError(message, statusCode);
};