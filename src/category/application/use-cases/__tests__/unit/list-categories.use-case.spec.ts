import { CategorySearchResult } from "../../../../domain/category.repository";
import { FakeCategoryBuilder } from "../../../../domain/fake-category.builder";
import { InMemoryCategoryRepository } from "../../../../infra/db/in-memory/in-memory-category.repository";
import { ListCategoriesUseCase } from "../../list-categories.use-case";
import { CategoryOutputMapper } from "../../shared/category-output.mapper";

describe("ListCategoriesUseCase Unit Tests", () => {
  let useCase: ListCategoriesUseCase;
  let repository: InMemoryCategoryRepository;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new ListCategoriesUseCase(repository);
  });

  test("toOutput method", () => {
    let result = new CategorySearchResult({
      items: [],
      total: 1,
      current_page: 1,
      per_page: 2,
    });
    let output = useCase["toOuput"](result);
    expect(output).toStrictEqual({
      items: [],
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });

    const category = FakeCategoryBuilder.category().build();
    result = new CategorySearchResult({
      items: [category],
      total: 1,
      current_page: 1,
      per_page: 2,
    });
    output = useCase["toOuput"](result);
    expect(output).toStrictEqual({
      items: [category].map(CategoryOutputMapper.toOutput),
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });
  });

  it("should return paginated output with items sorted by created_at when params are null", async () => {
    const items = [
      FakeCategoryBuilder.category().build(),
      FakeCategoryBuilder.category()
        .withCreatedAt(new Date(new Date().getTime() + 1000))
        .build(),
    ];
    repository.items = items;

    const output = await useCase.execute({});
    expect(output).toStrictEqual({
      items: [...items].reverse().map(CategoryOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  it("should return paginated output using pagination, sort and filter", async () => {
    const items = [
      FakeCategoryBuilder.category().withName("a").build(),
      FakeCategoryBuilder.category().withName("AAA").build(),
      FakeCategoryBuilder.category().withName("AaA").build(),
      FakeCategoryBuilder.category().withName("b").build(),
      FakeCategoryBuilder.category().withName("c").build(),
    ];
    repository.items = items;

    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: "name",
      filter: "a",
    });
    expect(output).toStrictEqual({
      items: [items[1], items[2]].map(CategoryOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 2,
      per_page: 2,
      sort: "name",
      filter: "a",
    });
    expect(output).toStrictEqual({
      items: [items[0]].map(CategoryOutputMapper.toOutput),
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: "name",
      sort_dir: "desc",
      filter: "a",
    });
    expect(output).toStrictEqual({
      items: [items[0], items[2]].map(CategoryOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });
  });
});
