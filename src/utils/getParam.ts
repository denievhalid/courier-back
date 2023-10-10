import _ from "lodash";

export const getParam = (params: Record<string, any>, name: string) => {
  return _.get(params, name);
};
