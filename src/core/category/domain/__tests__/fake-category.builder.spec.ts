import { Chance } from 'chance';
import { UUID } from '../../../shared/domain/value-object/uuid.vo';
import { Category } from '../category.entity';
import { FakeCategoryBuilder } from '../fake-category.builder';

describe('FakeCategoryBuilder Unit Tests', () => {
  describe('category_id prop', () => {
    const builder = FakeCategoryBuilder.category();

    it('should throw error when get method is called without withUUID', () => {
      expect(() => builder.category_id).toThrow(
        new Error(
          `Property category_id do not have a factory, use 'with' methods.`,
        ),
      );
    });

    it('should be undefined', () => {
      expect(builder['_category_id']).toBeUndefined();
    });

    test('withUUID method', () => {
      const category_id = new UUID();
      const $this = builder.withUUID(category_id);
      expect($this).toBeInstanceOf(FakeCategoryBuilder);
      expect(builder['_category_id']).toBe(category_id);
    });

    test('withUUID method with factory param', () => {
      let factoryMock = jest.fn(() => new UUID());
      builder.withUUID(factoryMock).build();
      expect(factoryMock).toHaveBeenCalledTimes(1);

      const category_id = new UUID();
      factoryMock = jest.fn(() => category_id);
      const fakeCategories = FakeCategoryBuilder.categories(2)
        .withUUID(factoryMock)
        .build() as Category[];
      expect(factoryMock).toHaveBeenCalledTimes(2);
      expect(fakeCategories[0].category_id).toBe(category_id);
      expect(fakeCategories[1].category_id).toBe(category_id);
    });
  });

  describe('name prop', () => {
    const builder = FakeCategoryBuilder.category();

    it('should be a function', () => {
      expect(typeof builder['_name']).toBe('function');
    });

    it('should call chance.word() method', () => {
      const chance = Chance();
      const wordMethodSpy = jest.spyOn(chance, 'word');
      builder['chance'] = chance;
      builder.build();

      expect(wordMethodSpy).toHaveBeenCalled();
    });

    test('withName method', () => {
      const $this = builder.withName('name');
      expect($this).toBeInstanceOf(FakeCategoryBuilder);
      expect(builder['_name']).toBe('name');

      const nameFactory = () => 'name2';
      builder.withName(nameFactory);
      expect(builder['_name']).toBe(nameFactory);
      expect(builder.name).toBe('name2');
    });

    it('should pass index to name factory', () => {
      builder.withName((index) => `name${index}`);
      const category = builder.build() as Category;
      expect(category.name).toBe('name0');

      const fakeCategories = FakeCategoryBuilder.categories(2)
        .withName((index) => `name${index}`)
        .build() as Category[];
      expect(fakeCategories[0].name).toBe('name0');
      expect(fakeCategories[1].name).toBe('name1');
    });

    test('withNameTooLong', () => {
      const $this = builder.withNameTooLong();
      expect($this).toBeInstanceOf(FakeCategoryBuilder);
      expect(builder['_name'].length).toBe(256);

      const longName = 'a'.repeat(500);
      builder.withNameTooLong(longName);
      expect(builder['_name'].length).toBe(500);
      expect(builder['_name']).toBe(longName);
    });
  });

  describe('description prop', () => {
    const builder = FakeCategoryBuilder.category();

    it('should be a function', () => {
      expect(typeof builder['_description']).toBe('function');
    });

    it('should call chance.paragraph() method', () => {
      const chance = Chance();
      const paragraphMethodSpy = jest.spyOn(chance, 'paragraph');
      builder['chance'] = chance;
      builder.build();
      expect(paragraphMethodSpy).toHaveBeenCalled();
    });

    test('withDescription method', () => {
      const $this = builder.withDescription('description');
      expect($this).toBeInstanceOf(FakeCategoryBuilder);
      expect(builder['_description']).toBe('description');

      const descriptionFactory = () => 'description2';
      builder.withDescription(descriptionFactory);
      expect(builder['_description']).toBe(descriptionFactory);
      expect(builder.description).toBe('description2');
    });

    it('should pass index to description factory', () => {
      builder.withDescription((index) => `description${index}`);
      const fakeCategory = builder.build() as Category;
      expect(fakeCategory.description).toBe('description0');

      const fakeCategories = FakeCategoryBuilder.categories(2)
        .withDescription((index) => `description${index}`)
        .build() as Category[];
      expect(fakeCategories[0].description).toBe('description0');
      expect(fakeCategories[1].description).toBe('description1');
    });
  });

  describe('is_active prop', () => {
    const builder = FakeCategoryBuilder.category();

    it('should be a function', () => {
      expect(typeof builder['_is_active']).toBe('function');
    });

    test('active method', () => {
      const $this = builder.active();
      expect($this).toBeInstanceOf(FakeCategoryBuilder);
      expect(builder['_is_active']).toBe(true);
      expect(builder.is_active).toBe(true);
    });

    test('notActive method', () => {
      const $this = builder.notActive();
      expect($this).toBeInstanceOf(FakeCategoryBuilder);
      expect(builder['_is_active']).toBe(false);
      expect(builder.is_active).toBe(false);
    });
  });

  describe('created_at prop', () => {
    const builder = FakeCategoryBuilder.category();

    it('should throw error when get method is called without withCreatedAt', () => {
      expect(() => builder.created_at).toThrow(
        new Error(
          `Property created_at do not have a factory, use 'with' methods.`,
        ),
      );
    });

    it('should be undefined', () => {
      expect(builder['_created_at']).toBeUndefined();
    });

    test('withCreatedAt method', () => {
      const date = new Date();
      const $this = builder.withCreatedAt(date);
      expect($this).toBeInstanceOf(FakeCategoryBuilder);
      expect(builder['_created_at']).toBe(date);

      const dateFactory = () => date;
      builder.withCreatedAt(dateFactory);
      expect(builder['_created_at']).toBe(dateFactory);
      expect(builder.created_at).toBe(date);
    });

    it('should pass index to created_at factory', () => {
      const date = new Date();
      builder.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const category = builder.build() as Category;
      expect(category.created_at.getTime()).toBe(date.getTime() + 2);

      const fakeCategories = FakeCategoryBuilder.categories(2)
        .withCreatedAt((index) => new Date(date.getTime() + index + 2))
        .build() as Category[];

      expect(fakeCategories[0].created_at.getTime()).toBe(date.getTime() + 2);
      expect(fakeCategories[1].created_at.getTime()).toBe(date.getTime() + 3);
    });
  });

  it('should create a category', () => {
    const builder = FakeCategoryBuilder.category();
    let category = builder.build() as Category;

    expect(category.category_id).toBeInstanceOf(UUID);
    expect(typeof category.name === 'string').toBeTruthy();
    expect(typeof category.description === 'string').toBeTruthy();
    expect(category.is_active).toBe(true);
    expect(category.created_at).toBeInstanceOf(Date);

    const created_at = new Date();
    const category_id = new UUID();
    category = builder
      .withUUID(category_id)
      .withName('name')
      .withDescription('description')
      .notActive()
      .withCreatedAt(created_at)
      .build() as Category;

    expect(category.category_id.value).toBe(category_id.value);
    expect(category.name).toBe('name');
    expect(category.description).toBe('description');
    expect(category.is_active).toBe(false);
    expect(category.created_at).toBe(created_at);
  });

  it('should create categories', () => {
    const builder = FakeCategoryBuilder.categories(2);
    let categories = builder.build() as Category[];

    categories.forEach((category) => {
      expect(category.category_id).toBeInstanceOf(UUID);
      expect(typeof category.name === 'string').toBeTruthy();
      expect(typeof category.description === 'string').toBeTruthy();
      expect(category.is_active).toBe(true);
      expect(category.created_at).toBeInstanceOf(Date);
    });

    const created_at = new Date();
    const category_id = new UUID();
    categories = builder
      .withUUID(category_id)
      .withName('name')
      .withDescription('description')
      .notActive()
      .withCreatedAt(created_at)
      .build() as Category[];

    categories.forEach((category) => {
      expect(category.category_id.value).toBe(category_id.value);
      expect(category.name).toBe('name');
      expect(category.description).toBe('description');
      expect(category.is_active).toBe(false);
      expect(category.created_at).toBe(created_at);
    });
  });
});
