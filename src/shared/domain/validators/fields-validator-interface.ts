export type FieldErrors = {
  [field: string]: string[];
};

export interface IFieldsValidator<DataType> {
  errors: FieldErrors | null;
  validatedData: DataType | null;
  validate(data: any): boolean;
}
