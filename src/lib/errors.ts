export class ApplicationError extends Error {
  type: string;
  constructor(message: string, type?: string) {
    super(message);
    this.name = "ApplicationError";
    this.type = type ?? "ApplicationError";
  }
}

export class SafeActionError extends ApplicationError {
  constructor(message: string) {
    super(message, "SafeActionError");
    this.name = "SafeActionError";
  }
}

export class SafeRouteError extends ApplicationError {
  status: number;
  constructor(message: string, status = 400) {
    super(message, "SafeRouteError");
    this.name = "SafeRouteError";
    this.status = status;
  }
}
