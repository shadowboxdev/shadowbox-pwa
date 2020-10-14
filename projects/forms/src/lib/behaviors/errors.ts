const wrapAsQuote = (str: string): string => `"${str}"`;

export class MissingFormControlsError<T extends string> extends Error {
  constructor(missingFormControls: T[]) {
    super(
      `Attempt to update the form value with an object that doesn't contains some of
       the required form control keys.\nMissing: ${missingFormControls.map(wrapAsQuote).join(', ')}`
    );
  }
}
