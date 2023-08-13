import axios, { AxiosResponse } from 'axios';
import { IEnvironment, IRequestConfig, IRequestExecutor } from '../types';

export default class RequestExecutor implements IRequestExecutor {
  requestConfig: IRequestConfig;

  constructor(config: IRequestConfig) {
    this.requestConfig = config;
  }

  get axios() {
    return this.requestConfig.config.axios;
  }

  async exec(environment?: IEnvironment): Promise<AxiosResponse<any, any>> {
    console.log('axiosConfig', this.axios);
    if (environment) {
      this.requestConfig.replaceHolder(environment);
    }
    if (typeof this.axios.data == 'string') {
      this.axios.data = JSON.parse(this.axios.data);
    }
    this.axios.headers = {
      appid: 'zx678sw12qm1',
      nonce: '12345678910',
    };
    return await axios.request(this.axios);
  }
}
