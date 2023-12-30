import { FilterQuery, PipelineStage } from "mongoose";
import _ from "lodash";

interface Lookup {
  from: string;
  as: string;
  localField?: string;
  foreignField?: string;
  let?: Record<string, any>;
  pipeline?: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[];
}

export class AggregateBuilder {
  constructor(private pipeline: PipelineStage[] = []) {}

  build() {
    return this.pipeline;
  }

  addFields(payload: Record<string, unknown>) {
    this.pipeline.push({
      $addFields: payload,
    });
  }

  lookup(lookup: Lookup | Lookup[]) {
    if (!_.isArray(lookup)) {
      lookup = [lookup];
    }

    _.forEach(lookup, (lookupItem) => {
      this.pipeline.push({
        $lookup: lookupItem,
      });
    });

    return this;
  }

  match(filter: FilterQuery<unknown> | FilterQuery<unknown>[]) {
    if (!_.isArray(filter)) {
      filter = [filter];
    }

    _.forEach(filter, (filterItem) => {
      this.pipeline.push({
        $match: filterItem as FilterQuery<unknown>,
      });
    });

    return this;
  }

  sort(sort: FilterQuery<unknown>) {
    this.pipeline.push({
      $sort: sort,
    });

    return this;
  }

  project(project: { [field: string]: unknown }) {
    this.pipeline.push({
      $project: project,
    });

    return this;
  }

  static init() {
    return new AggregateBuilder();
  }
}
