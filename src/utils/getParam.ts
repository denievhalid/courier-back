import _ from "lodash";
import { DataType } from "@/const";

export const getParam = (
  params: Record<string, any>,
  name: string,
  type?: keyof typeof DataType
) => {
  let param = _.get(params, name);

  switch (type) {
    case DataType.number:
      param = Number(param);
      break;
    case DataType.string:
      param = String(param);
      break;
  }

  return param;
};
