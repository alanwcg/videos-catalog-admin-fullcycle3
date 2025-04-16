import { Chance } from 'chance';
import { UUID } from '../../shared/domain/value-object/uuid.vo';
import { Category } from './category.entity';
import _ from 'lodash';

type ValueOrFactory<T> = T | ((index: number) => T);

export class FakeCategoryBuilder<TBuild> {
  // auto generated in entity
  private _category_id: ValueOrFactory<UUID> | undefined = undefined;
  private _name: ValueOrFactory<string> = (_index) => this.chance.word();
  private _description: ValueOrFactory<string | null> = (_index) =>
    this.chance.paragraph();
  private _is_active: ValueOrFactory<boolean> = (_index) => true;
  // auto generated in entity
  private _created_at: ValueOrFactory<Date> | undefined = undefined;

  private chance: Chance.Chance;
  private objsCount: number;

  private constructor(objsCount: number = 1) {
    this.objsCount = objsCount;
    this.chance = Chance();
  }

  static category() {
    return new FakeCategoryBuilder<Category>();
  }

  static categories(objsCount: number) {
    return new FakeCategoryBuilder<Category[]>(objsCount);
  }

  withUUID(valueOrFactory: ValueOrFactory<UUID>) {
    this._category_id = valueOrFactory;
    return this;
  }

  withName(valueOrFactory: ValueOrFactory<string>) {
    this._name = valueOrFactory;
    return this;
  }

  withDescription(valueOrFactory: ValueOrFactory<string | null>) {
    this._description = valueOrFactory;
    return this;
  }

  active() {
    this._is_active = true;
    return this;
  }

  notActive() {
    this._is_active = false;
    return this;
  }

  withCreatedAt(valueOrFactory: ValueOrFactory<Date>) {
    this._created_at = valueOrFactory;
    return this;
  }

  withNameTooLong(value?: string) {
    this._name = value ?? this.chance.word({ length: 256 });
    return this;
  }

  build(): TBuild {
    const categories = new Array(this.objsCount)
      .fill(undefined)
      .map((_, index) => {
        const category = new Category({
          category_id: !this._category_id
            ? undefined
            : this.callFactory(this._category_id, index),
          name: this.callFactory(this._name, index),
          description: this.callFactory(this._description, index),
          is_active: this.callFactory(this._is_active, index),
          ...(this._created_at && {
            created_at: this.callFactory(this._created_at, index),
          }),
        });
        category.validate();
        return category;
      });
    return (this.objsCount === 1 ? categories[0] : categories) as TBuild;
  }

  private callFactory(valueOrFactory: ValueOrFactory<any>, index: number) {
    return typeof valueOrFactory === 'function'
      ? valueOrFactory(index)
      : valueOrFactory;
  }

  private getValue(prop: string) {
    const optional = ['category_id', 'created_at'];
    const privateProp = `_${prop}` as keyof this;
    if (!this[privateProp] && optional.includes(prop)) {
      throw new Error(
        `Property ${prop} do not have a factory, use 'with' methods.`,
      );
    }
    return this.callFactory(this[privateProp], 0);
  }

  get category_id() {
    return this.getValue('category_id');
  }

  get name() {
    return this.getValue('name');
  }

  get description() {
    return this.getValue('description');
  }

  get is_active() {
    return this.getValue('is_active');
  }

  get created_at() {
    return this.getValue('created_at');
  }
}
