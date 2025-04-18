import { Category } from '../../../domain/category.entity';

export type CategoryOutput = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
};

export class CategoryOutputMapper {
  static toOutput(category: Category): CategoryOutput {
    const { category_id, ...rest } = category.toJSON();
    return {
      id: category_id,
      ...rest,
    };
  }
}
