import { AxiosRequestConfig } from 'axios';
import { IEnvironment, IRequestConfig } from '../types';

export default class RequestConfig implements IRequestConfig {
  config: AxiosRequestConfig;

  constructor(axiosConfig: AxiosRequestConfig<any>) {
    this.config = axiosConfig;
  }

  replaceHolder(env: IEnvironment): void {
    if (!env) {
      return;
    }
    let targets: { [key: string]: any } = {
      params: this.config.params,
      headers: this.config.headers,
      data: this.config.data,
    };
    let replaced = this.replace(targets, env);
    Object.keys(replaced).forEach((key) => (this.config[key] = targets[key]));
  }

  private replace(
    targets: { [key: string]: any },
    env: IEnvironment,
  ): { [key: string]: any } {
    let replaced: { [key: string]: any } = {};
    Object.keys(targets)
      .filter((item) => targets[item])
      .map((item) => (replaced[item] = JSON.stringify(targets[item])));

    Object.keys(env.parameters).forEach((key) => {
      for (let index = 0; index < replaced.length; index++) {
        let temp = replaced[index];
        let ansStr = temp.replace(`{{${temp}}}`, env.parameters[key]);
        replaced[index] = JSON.parse(ansStr);
      }
    });
    return replaced;
  }

  save() {
    throw new Error('Method not implemented.');
  }
}
