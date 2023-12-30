import type {
  Aggregate,
  FilterQuery,
  Model,
  PipelineStage,
  UpdateQuery,
  QueryOptions,
  QueryWithHelpers,
} from "mongoose";

export class BaseService {
  public model: Model<any>;

  constructor(model: Model<any>) {
    this.model = model;
  }

  async aggregate<T>(pipeline: PipelineStage[]): Promise<Aggregate<Array<T>>> {
    return this.model.aggregate(pipeline);
  }

  async create<T>(payload: T) {
    return this.model.create(payload);
  }

  async find<T>(filter: FilterQuery<T>) {
    return this.model.find(filter);
  }

  findOne<T>(filter: FilterQuery<T>) {
    return this.model.findOne(filter);
  }

  async exists<T>(filter: FilterQuery<T>): Promise<boolean> {
    return Boolean(await this.model.count(filter));
  }

  async update<T>(filter: FilterQuery<T>, update: UpdateQuery<T>) {
    return this.model.findOneAndUpdate(filter, update);
  }

  async remove<T>(filter: FilterQuery<T>, options?: QueryOptions<T>) {
    return this.model.findOneAndRemove(filter, options);
  }

  async count<T>(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter);
  }
}
