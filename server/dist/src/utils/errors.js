export class AppError extends Error {
    status;
    code;
    constructor(status, message, code = 'APP_ERROR') {
        super(message);
        this.status = status;
        this.code = code;
    }
}
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
