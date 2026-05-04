export class DuplicateClientEmailError extends Error {
  constructor() {
    super('A client with the same email already exists');
  }
}
