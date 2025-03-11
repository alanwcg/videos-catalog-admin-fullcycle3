import { FieldErrors } from "./shared/domain/validators/fields-validator-interface";

declare global {
  namespace jest {
    interface Matchers<R> {
      toContainErrorsMessages: (expected: FieldErrors) => R;
    }
  }
}
