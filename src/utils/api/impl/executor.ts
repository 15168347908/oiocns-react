import axios, { AxiosResponse } from 'axios';
import { IEnvironment, IRequestConfig, IRequestExecutor } from '../types';

export default class RequestExecutor implements IRequestExecutor {
  requestConfig: IRequestConfig;

  constructor(config: IRequestConfig) {
    this.requestConfig = config;
  }

  async exec(environment?: IEnvironment): Promise<AxiosResponse<any, any>> {
    if (environment) {
      this.requestConfig.replaceHolder(environment);
    }
    return await axios.request(this.requestConfig.config.axiosConfig);
  }
}
