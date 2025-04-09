import { IUseCase } from "../../shared/application/use-case.interface";
import { Category } from "../domain/category.entity";
import { ICategoryRepository } from "../domain/category.repository";

export class CreateCategoryUseCase
  implements
    IUseCase<CreateCategoryUseCase.Input, CreateCategoryUseCase.Output>
{
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(
    input: CreateCategoryUseCase.Input
  ): Promise<CreateCategoryUseCase.Output> {
    const entity = Category.create(input);

    await this.repository.insert(entity);

    return {
      id: entity.category_id.value,
      name: entity.name,
      description: entity.description,
      is_active: entity.is_active,
      created_at: entity.created_at,
    };
  }
}

export namespace CreateCategoryUseCase {
  export type Input = {
    name: string;
    description?: string | null;
    is_active?: boolean;
  };

  export type Output = {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: Date;
  };
}
