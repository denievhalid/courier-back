import { BaseService } from "@/services/base";
import { getModel } from "@/lib/container";
import { Models } from "@/types";

export class UserService extends BaseService {
  constructor() {
    super(getModel(Models.USER));
  }
}
