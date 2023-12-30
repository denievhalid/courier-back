import { FilterQuery, PipelineStage } from "mongoose";
import _ from "lodash";

export class AggregateBuilder {
  constructor(private pipeline: PipelineStage[] = []) {}

  build() {
    return this.pipeline;
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

  static init() {
    return new AggregateBuilder();
  }
}
