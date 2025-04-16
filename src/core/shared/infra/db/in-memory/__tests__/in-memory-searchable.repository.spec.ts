import { Entity } from "../../../../domain/entity";
import { SearchParams } from "../../../../domain/repository/search-params";
import { SearchResult } from "../../../../domain/repository/search-result";
import { UUID } from "../../../../domain/value-object/uuid.vo";
import { InMemorySearchableRepository } from "../in-memory.repository";

type EntityStubConstructorProps = {
  entity_id?: UUID;
  name: string;
  price: number;
};

class EntityStub extends Entity {
  entity_id: UUID;
  name: string;
  price: number;

  constructor(props: EntityStubConstructorProps) {
    super();
    this.entity_id = props.entity_id ?? new UUID();
    this.name = props.name;
    this.price = props.price;
  }

  toJSON(): { id: string } & EntityStubConstructorProps {
    return {
      id: this.entity_id.value,
      name: this.name,
      price: this.price,
    };
  }
}

class InMemorySearchableRepositoryStub extends InMemorySearchableRepository<
  EntityStub,
  UUID
> {
  sortableFields: string[] = ["name"];

  protected async applyFilter(params: {
    items: EntityStub[];
    filter: string | null;
  }): Promise<EntityStub[]> {
    const { items, filter } = params;

    if (!filter) {
      return items;
    }

    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(filter.toLowerCase()) ||
        i.price.toString() === filter
    );
  }

  getEntity(): new (...args: any[]) => EntityStub {
    return EntityStub;
  }
}

describe("InMemorySearchableRepository Unit Tests", () => {
  let repo: InMemorySearchableRepositoryStub;

  beforeEach(() => {
    repo = new InMemorySearchableRepositoryStub();
  });

  describe("applyFilter method", () => {
    it("should not filter items when filter param is null", async () => {
      const items = [new EntityStub({ name: "name value", price: 10 })];
      const filterMethodSpy = jest.spyOn(items, "filter");
      const filteredItems = await repo["applyFilter"]({ items, filter: null });

      expect(filteredItems).toStrictEqual(items);
      expect(filterMethodSpy).not.toHaveBeenCalled();
    });

    it("should filter using a filter param", async () => {
      const items = [
        new EntityStub({ name: "test", price: 10 }),
        new EntityStub({ name: "TEST", price: 10 }),
        new EntityStub({ name: "fake", price: 0 }),
      ];

      const filterMethodSpy = jest.spyOn(items, "filter");

      let filteredItems = await repo["applyFilter"]({ items, filter: "TEST" });
      expect(filteredItems).toStrictEqual([items[0], items[1]]);
      expect(filterMethodSpy).toHaveBeenCalledTimes(1);

      filteredItems = await repo["applyFilter"]({ items, filter: "10" });
      expect(filteredItems).toStrictEqual([items[0], items[1]]);
      expect(filterMethodSpy).toHaveBeenCalledTimes(2);

      filteredItems = await repo["applyFilter"]({ items, filter: "no-filter" });
      expect(filteredItems).toHaveLength(0);
      expect(filterMethodSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe("applySort method", () => {
    it("should not sort items", () => {
      const items = [
        new EntityStub({ name: "b", price: 10 }),
        new EntityStub({ name: "a", price: 10 }),
      ];

      let sortedItems = repo["applySort"]({
        items,
        sort: null,
        sort_dir: null,
      });
      expect(sortedItems).toStrictEqual(items);

      sortedItems = repo["applySort"]({
        items,
        sort: "price",
        sort_dir: "asc",
      });
      expect(sortedItems).toStrictEqual(items);
    });

    it("should sort items", () => {
      const items = [
        new EntityStub({ name: "b", price: 10 }),
        new EntityStub({ name: "a", price: 10 }),
        new EntityStub({ name: "c", price: 10 }),
      ];

      let sortedItems = repo["applySort"]({
        items,
        sort: "name",
        sort_dir: "asc",
      });
      expect(sortedItems).toStrictEqual([items[1], items[0], items[2]]);

      sortedItems = repo["applySort"]({
        items,
        sort: "name",
        sort_dir: "desc",
      });
      expect(sortedItems).toStrictEqual([items[2], items[0], items[1]]);
    });
  });

  describe("applyPagination method", () => {
    it("should paginate items", () => {
      const items = [
        new EntityStub({ name: "a", price: 10 }),
        new EntityStub({ name: "b", price: 10 }),
        new EntityStub({ name: "c", price: 10 }),
        new EntityStub({ name: "d", price: 10 }),
        new EntityStub({ name: "e", price: 10 }),
      ];

      let paginatedItems = repo["applyPagination"]({
        items,
        page: 1,
        per_page: 2,
      });
      expect(paginatedItems).toStrictEqual([items[0], items[1]]);

      paginatedItems = repo["applyPagination"]({
        items,
        page: 2,
        per_page: 2,
      });
      expect(paginatedItems).toStrictEqual([items[2], items[3]]);

      paginatedItems = repo["applyPagination"]({
        items,
        page: 3,
        per_page: 2,
      });
      expect(paginatedItems).toStrictEqual([items[4]]);

      paginatedItems = repo["applyPagination"]({
        items,
        page: 4,
        per_page: 2,
      });
      expect(paginatedItems).toStrictEqual([]);
    });
  });

  describe("search method", () => {
    it("should apply only pagination when other params are null", async () => {
      const entity = new EntityStub({ name: "a", price: 10 });
      const items = Array(16).fill(entity);
      repo.items = items;

      const result = await repo.search(new SearchParams());
      expect(result).toStrictEqual(
        new SearchResult({
          items: Array(15).fill(entity),
          total: 16,
          current_page: 1,
          per_page: 15,
        })
      );
    });

    it("should apply pagination and filter", async () => {
      const items = [
        new EntityStub({ name: "test", price: 10 }),
        new EntityStub({ name: "a", price: 10 }),
        new EntityStub({ name: "TEST", price: 10 }),
        new EntityStub({ name: "TeSt", price: 10 }),
      ];
      repo.items = items;

      let result = await repo.search(
        new SearchParams({ page: 1, per_page: 2, filter: "TEST" })
      );
      expect(result).toStrictEqual(
        new SearchResult({
          items: [items[0], items[2]],
          total: 3,
          current_page: 1,
          per_page: 2,
        })
      );

      result = await repo.search(
        new SearchParams({ page: 2, per_page: 2, filter: "TEST" })
      );
      expect(result).toStrictEqual(
        new SearchResult({
          items: [items[3]],
          total: 3,
          current_page: 2,
          per_page: 2,
        })
      );
    });

    describe("should apply pagination and sort", () => {
      const items = [
        new EntityStub({ name: "b", price: 10 }),
        new EntityStub({ name: "a", price: 10 }),
        new EntityStub({ name: "d", price: 10 }),
        new EntityStub({ name: "e", price: 10 }),
        new EntityStub({ name: "c", price: 10 }),
      ];
      const arrange = [
        {
          search_params: new SearchParams({
            page: 1,
            per_page: 2,
            sort: "name",
          }),
          search_result: new SearchResult({
            items: [items[1], items[0]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: new SearchParams({
            page: 2,
            per_page: 2,
            sort: "name",
          }),
          search_result: new SearchResult({
            items: [items[4], items[2]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
        {
          search_params: new SearchParams({
            page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
          }),
          search_result: new SearchResult({
            items: [items[3], items[2]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: new SearchParams({
            page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
          }),
          search_result: new SearchResult({
            items: [items[4], items[0]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(() => {
        repo.items = items;
      });

      test.each(arrange)("%j", async ({ search_params, search_result }) => {
        const result = await repo.search(search_params);
        expect(result).toStrictEqual(search_result);
      });
    });

    describe("should search using filter, sort and pagination", () => {
      const items = [
        new EntityStub({ name: "test", price: 10 }),
        new EntityStub({ name: "a", price: 10 }),
        new EntityStub({ name: "TEST", price: 10 }),
        new EntityStub({ name: "e", price: 10 }),
        new EntityStub({ name: "TeSt", price: 10 }),
      ];

      const arrange = [
        {
          search_params: new SearchParams({
            page: 1,
            per_page: 2,
            sort: "name",
            filter: "TEST",
          }),
          search_result: new SearchResult({
            items: [items[2], items[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: new SearchParams({
            page: 2,
            per_page: 2,
            sort: "name",
            filter: "TEST",
          }),
          search_result: new SearchResult({
            items: [items[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(() => {
        repo.items = items;
      });

      test.each(arrange)("%j", async ({ search_params, search_result }) => {
        const result = await repo.search(search_params);
        expect(result).toStrictEqual(search_result);
      });
    });
  });
});
