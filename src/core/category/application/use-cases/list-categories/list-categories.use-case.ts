import {
  PaginatedOutput,
  PaginatedOutputMapper,
} from "../../../../shared/application/paginated-output";
import { IUseCase } from "../../../../shared/application/use-case.interface";
import { SortDirection } from "../../../../shared/domain/repository/search-params";
import {
  CategoryFilter,
  CategorySearchParams,
  CategorySearchResult,
  ICategoryRepository,
} from "../../../domain/category.repository";
import {
  CategoryOutput,
  CategoryOutputMapper,
} from "../shared/category-output.mapper";

export class ListCategoriesUseCase
  implements
    IUseCase<ListCategoriesUseCase.Input, ListCategoriesUseCase.Output>
{
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(
    input: ListCategoriesUseCase.Input
  ): Promise<ListCategoriesUseCase.Output> {
    const params = new CategorySearchParams(input);
    const result = await this.repository.search(params);
    return this.toOuput(result);
  }

  private toOuput(result: CategorySearchResult): ListCategoriesUseCase.Output {
    const { items: _items } = result;
    const items = _items.map((item) => CategoryOutputMapper.toOutput(item));
    return PaginatedOutputMapper.toOutput(items, result);
  }
}

export namespace ListCategoriesUseCase {
  export type Input = {
    page?: number;
    per_page?: number;
    sort?: string | null;
    sort_dir?: SortDirection | null;
    filter?: CategoryFilter | null;
  };

  export type Output = PaginatedOutput<CategoryOutput>;
}
