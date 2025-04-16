import { UUID } from '../../../../shared/domain/value-object/uuid.vo';
import {
  ApplyFilterParams,
  ApplySortParams,
  InMemorySearchableRepository,
} from '../../../../shared/infra/db/in-memory/in-memory.repository';
import { Category } from '../../../domain/category.entity';
import {
  CategoryFilter,
  ICategoryRepository,
} from '../../../domain/category.repository';

export class InMemoryCategoryRepository
  extends InMemorySearchableRepository<Category, UUID>
  implements ICategoryRepository
{
  sortableFields: string[] = ['name', 'created_at'];

  protected async applyFilter(
    params: ApplyFilterParams<Category, CategoryFilter>,
  ): Promise<Category[]> {
    const { items, filter } = params;

    if (!filter) {
      return items;
    }

    return items.filter((i) =>
      i.name.toLowerCase().includes(filter.toLowerCase()),
    );
  }

  protected applySort(params: ApplySortParams<Category>): Category[] {
    const { items, sort, sort_dir } = params;

    return sort
      ? super.applySort({ items, sort, sort_dir })
      : super.applySort({ items, sort: 'created_at', sort_dir: 'desc' });
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
