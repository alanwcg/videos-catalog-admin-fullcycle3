import { Entity } from "../../../../shared/domain/entity";
import { SearchParams } from "../../../../shared/domain/repository/search-params";
import { SearchResult } from "../../../../shared/domain/repository/search-result";
import { UUID } from "../../../../shared/domain/value-object/uuid.vo";
import { Category } from "../../../domain/category.entity";
import { ICategoryRepository } from "../../../domain/category.repository";
import { CategoryModel } from "./category.model";

export class SequelizeCategoryRepository implements ICategoryRepository {
  sortableFields: string[] = ["name", "created_at"];

  constructor(private readonly categoryModel: typeof CategoryModel) {}

  async insert(entity: Category): Promise<void> {
    await this.categoryModel.create({
      category_id: entity.category_id.value,
      name: entity.name,
      description: entity.description,
      is_active: entity.is_active,
      created_at: entity.created_at,
    });
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    await this.categoryModel.bulkCreate(
      entities.map((entity) => ({
        category_id: entity.category_id.value,
        name: entity.name,
        description: entity.description,
        is_active: entity.is_active,
        created_at: entity.created_at,
      }))
    );
  }

  async update(entity: Category): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async delete(entity_id: UUID): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async findById(entity_id: UUID): Promise<Category> {
    const model = await this.categoryModel.findByPk(entity_id.value);
    return new Category({
      category_id: new UUID(model.category_id),
      name: model.name,
      description: model.description,
      is_active: model.is_active,
      created_at: model.created_at,
    });
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll();
    return models.map(
      (model) =>
        new Category({
          category_id: new UUID(model.category_id),
          name: model.name,
          description: model.description,
          is_active: model.is_active,
          created_at: model.created_at,
        })
    );
  }

  async search(input: SearchParams<string>): Promise<SearchResult<Entity>> {
    throw new Error("Method not implemented.");
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
