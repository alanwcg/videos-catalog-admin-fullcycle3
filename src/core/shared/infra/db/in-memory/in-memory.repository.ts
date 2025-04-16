import { Entity } from '../../../domain/entity';
import { EntityNotFoundError } from '../../../domain/errors/entity-not-found.error';
import {
  IRepository,
  ISearchableRepository,
} from '../../../domain/repository/repository-interface';
import { SearchParams } from '../../../domain/repository/search-params';
import { SearchResult } from '../../../domain/repository/search-result';
import { ValueObject } from '../../../domain/value-object';

export abstract class InMemoryRepository<
  E extends Entity,
  EntityID extends ValueObject,
> implements IRepository<E, EntityID>
{
  items: E[] = [];

  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }

  async bulkInsert(entities: E[]): Promise<void> {
    this.items.push(...entities);
  }

  async update(entity: E): Promise<void> {
    const index = this.items.findIndex((item) =>
      item.entity_id.equals(entity.entity_id),
    );
    if (index === -1) {
      throw new EntityNotFoundError(entity.entity_id, this.getEntity());
    }
    this.items[index] = entity;
  }

  async delete(entity_id: EntityID): Promise<void> {
    const index = this.items.findIndex((item) =>
      item.entity_id.equals(entity_id),
    );
    if (index === -1) {
      throw new EntityNotFoundError(entity_id, this.getEntity());
    }
    this.items.splice(index, 1);
  }

  async findById(entity_id: EntityID): Promise<E> {
    const item = this.items.find((item) => item.entity_id.equals(entity_id));
    return typeof item === undefined ? null : item;
  }

  async findAll(): Promise<E[]> {
    return this.items;
  }

  abstract getEntity(): new (...args: any[]) => E;
}

export type ApplyFilterParams<E, Filter> = {
  items: E[];
  filter: Filter | null;
};

export type ApplyPaginationParams<E> = {
  items: E[];
  page: SearchParams['page'];
  per_page: SearchParams['per_page'];
};

export type ApplySortParams<E> = {
  items: E[];
  sort: SearchParams['sort'];
  sort_dir: SearchParams['sort_dir'];
  custom_getter?: (sort: string, item: E) => any;
};

export abstract class InMemorySearchableRepository<
    E extends Entity,
    EntityID extends ValueObject,
    Filter = string,
  >
  extends InMemoryRepository<E, EntityID>
  implements ISearchableRepository<E, EntityID, Filter>
{
  sortableFields: string[];

  async search(params: SearchParams<Filter>): Promise<SearchResult<E>> {
    const { page, per_page, sort, sort_dir, filter } = params;

    const filteredItems = await this.applyFilter({ items: this.items, filter });

    const sortedItems = this.applySort({
      items: filteredItems,
      sort,
      sort_dir,
    });

    const paginatedItems = this.applyPagination({
      items: sortedItems,
      page,
      per_page,
    });

    return new SearchResult({
      items: paginatedItems,
      total: filteredItems.length,
      current_page: page,
      per_page,
    });
  }

  protected abstract applyFilter(
    params: ApplyFilterParams<E, Filter>,
  ): Promise<E[]>;

  protected applyPagination(params: ApplyPaginationParams<E>): E[] {
    const { items, page, per_page } = params;
    const start = (page - 1) * per_page; // 0 * 15 = 0
    const limit = start + per_page; // 0 + 15 = 15
    return items.slice(start, limit);
  }

  protected applySort(params: ApplySortParams<E>): E[] {
    const { items, sort, sort_dir, custom_getter } = params;

    if (!sort || !this.sortableFields.includes(sort)) {
      return items;
    }

    return [...items].sort((a, b) => {
      const aValue = custom_getter
        ? custom_getter(sort, a)
        : a[sort as keyof E];
      const bValue = custom_getter
        ? custom_getter(sort, b)
        : b[sort as keyof E];

      if (aValue < bValue) {
        return sort_dir === 'asc' ? -1 : 1;
      }

      if (aValue > bValue) {
        return sort_dir === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }
}
