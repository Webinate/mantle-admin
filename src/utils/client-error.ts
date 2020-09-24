export class ClientError extends Error {
  public response: Response;
  public code: number;

  constructor(message: string, code: number, response: Response) {
    super(message);
    this.response = response;
    this.code = code;
  }
}
