import _ from "lodash";

export const getAttributes = (data: Record<string, any>, attrs: string[]) =>
  _.pick(data, attrs);
