import { FieldErrors } from "./fields-validator-interface";

export class EntityValidationError extends Error {
  constructor(
    public errors: FieldErrors[],
    message = "Entity Validation Error"
  ) {
    super(message);
  }

  count(): number {
    return Object.keys(this.errors).length;
  }
}
