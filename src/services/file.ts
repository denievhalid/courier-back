import { BaseService } from "@/services/base";
import { getModel } from "@/lib/container";
import { Models } from "@/types";

export class FileService extends BaseService {
  constructor() {
    super(getModel(Models.FILE));
  }
}
