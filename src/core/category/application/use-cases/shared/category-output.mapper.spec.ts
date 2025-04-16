import { FakeCategoryBuilder } from '../../../domain/fake-category.builder';
import { CategoryOutputMapper } from './category-output.mapper';

describe('CategoryOutputMapper Unit Tests', () => {
  it('should transform category in output', () => {
    const category = FakeCategoryBuilder.category()
      .withName('Movie')
      .withDescription('some description')
      .build();

    const toJSONSpy = jest.spyOn(category, 'toJSON');
    const output = CategoryOutputMapper.toOutput(category);
    expect(toJSONSpy).toHaveBeenCalled();
    expect(output).toStrictEqual({
      id: category.category_id.value,
      name: 'Movie',
      description: 'some description',
      is_active: true,
      created_at: category.created_at,
    });
  });
});
