export class InvalidInitialBalanceError extends Error {
  constructor() {
    super('Initial balance cannot be negative');
  }
}
