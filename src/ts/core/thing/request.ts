import { XRequest } from '@/ts/base/schema';
import { IEnvironment } from '@/utils/api/types';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IFileInfo, FileInfo } from './fileinfo';
import { IDirectory } from './directory';

/** 请求配置，需要持久化 */
export interface IRequest extends IFileInfo<XRequest> {
  /** 更新元数据 */
  update(value: any, field: 'params' | 'headers' | 'data'): void;
  /** 请求执行 */
  exec(env?: IEnvironment): Promise<AxiosResponse>;
}

export class Request extends FileInfo<XRequest> implements IRequest {
  constructor(request: XRequest, dir: IDirectory) {
    super(request, dir);
  }

  delete(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  rename(name: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  copy(destination: IDirectory): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  move(destination: IDirectory): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  update(value: any, field: 'params' | 'headers' | 'data') {
    this.setMetadata({
      ...this.metadata,
      axios: {
        ...this.metadata.axios,
        [field]: value,
      },
    });
  }

  private replaceHolder(env: IEnvironment): AxiosRequestConfig {
    return {
      ...this.metadata.axios,
      params: this.replace(this.metadata.axios.params, env),
      headers: this.replace(this.metadata.axios.headers, env),
      data: this.replace(this.metadata.axios.data, env),
    };
  }

  private replace(data: any, env: IEnvironment): any {
    let ansStr = JSON.stringify(data);
    Object.keys(env.parameters).forEach((key) => {
      ansStr = ansStr.replace(`{{${key}}}`, env.parameters[key]);
    });
    return JSON.parse(ansStr);
  }

  async exec(env?: IEnvironment): Promise<AxiosResponse> {
    if (env) {
      return await axios.request(this.replaceHolder(env));
    }
    return await axios.request(this.metadata.axios);
  }
}
