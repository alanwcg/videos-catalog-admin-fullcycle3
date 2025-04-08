import { Sequelize } from "sequelize-typescript";
import { SequelizeCategoryRepository } from "../sequelize-category.repository";
import { CategoryModel } from "../category.model";
import { UUID } from "../../../../../shared/domain/value-object/uuid.vo";
import { FakeCategoryBuilder } from "../../../../domain/fake-category.builder";
import { EntityNotFoundError } from "../../../../../shared/domain/errors/entity-not-found.error";
import { Category } from "../../../../domain/category.entity";
import { CategoryModelMapper } from "../category-model.mapper";
import {
  CategorySearchParams,
  CategorySearchResult,
} from "../../../../domain/category.repository";

describe("SequelizeCategoryRepository Integration Tests", () => {
  let sequelize: Sequelize;
  let repository: SequelizeCategoryRepository;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      models: [CategoryModel],
      logging: false,
    });
    await sequelize.sync({ force: true });
    repository = new SequelizeCategoryRepository(CategoryModel);
  });

  it("should insert a new category", async () => {
    let category = FakeCategoryBuilder.category().build();

    await repository.insert(category);
    let entity = await CategoryModel.findByPk(category.category_id.value);

    expect(entity.toJSON()).toStrictEqual(category.toJSON());
  });

  it("should return null if a category is not found by ID", async () => {
    let category = await repository.findById(new UUID());

    expect(category).toBeNull();
  });

  it("should find a category by id", async () => {
    const category = FakeCategoryBuilder.category().build();

    await CategoryModel.create(category.toJSON());
    const foundCategory = await repository.findById(category.category_id);

    expect(foundCategory.toJSON()).toStrictEqual(category.toJSON());
  });

  it("should find all categories", async () => {
    const category = FakeCategoryBuilder.category().build();

    await CategoryModel.create(category.toJSON());
    const categories = await repository.findAll();

    expect(categories).toHaveLength(1);
    expect(categories[0].toJSON()).toStrictEqual(category.toJSON());
  });

  it("should throw error on update when category is not found", async () => {
    const category = FakeCategoryBuilder.category().build();
    const promise = repository.update(category);
    await expect(promise).rejects.toThrow(
      new EntityNotFoundError(category.category_id, Category)
    );
  });

  it("should update a category", async () => {
    const category = FakeCategoryBuilder.category().build();

    await CategoryModel.create(category.toJSON());
    category.changeName("Name updated");
    await repository.update(category);
    const updatedCategory = await CategoryModel.findByPk(
      category.category_id.value
    );

    expect(category.toJSON()).toStrictEqual(updatedCategory.toJSON());
    expect(updatedCategory.name).toBe("Name updated");
  });

  it("should throw error on delete when category is not found", async () => {
    const categoryID = new UUID();
    const promise = repository.delete(categoryID);
    await expect(promise).rejects.toThrow(
      new EntityNotFoundError(categoryID, Category)
    );
  });

  it("should delete a category", async () => {
    const category = FakeCategoryBuilder.category().build();

    await CategoryModel.create(category.toJSON());
    await repository.delete(category.category_id);

    const promise = CategoryModel.findByPk(category.category_id.value);
    await expect(promise).resolves.toBeNull();
  });

  describe("search method tests", () => {
    beforeEach(async () => {
      await sequelize.sync({ force: true });
      repository = new SequelizeCategoryRepository(CategoryModel);
    });

    it("should apply only pagination when other params are null", async () => {
      const created_at = new Date();
      const categories = FakeCategoryBuilder.categories(16)
        .withName("Movie")
        .withDescription(null)
        .withCreatedAt(created_at)
        .build();
      await repository.bulkInsert(categories);
      const toEntitySpy = jest.spyOn(CategoryModelMapper, "toEntity");
      const searchResult = await repository.search(new CategorySearchParams());
      expect(toEntitySpy).toHaveBeenCalledTimes(15);
      expect(searchResult).toBeInstanceOf(CategorySearchResult);
      expect(searchResult.toJSON()).toMatchObject({
        total: 16,
        current_page: 1,
        last_page: 2,
        per_page: 15,
      });
      searchResult.items.forEach((item) => {
        expect(item).toBeInstanceOf(Category);
        expect(item.category_id).toBeDefined();
      });
      const items = searchResult.items.map((item) => item.toJSON());
      expect(items).toMatchObject(
        new Array(15).fill({
          name: "Movie",
          description: null,
          is_active: true,
          created_at,
        })
      );
    });

    it("should order by created_at DESC when search params are null", async () => {
      const created_at = new Date();
      const categories = FakeCategoryBuilder.categories(16)
        .withName((index) => `Movie${index}`)
        .withDescription(null)
        .withCreatedAt((index) => new Date(created_at.getTime() + index))
        .build();
      console.log("categories[0]", categories[0].name);
      await repository.bulkInsert(categories);
      const searchResult = await repository.search(new CategorySearchParams());
      const items = searchResult.items;
      [...items].reverse().forEach((item, index) => {
        expect(item.name).toBe(`${categories[index + 1].name}`);
      });
    });

    it("should apply pagination and filter", async () => {
      const categories = [
        FakeCategoryBuilder.category()
          .withName("test")
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        FakeCategoryBuilder.category()
          .withName("a")
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        FakeCategoryBuilder.category()
          .withName("TEST")
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        FakeCategoryBuilder.category()
          .withName("TeSt")
          .withCreatedAt(new Date(new Date().getTime() + 2000))
          .build(),
      ];

      await repository.bulkInsert(categories);

      let searchResult = await repository.search(
        new CategorySearchParams({
          page: 1,
          per_page: 2,
          filter: "TEST",
        })
      );
      expect(searchResult.toJSON(true)).toMatchObject(
        new CategorySearchResult({
          items: [categories[0], categories[2]],
          total: 3,
          current_page: 1,
          per_page: 2,
        }).toJSON(true)
      );

      searchResult = await repository.search(
        new CategorySearchParams({
          page: 2,
          per_page: 2,
          filter: "TEST",
        })
      );
      expect(searchResult.toJSON(true)).toMatchObject(
        new CategorySearchResult({
          items: [categories[3]],
          total: 3,
          current_page: 2,
          per_page: 2,
        }).toJSON(true)
      );
    });

    describe("should apply pagination and sort", () => {
      const categories = [
        FakeCategoryBuilder.category().withName("b").build(),
        FakeCategoryBuilder.category().withName("a").build(),
        FakeCategoryBuilder.category().withName("d").build(),
        FakeCategoryBuilder.category().withName("e").build(),
        FakeCategoryBuilder.category().withName("c").build(),
      ];

      const arrange = [
        {
          params: new CategorySearchParams({
            page: 1,
            per_page: 2,
            sort: "name",
          }),
          result: new CategorySearchResult({
            items: [categories[1], categories[0]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 2,
            per_page: 2,
            sort: "name",
          }),
          result: new CategorySearchResult({
            items: [categories[4], categories[2]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
          }),
          result: new CategorySearchResult({
            items: [categories[3], categories[2]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
          }),
          result: new CategorySearchResult({
            items: [categories[4], categories[0]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(categories);
      });

      test("sortable fields", () => {
        expect(repository.sortableFields).toStrictEqual(["name", "created_at"]);
      });

      test.each(arrange)(
        "when value is $params",
        async ({ params, result }) => {
          const searchResult = await repository.search(params);
          expect(searchResult.toJSON(true)).toMatchObject(result.toJSON(true));
        }
      );
    });

    describe("should search using filter, sort and pagination", () => {
      const categories = [
        FakeCategoryBuilder.category().withName("test").build(),
        FakeCategoryBuilder.category().withName("a").build(),
        FakeCategoryBuilder.category().withName("TEST").build(),
        FakeCategoryBuilder.category().withName("e").build(),
        FakeCategoryBuilder.category().withName("TeSt").build(),
      ];

      const arrange = [
        {
          params: new CategorySearchParams({
            page: 1,
            per_page: 2,
            sort: "name",
            filter: "TEST",
          }),
          result: new CategorySearchResult({
            items: [categories[2], categories[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 2,
            per_page: 2,
            sort: "name",
            filter: "TEST",
          }),
          result: new CategorySearchResult({
            items: [categories[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(categories);
      });

      test.each(arrange)(
        "when value is $params",
        async ({ params, result }) => {
          const searchResult = await repository.search(params);
          expect(searchResult.toJSON(true)).toMatchObject(result.toJSON(true));
        }
      );
    });
  });
});
