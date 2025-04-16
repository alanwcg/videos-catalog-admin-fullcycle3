import { Notification } from './notification';

export type FieldErrors =
  | {
      [field: string]: string[];
    }
  | string;

export interface IFieldsValidator {
  validate(notification: Notification, data: any, fields: string[]): boolean;
}
