import { IUseCase } from "../../../shared/application/use-case.interface";
import { EntityValidationError } from "../../../shared/domain/validators/validation.error";
import { Category } from "../../domain/category.entity";
import { ICategoryRepository } from "../../domain/category.repository";
import {
  CategoryOutput,
  CategoryOutputMapper,
} from "./shared/category-output.mapper";

export class CreateCategoryUseCase
  implements
    IUseCase<CreateCategoryUseCase.Input, CreateCategoryUseCase.Output>
{
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(
    input: CreateCategoryUseCase.Input
  ): Promise<CreateCategoryUseCase.Output> {
    const category = Category.create(input);

    if (category.notification.hasErrors()) {
      throw new EntityValidationError(category.notification.toJSON());
    }

    await this.repository.insert(category);

    return CategoryOutputMapper.toOutput(category);
  }
}

export namespace CreateCategoryUseCase {
  export type Input = {
    name: string;
    description?: string | null;
    is_active?: boolean;
  };

  export type Output = CategoryOutput;
}
