import { AppError } from "../errors/custom.errors";

export type Success<T> = { success: true; value: T };
export type Failure<E extends AppError> = { success: false; error: E };
export type Result<T, E extends AppError> = Success<T> | Failure<E>;

export const success = <T>(value: T): Success<T> => ({ success: true, value });

export const failure = <E extends AppError>(error: E): Failure<E> => ({ success: false, error });

export function hasError<T, E extends AppError>(result: Result<T, E>): result is Failure<E> {
    return !result.success;
}

export function hasValue<T, E extends AppError>(result: Result<T, E>): result is Success<T> {
    return result.success;
}
