import { kernel } from '@/ts/base';
import {
  XAttribute,
  XEnvironment,
  XExecutable,
  XFileInfo,
  XLink,
  XMapping,
  XRequest,
} from '@/ts/base/schema';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ConfigColl, IDirectory } from './directory';
import { FileInfo, IFileInfo } from './fileinfo';

export const ShareConfigs = new Map<string, IBaseFileInfo<XFileInfo>>();

export interface IBaseFileInfo<T extends XFileInfo> extends IFileInfo<T> {
  refresh(data: T): void;
}

export class BaseFileInfo<T extends XFileInfo>
  extends FileInfo<T>
  implements IBaseFileInfo<T>
{
  collName: ConfigColl;

  constructor(collName: ConfigColl, metadata: T, dir: IDirectory) {
    super(metadata, dir);
    this.collName = collName;
    ShareConfigs.set(metadata.id, this);
  }

  refresh(data: T): void {
    this.setMetadata(data);
    kernel.anystore
      .remove(this.belongId, this.collName, {
        id: this.metadata.id,
      })
      .then(() => {
        kernel.anystore.insert(this.belongId, this.collName, this.metadata);
      });
  }

  async delete(): Promise<boolean> {
    const res = await kernel.anystore.remove(this.belongId, this.collName, {
      id: this.metadata.id,
    });
    if (res.success) {
      this.directory.configs = this.directory.configs.filter((i) => i.key != this.key);
    }
    return res.success;
  }

  async rename(name: string): Promise<boolean> {
    let res = await kernel.anystore.update(this.belongId, this.collName, {
      match: {
        id: this.metadata.id,
      },
      update: {
        name: name,
      },
    });
    return res.success;
  }

  async copy(destination: IDirectory): Promise<boolean> {
    let res = await destination.createConfig(this.collName, this.metadata);
    return !!res;
  }

  async move(destination: IDirectory): Promise<boolean> {
    let res = await kernel.anystore.update(this.belongId, this.collName, {
      match: {
        id: this.metadata.id,
      },
      update: {
        directoryId: destination.id,
      },
    });
    return res.success;
  }
}

/** 未知的文件类型  */
export type IUnknown = IBaseFileInfo<XFileInfo>;

export class Unknown extends BaseFileInfo<XFileInfo> implements IUnknown {}

/** 环境配置 */
export type IEnvironment = IBaseFileInfo<XEnvironment>;

export class Environment extends BaseFileInfo<XEnvironment> implements IEnvironment {
  constructor(environment: XEnvironment, dir: IDirectory) {
    super(ConfigColl.Environments, environment, dir);
  }
}

type Kv = { [key: string]: string | undefined };

/** 请求配置，需要持久化 */
export interface IRequest extends IBaseFileInfo<XRequest> {
  /** 配置文件 */
  axios: AxiosRequestConfig;
  /** 临时存储 */
  resp?: AxiosResponse;

  /** 请求执行 */
  exec(kv?: Kv): Promise<any>;
}

export class Request extends BaseFileInfo<XRequest> implements IRequest {
  constructor(request: XRequest, dir: IDirectory) {
    super(ConfigColl.Requests, request, dir);
  }

  get axios() {
    return this.metadata.axios;
  }

  private replaceHolder(axios: any, kv: Kv): AxiosRequestConfig {
    return {
      ...this.metadata.axios,
      url: this.replace(axios.url, kv),
      params: this.replace(axios.params, kv),
      headers: this.replace(axios.headers, kv),
      data: this.replace(axios.data, kv),
    };
  }

  private replace(data: any, kv: Kv): any {
    if (data) {
      let ansStr = JSON.stringify(data);
      Object.keys(kv).forEach((key) => {
        const value = kv[key];
        ansStr = ansStr.replace(`{{${key}}}`, value ?? '');
      });
      ansStr = ansStr.replace(/\{\{.*\}\}/g, '');
      return JSON.parse(ansStr);
    }
  }

  async exec(kv?: Kv): Promise<any> {
    let config = this.axios;
    let envId = this.metadata.envId;
    if (envId && ShareConfigs.has(envId)) {
      const env = ShareConfigs.get(envId) as IEnvironment;
      config = this.replaceHolder(config, env.metadata.kvs);
    }
    if (kv) {
      config = this.replaceHolder(config, kv);
    }
    console.log(kv, config);
    return await axios.request(config);
  }
}

/** 请求链接 */
export interface ILink extends IBaseFileInfo<XLink> {
  environment?: { [key: string]: string };
}

export class Link extends BaseFileInfo<XLink> implements ILink {
  environment?: { [key: string]: string };

  constructor(link: XLink, dir: IDirectory) {
    super(ConfigColl.RequestLinks, link, dir);
  }
}

/** 脚本嵌入 */
export interface IExecutable extends IBaseFileInfo<XExecutable> {}

export class Executable extends BaseFileInfo<XExecutable> implements IExecutable {
  constructor(executable: XExecutable, dir: IDirectory) {
    super(ConfigColl.Scripts, executable, dir);
  }
}

/** 实体映射 */
export interface IMapping extends IBaseFileInfo<XMapping> {
  source?: { index: number; attr: XAttribute };
  target?: { index: number; attr: XAttribute };
  clear(): void;
}

export class Mapping extends BaseFileInfo<XMapping> implements IMapping {
  source?: { index: number; attr: XAttribute };
  target?: { index: number; attr: XAttribute };

  constructor(mapping: XMapping, dir: IDirectory) {
    super(ConfigColl.Mappings, mapping, dir);
  }

  clear(): void {
    this.source = undefined;
    this.target = undefined;
  }
}
