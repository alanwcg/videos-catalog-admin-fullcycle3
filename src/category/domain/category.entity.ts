import { randomUUID } from "node:crypto";
import { UUID } from "../../shared/domain/value-object/uuid.vo";

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

export class Category {
  category_id: UUID;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;

  constructor(props: CategoryConstructorProps) {
    this.category_id = props.category_id ?? new UUID();
    this.name = props.name;
    this.description = props.description ?? null;
    this.is_active = props.is_active ?? true;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: CreateCategoryCommand) {
    return new Category(props);
  }

  changeName(name: string): void {
    this.name = name;
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
