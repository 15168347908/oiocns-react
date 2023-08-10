import axios, { AxiosResponse } from 'axios';
import { IEnvironment, IRequestConfig, IRequestExecutor } from '../types';

export default class RequestExecutor implements IRequestExecutor {
  config: IRequestConfig;

  constructor(config: IRequestConfig) {
    this.config = config;
  }

  async exec(environment?: IEnvironment): Promise<AxiosResponse<any, any>> {
    if (environment) {
      this.config.replaceHolder(environment);
    }
    return await axios.request(this.config.config);
  }
}
