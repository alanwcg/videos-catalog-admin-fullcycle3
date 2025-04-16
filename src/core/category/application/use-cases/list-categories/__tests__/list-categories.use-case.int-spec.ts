import { setupSequelize } from '../../../../../shared/infra/testing/setup-sequelize.helper';
import { CategorySearchResult } from '../../../../domain/category.repository';
import { FakeCategoryBuilder } from '../../../../domain/fake-category.builder';
import { CategoryModel } from '../../../../infra/db/sequelize/category.model';
import { SequelizeCategoryRepository } from '../../../../infra/db/sequelize/sequelize-category.repository';
import { ListCategoriesUseCase } from '../list-categories.use-case';
import { CategoryOutputMapper } from '../../shared/category-output.mapper';

describe('ListCategoriesUseCase Integration Tests', () => {
  let useCase: ListCategoriesUseCase;
  let repository: SequelizeCategoryRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new SequelizeCategoryRepository(CategoryModel);
    useCase = new ListCategoriesUseCase(repository);
  });

  it('should return paginated output with items sorted by created_at when params are null', async () => {
    const categories = FakeCategoryBuilder.categories(2)
      .withCreatedAt((index) => new Date(new Date().getTime() + 1000 + index))
      .build();

    await repository.bulkInsert(categories);
    const output = await useCase.execute({});

    expect(output).toStrictEqual({
      items: [...categories].reverse().map(CategoryOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  it('should return paginated output using pagination, sort and filter', async () => {
    const categories = [
      FakeCategoryBuilder.category().withName('a').build(),
      FakeCategoryBuilder.category().withName('AAA').build(),
      FakeCategoryBuilder.category().withName('AaA').build(),
      FakeCategoryBuilder.category().withName('b').build(),
      FakeCategoryBuilder.category().withName('c').build(),
    ];
    await repository.bulkInsert(categories);

    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: 'a',
    });
    expect(output).toStrictEqual({
      items: [categories[1], categories[2]].map(CategoryOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 2,
      per_page: 2,
      sort: 'name',
      filter: 'a',
    });
    expect(output).toStrictEqual({
      items: [categories[0]].map(CategoryOutputMapper.toOutput),
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc',
      filter: 'a',
    });
    expect(output).toStrictEqual({
      items: [categories[0], categories[2]].map(CategoryOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });
  });
});
