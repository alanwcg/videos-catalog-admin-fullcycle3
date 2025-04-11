import { IUseCase } from "../../shared/application/use-case.interface";
import { UUID } from "../../shared/domain/value-object/uuid.vo";
import { ICategoryRepository } from "../domain/category.repository";

export class DeleteCategoryUseCase
  implements
    IUseCase<DeleteCategoryUseCase.Input, DeleteCategoryUseCase.Output>
{
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(
    input: DeleteCategoryUseCase.Input
  ): Promise<DeleteCategoryUseCase.Output> {
    const id = new UUID(input.id);
    await this.repository.delete(id);
  }
}

export namespace DeleteCategoryUseCase {
  export type Input = {
    id: string;
  };

  export type Output = void;
}
