import { IUseCase } from '../../../../shared/application/use-case.interface';
import { EntityNotFoundError } from '../../../../shared/domain/errors/entity-not-found.error';
import { UUID } from '../../../../shared/domain/value-object/uuid.vo';
import { Category } from '../../../domain/category.entity';
import { ICategoryRepository } from '../../../domain/category.repository';
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '../shared/category-output.mapper';

export class FindCategoryUseCase
  implements IUseCase<FindCategoryUseCase.Input, FindCategoryUseCase.Output>
{
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(
    input: FindCategoryUseCase.Input,
  ): Promise<FindCategoryUseCase.Output> {
    const id = new UUID(input.id);
    const category = await this.repository.findById(id);

    if (!category) {
      throw new EntityNotFoundError(id, Category);
    }

    return CategoryOutputMapper.toOutput(category);
  }
}

export namespace FindCategoryUseCase {
  export type Input = {
    id: string;
  };

  export type Output = CategoryOutput;
}
