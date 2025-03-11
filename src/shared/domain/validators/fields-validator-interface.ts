export type FieldsError = {
  [field: string]: string[];
};

export interface IFieldsValidator<DataType> {
  errors: FieldsError | null;
  validatedData: DataType | null;
  validate(data: any): boolean;
}
