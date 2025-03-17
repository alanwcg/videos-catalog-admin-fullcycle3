import { v4 as uuid, validate as validateUUID } from "uuid";
import { ValueObject } from "../value-object";

export class UUID extends ValueObject {
  readonly value: string;

  constructor(value?: string) {
    super();
    this.value = value || uuid();
    this.validate();
  }

  private validate() {
    const isValid = validateUUID(this.value);
    if (!isValid) {
      throw new InvalidUUIDError();
    }
  }

  toString() {
    return this.value;
  }
}

export class InvalidUUIDError extends Error {
  constructor(message?: string) {
    super(message || "ID must be a valid UUID");
    this.name = "InvalidUUIDError";
  }
}
