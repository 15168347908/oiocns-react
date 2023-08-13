import { Controller } from '@/ts/controller';
import ConfigProvider from '../impl/provider';

class ApiController extends Controller {
  readonly provider: ConfigProvider;
  constructor() {
    super('');
    this.provider = new ConfigProvider();
  }
}

export default new ApiController();
