import _ from "lodash";

export const getAttributes = (data: Record<string, any>) =>
  _.pick(data, ["sort"]);
