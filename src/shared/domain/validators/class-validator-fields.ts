import { validateSync } from "class-validator";
import { FieldsError, IFieldsValidator } from "./fields-validator-interface";

export abstract class ClassValidatorFields<DataType>
  implements IFieldsValidator<DataType>
{
  errors: FieldsError | null = null;
  validatedData: DataType | null = null;

  validate(data: any): boolean {
    const errors = validateSync(data);
    if (errors.length) {
      this.errors = {};
      for (const error of errors) {
        const field = error.property;
        this.errors[field] = Object.values(error.constraints!);
      }
    } else {
      this.validatedData = data;
    }
    return !errors.length;
  }
}
