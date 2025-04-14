import { IUseCase } from "../../../shared/application/use-case.interface";
import { EntityNotFoundError } from "../../../shared/domain/errors/entity-not-found.error";
import { EntityValidationError } from "../../../shared/domain/validators/validation.error";
import { UUID } from "../../../shared/domain/value-object/uuid.vo";
import { Category } from "../../domain/category.entity";
import { ICategoryRepository } from "../../domain/category.repository";
import {
  CategoryOutput,
  CategoryOutputMapper,
} from "./shared/category-output.mapper";

export class UpdateCategoryUseCase
  implements
    IUseCase<UpdateCategoryUseCase.Input, UpdateCategoryUseCase.Output>
{
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(
    input: UpdateCategoryUseCase.Input
  ): Promise<UpdateCategoryUseCase.Output> {
    const id = new UUID(input.id);
    const category = await this.repository.findById(id);

    if (!category) {
      throw new EntityNotFoundError(id, Category);
    }

    if ("name" in input) {
      category.changeName(input.name);
    }

    if ("description" in input) {
      category.changeDescription(input.description);
    }

    if ("is_active" in input && input.is_active === true) {
      category.activate();
    }

    if ("is_active" in input && input.is_active === false) {
      category.deactivate();
    }

    if (category.notification.hasErrors()) {
      throw new EntityValidationError(category.notification.toJSON());
    }

    await this.repository.update(category);

    return CategoryOutputMapper.toOutput(category);
  }
}

export namespace UpdateCategoryUseCase {
  export type Input = {
    id: string;
    name?: string;
    description?: string | null;
    is_active?: boolean;
  };

  export type Output = CategoryOutput;
}
