import { Category } from "../../domain/category.entity";
import { CategoryInMemoryRepository } from "./category-in-memory.repository";

describe("CategoryInMemoryRepository Unit Tests", () => {
  let repo: CategoryInMemoryRepository;

  beforeEach(() => {
    repo = new CategoryInMemoryRepository();
  });

  it("should not filter items when filter param is null", async () => {
    const items = [Category.create({ name: "test " })];
    const filterMethodSpy = jest.spyOn(items, "filter");

    const filteredItems = await repo["applyFilter"]({ items, filter: null });
    expect(filterMethodSpy).not.toHaveBeenCalled();
    expect(filteredItems).toStrictEqual(items);
  });

  it("should filter items using filter param", async () => {
    const items = [
      new Category({ name: "test" }),
      new Category({ name: "TEST" }),
      new Category({ name: "fake" }),
    ];
    const filterMethodSpy = jest.spyOn(items, "filter");

    const filteredItems = await repo["applyFilter"]({ items, filter: "TEST" });
    expect(filterMethodSpy).toHaveBeenCalledTimes(1);
    expect(filteredItems).toStrictEqual([items[0], items[1]]);
  });

  it("should sort by created_at when sort param is null", async () => {
    const created_at = new Date();

    const items = [
      new Category({ name: "test", created_at }),
      new Category({
        name: "TEST",
        created_at: new Date(created_at.getTime() + 100),
      }),
      new Category({
        name: "test",
        created_at: new Date(created_at.getTime() + 200),
      }),
    ];

    const sortedItems = repo["applySort"]({
      items,
      sort: null,
      sort_dir: null,
    });
    expect(sortedItems).toStrictEqual([items[2], items[1], items[0]]);
  });

  it("should sort by name", async () => {
    const items = [
      Category.create({ name: "c" }),
      Category.create({ name: "b" }),
      Category.create({ name: "a" }),
    ];

    let sortedItems = repo["applySort"]({
      items,
      sort: "name",
      sort_dir: "asc",
    });
    expect(sortedItems).toStrictEqual([items[2], items[1], items[0]]);

    sortedItems = repo["applySort"]({ items, sort: "name", sort_dir: "desc" });
    expect(sortedItems).toStrictEqual([items[0], items[1], items[2]]);
  });
});
