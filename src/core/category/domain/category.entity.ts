import { Entity } from '../../shared/domain/entity';
import { EntityValidationError } from '../../shared/domain/validators/validation.error';
import { ValueObject } from '../../shared/domain/value-object';
import { UUID } from '../../shared/domain/value-object/uuid.vo';
import { CategoryValidatorFactory } from './category.validator';

export type CategoryConstructorProps = {
  category_id?: UUID;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: Date;
};

export type CreateCategoryCommand = {
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export class Category extends Entity {
  category_id: UUID;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;

  constructor(props: CategoryConstructorProps) {
    super();
    this.category_id = props.category_id ?? new UUID();
    this.name = props.name;
    this.description = props.description ?? null;
    this.is_active = props.is_active ?? true;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: CreateCategoryCommand): Category {
    const category = new Category(props);
    category.validate();
    return category;
  }

  changeName(name: string): void {
    this.name = name;
    this.validate();
  }

  changeDescription(description: string): void {
    this.description = description;
  }

  activate(): void {
    this.is_active = true;
  }

  deactivate(): void {
    this.is_active = false;
  }

  validate(fields?: string[]): boolean {
    const validator = CategoryValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  get entity_id(): ValueObject {
    return this.category_id;
  }

  toJSON() {
    return {
      category_id: this.category_id.value,
      name: this.name,
      description: this.description,
      is_active: this.is_active,
      created_at: this.created_at,
    };
  }
}
