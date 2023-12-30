import type {
  Aggregate,
  FilterQuery,
  Model,
  PipelineStage,
  UpdateQuery,
  QueryOptions,
  Query,
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

  async findOne<T>(filter: FilterQuery<T>) {
    return this.model.findOne(filter);
  }

  async update<T>(filter: FilterQuery<T>, update: UpdateQuery<T>) {
    return this.model.findOneAndUpdate(filter, update);
  }

  async remove<T>(id: string, options?: QueryOptions<T>) {
    return this.model.findByIdAndRemove();
  }

  async count<T>(filter: FilterQuery<T>) {
    return this.model.countDocuments(filter);
  }
}
