import { FakeCategoryBuilder } from '../../../domain/fake-category.builder';
import { InMemoryCategoryRepository } from './in-memory-category.repository';

describe('InMemoryCategoryRepository Unit Tests', () => {
  let repo: InMemoryCategoryRepository;

  beforeEach(() => {
    repo = new InMemoryCategoryRepository();
  });

  it('should not filter items when filter param is null', async () => {
    const items = [FakeCategoryBuilder.category().build()];
    const filterMethodSpy = jest.spyOn(items, 'filter');

    const filteredItems = await repo['applyFilter']({ items, filter: null });
    expect(filterMethodSpy).not.toHaveBeenCalled();
    expect(filteredItems).toStrictEqual(items);
  });

  it('should filter items using filter param', async () => {
    const items = [
      FakeCategoryBuilder.category().withName('test').build(),
      FakeCategoryBuilder.category().withName('TEST').build(),
      FakeCategoryBuilder.category().withName('fake').build(),
    ];
    const filterMethodSpy = jest.spyOn(items, 'filter');

    const filteredItems = await repo['applyFilter']({ items, filter: 'TEST' });
    expect(filterMethodSpy).toHaveBeenCalledTimes(1);
    expect(filteredItems).toStrictEqual([items[0], items[1]]);
  });

  it('should sort by created_at when sort param is null', async () => {
    const created_at = new Date();

    const items = [
      FakeCategoryBuilder.category()
        .withName('test')
        .withCreatedAt(created_at)
        .build(),
      FakeCategoryBuilder.category()
        .withName('TEST')
        .withCreatedAt(new Date(created_at.getTime() + 100))
        .build(),
      FakeCategoryBuilder.category()
        .withName('test')
        .withCreatedAt(new Date(created_at.getTime() + 200))
        .build(),
    ];

    const sortedItems = repo['applySort']({
      items,
      sort: null,
      sort_dir: null,
    });
    expect(sortedItems).toStrictEqual([items[2], items[1], items[0]]);
  });

  it('should sort by name', async () => {
    const items = [
      FakeCategoryBuilder.category().withName('c').build(),
      FakeCategoryBuilder.category().withName('b').build(),
      FakeCategoryBuilder.category().withName('a').build(),
    ];

    let sortedItems = repo['applySort']({
      items,
      sort: 'name',
      sort_dir: 'asc',
    });
    expect(sortedItems).toStrictEqual([items[2], items[1], items[0]]);

    sortedItems = repo['applySort']({ items, sort: 'name', sort_dir: 'desc' });
    expect(sortedItems).toStrictEqual([items[0], items[1], items[2]]);
  });
});
