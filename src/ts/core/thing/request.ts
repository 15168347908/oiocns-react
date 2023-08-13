import { XRequest } from '@/ts/base/schema';
import { IEnvironment } from '@/utils/api/types';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IFileInfo, FileInfo } from './fileinfo';
import { IDirectory } from './directory';
import { kernel } from '@/ts/base';
import { storeCollName } from '../public';

type Field = 'params' | 'headers' | 'data' | 'method' | 'url';

/** 请求配置，需要持久化 */
export interface IRequest extends IFileInfo<XRequest> {
  /** 更新元数据 */
  update(value: any, field: Field): void;
  /** 请求执行 */
  exec(env?: IEnvironment): Promise<AxiosResponse>;
}

export class Request extends FileInfo<XRequest> implements IRequest {
  constructor(request: XRequest, dir: IDirectory) {
    super(request, dir);
  }

  async delete(): Promise<boolean> {
    const res = await kernel.anystore.remove(
      this.metadata.belongId,
      storeCollName.Requests,
      {
        id: this.metadata.id,
      },
    );
    if (res.success) {
      this.directory.requests = this.directory.requests.filter((i) => i.key != this.key);
    }
    return res.success;
  }

  async rename(name: string): Promise<boolean> {
    let res = await kernel.anystore.update(
      this.metadata.belongId,
      storeCollName.Requests,
      {
        match: {
          id: this.metadata.id,
        },
        update: {
          name: name,
        },
      },
    );
    return res.success;
  }

  async copy(destination: IDirectory): Promise<boolean> {
    let res = await destination.createRequest(this.metadata);
    return !!res;
  }

  async move(destination: IDirectory): Promise<boolean> {
    let res = await kernel.anystore.update(
      this.metadata.belongId,
      storeCollName.Requests,
      {
        match: {
          id: this.metadata.id,
        },
        update: {
          directoryId: destination.id,
        },
      },
    );
    return res.success;
  }

  update(value: any, field: Field) {
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
