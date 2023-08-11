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
    this.config.axiosConfig = {
      ...this.config.axiosConfig,
      params: this.replace(this.config.axiosConfig.params, env),
      headers: this.replace(this.config.axiosConfig.headers, env),
      data: this.replace(this.config.axiosConfig.data, env),
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
