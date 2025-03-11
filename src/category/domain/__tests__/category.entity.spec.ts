import { EntityValidationError } from "../../../shared/domain/validators/validation.error";
import { UUID } from "../../../shared/domain/value-object/uuid.vo";
import { Category } from "../category.entity";

describe("Category Entity Unit Tests", () => {
  let validateSpy: any;
  beforeEach(() => {
    validateSpy = jest.spyOn(Category, "validate");
  });

  describe("Constructor", () => {
    it("should create a category with default values", () => {
      const category = new Category({
        name: "Movie",
      });

      expect(category.category_id).toBeInstanceOf(UUID);
      expect(category.name).toBe("Movie");
      expect(category.description).toBeNull();
      expect(category.is_active).toBeTruthy();
      expect(category.created_at).toBeInstanceOf(Date);
    });
    it("should create a category with all values", () => {
      const created_at = new Date();
      const category = new Category({
        name: "Movie",
        description: "Movie description",
        is_active: false,
        created_at,
      });

      expect(category.category_id).toBeInstanceOf(UUID);
      expect(category.name).toBe("Movie");
      expect(category.description).toBe("Movie description");
      expect(category.is_active).toBeFalsy();
      expect(category.created_at).toBe(created_at);
    });
    it("should create a category with name and description", () => {
      const category = new Category({
        name: "Movie",
        description: "Movie description",
      });

      expect(category.category_id).toBeInstanceOf(UUID);
      expect(category.name).toBe("Movie");
      expect(category.description).toBe("Movie description");
      expect(category.is_active).toBeTruthy();
      expect(category.created_at).toBeInstanceOf(Date);
    });
  });

  describe("create command", () => {
    it("should create a category with default values", () => {
      const category = Category.create({
        name: "Movie",
      });

      expect(category.category_id).toBeInstanceOf(UUID);
      expect(category.name).toBe("Movie");
      expect(category.description).toBeNull();
      expect(category.is_active).toBe(true);
      expect(category.created_at).toBeInstanceOf(Date);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    it("should create a category with description", () => {
      const category = Category.create({
        name: "Movie",
        description: "some description",
      });

      expect(category.category_id).toBeInstanceOf(UUID);
      expect(category.name).toBe("Movie");
      expect(category.description).toBe("some description");
      expect(category.is_active).toBe(true);
      expect(category.created_at).toBeInstanceOf(Date);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    it("should create a category with is_active", () => {
      const category = Category.create({
        name: "Movie",
        is_active: false,
      });

      expect(category.category_id).toBeInstanceOf(UUID);
      expect(category.name).toBe("Movie");
      expect(category.description).toBeNull();
      expect(category.is_active).toBe(false);
      expect(category.created_at).toBeInstanceOf(Date);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("category_id field", () => {
    const arrange = [
      { category_id: null },
      { category_id: undefined },
      { category_id: new UUID() },
    ];

    test.each(arrange)("id = %j", ({ category_id }) => {
      const category = new Category({
        category_id: category_id as any,
        name: "Movie",
      });
      expect(category.category_id).toBeInstanceOf(UUID);
      if (category_id instanceof UUID) {
        expect(category.category_id.equals(category_id)).toBe(true);
        expect(category.category_id.value).toBe(category_id.value);
      }
    });
  });

  it("should change name", () => {
    const category = Category.create({
      name: "Movie",
    });

    category.changeName("other name");

    expect(category.name).toBe("other name");
    expect(validateSpy).toHaveBeenCalledTimes(2);
  });

  it("should change description", () => {
    const category = Category.create({
      name: "Movie",
    });

    category.changeDescription("some description");

    expect(category.description).toBe("some description");
    expect(validateSpy).toHaveBeenCalledTimes(2);
  });

  it("should activate a category", () => {
    const category = new Category({
      name: "Movie",
      is_active: false,
    });

    category.activate();

    expect(category.is_active).toBe(true);
  });

  it("should deactivate a category", () => {
    const category = new Category({
      name: "Movie",
      is_active: true,
    });

    category.deactivate();

    expect(category.is_active).toBe(false);
  });
});

describe("Category Validator Tests", () => {
  describe("create command", () => {
    it("should invalidate category entity with invalid name", () => {
      expect(() => Category.create({ name: null })).toContainErrorsMessages({
        name: [
          "name should not be empty",
          "name must be a string",
          "name must be shorter than or equal to 255 characters",
        ],
      });

      expect(() => Category.create({ name: "" })).toContainErrorsMessages({
        name: ["name should not be empty"],
      });

      expect(() => Category.create({ name: 5 as any })).toContainErrorsMessages(
        {
          name: [
            "name must be a string",
            "name must be shorter than or equal to 255 characters",
          ],
        }
      );

      expect(() =>
        Category.create({ name: "t".repeat(256) })
      ).toContainErrorsMessages({
        name: ["name must be shorter than or equal to 255 characters"],
      });
    });

    it("should invalidate category entity with invalid description", () => {
      expect(() =>
        Category.create({ name: "Movie", description: 5 as any })
      ).toContainErrorsMessages({
        description: ["description must be a string"],
      });
    });

    it("should invalidate category entity with invalid is_active", () => {
      expect(() =>
        Category.create({ name: "Movie", is_active: 5 as any })
      ).toContainErrorsMessages({
        is_active: ["is_active must be a boolean value"],
      });
    });
  });

  describe("changeName method", () => {
    it("should invalidate category entity with invalid name", () => {
      const category = Category.create({ name: "Movie" });
      expect(() => category.changeName(null)).toContainErrorsMessages({
        name: [
          "name should not be empty",
          "name must be a string",
          "name must be shorter than or equal to 255 characters",
        ],
      });

      expect(() => category.changeName("")).toContainErrorsMessages({
        name: ["name should not be empty"],
      });

      expect(() => category.changeName(5 as any)).toContainErrorsMessages({
        name: [
          "name must be a string",
          "name must be shorter than or equal to 255 characters",
        ],
      });

      expect(
        () => () => category.changeName("t".repeat(256))
      ).toContainErrorsMessages({
        name: ["name must be shorter than or equal to 255 characters"],
      });
    });
  });

  describe("changeDescription method", () => {
    it("should invalidate category entity with invalid description", () => {
      const category = Category.create({ name: "Movie" });
      expect(() =>
        category.changeDescription(5 as any)
      ).toContainErrorsMessages({
        description: ["description must be a string"],
      });
    });
  });
});
