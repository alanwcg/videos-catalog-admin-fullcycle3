import { SearchResult } from '../domain/repository/search-result';

export type PaginatedOutput<Item = any> = {
  items: Item[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
};

export class PaginatedOutputMapper {
  static toOutput<Item = any>(
    items: Item[],
    params: Omit<SearchResult, 'items'>,
  ): PaginatedOutput {
    return {
      items,
      total: params.total,
      current_page: params.current_page,
      last_page: params.last_page,
      per_page: params.per_page,
    };
  }
}
