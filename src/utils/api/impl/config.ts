import { FileItemModel } from '@/ts/base/model';
import { IEnvironment, IRequestConfig, XRequestConfig } from '../types';
export default class RequestConfig implements IRequestConfig {
  config: XRequestConfig;

  constructor(config: XRequestConfig) {
    this.config = config;
  }

  replaceHolder(env?: IEnvironment): void {
    if (!env) {
      return;
    }
    this.config.axios = {
      ...this.config.axios,
      params: this.replace(this.config.axios.params, env),
      headers: this.replace(this.config.axios.headers, env),
      data: this.replace(this.config.axios.data, env),
    };
  }

  private replace(data: any, env: IEnvironment): any {
    let ansStr = JSON.stringify(data);
    Object.keys(env.parameters).forEach((key) => {
      ansStr = ansStr.replace(`{{${key}}}`, env.parameters[key]);
    });
    return JSON.parse(ansStr);
  }

  save(): FileItemModel {
    throw new Error('Method not implemented.');
  }
}
