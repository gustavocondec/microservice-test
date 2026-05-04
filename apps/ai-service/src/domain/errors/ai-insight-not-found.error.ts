export class AiInsightNotFoundError extends Error {
  constructor() {
    super('No explanation found for the provided transaction');
  }
}
