// Base class for custom application errors
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name; // Ensure correct error name
    // Ensure stack trace is captured (needed for V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Specific Error Types related to Ticker operations

export class TickerRepositoryError extends AppError {
  constructor(message: string = 'A repository error occurred with ticker data') {
    super(message);
  }
}

export class TickerApiClientError extends AppError {
  constructor(message: string = 'An API client error occurred while fetching ticker data') {
    super(message);
  }
}

export class TickerNotFoundError extends AppError {
  constructor(symbol: string) {
    super(`Ticker symbol '${symbol}' not found`);
    this.name = 'TickerNotFoundError'; // Explicit name for clarity
  }
}

export class TickerConflictError extends AppError {
    constructor(symbol: string) {
        super(`Ticker symbol '${symbol}' already exists`);
        this.name = 'TickerConflictError';
    }
}

export class TickerValidationError extends AppError {
    constructor(message: string = 'Ticker data validation failed') {
        super(message);
        this.name = 'TickerValidationError';
    }
}

export class TickerApiBadResponseError extends TickerApiClientError {
    constructor(symbol: string, reason: string) {
        super(`Bad or incomplete response from API for ticker '${symbol}': ${reason}`);
        this.name = 'TickerApiBadResponseError';
    }
}
