import { Op } from "sequelize";
import { EntityNotFoundError } from "../../../../shared/domain/errors/entity-not-found.error";
import { UUID } from "../../../../shared/domain/value-object/uuid.vo";
import { Category } from "../../../domain/category.entity";
import {
  CategorySearchParams,
  CategorySearchResult,
  ICategoryRepository,
} from "../../../domain/category.repository";
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
    const id = entity.category_id;
    await this._checkById(id);
    await this.categoryModel.update(
      {
        category_id: id.value,
        name: entity.name,
        description: entity.description,
        is_active: entity.is_active,
        created_at: entity.created_at,
      },
      { where: { category_id: id.value } }
    );
  }

  async delete(entity_id: UUID): Promise<void> {
    await this._checkById(entity_id);
    await this.categoryModel.destroy({
      where: { category_id: entity_id.value },
    });
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

  async search(params: CategorySearchParams): Promise<CategorySearchResult> {
    const offset = (params.page - 1) * params.per_page;
    const limit = params.per_page;
    const { rows: models, count } = await this.categoryModel.findAndCountAll({
      ...(params.filter && {
        where: {
          name: {
            [Op.like]: `%${params.filter}%`,
          },
        },
      }),
      ...(params.sort && this.sortableFields.includes(params.sort)
        ? { order: [[params.sort, params.sort_dir]] }
        : { order: [["created_at", "desc"]] }),
      offset,
      limit,
    });
    return new CategorySearchResult({
      items: models.map(
        (model) =>
          new Category({
            category_id: new UUID(model.category_id),
            name: model.name,
            description: model.description,
            is_active: model.is_active,
            created_at: model.created_at,
          })
      ),
      current_page: params.page,
      per_page: params.per_page,
      total: count,
    });
  }

  private async _checkById(id: UUID) {
    const model = await this.categoryModel.findByPk(id.value);
    if (!model) {
      throw new EntityNotFoundError(id, this.getEntity());
    }
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
