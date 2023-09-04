import { kernel } from '@/ts/base';
import {
  XAttribute,
  XEnvironment,
  XExecutable,
  XFileInfo,
  XLink,
  XMapping,
  XRequest,
  XSelection,
} from '@/ts/base/schema';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IDirectory } from './directory';
import { FileInfo, IFileInfo } from './fileinfo';
import { ShareSet } from '../public/entity';

/** 配置集合名称 */
export enum ConfigColl {
  Requests = 'requests',
  RequestLinks = 'request-links',
  Scripts = 'scripts',
  Mappings = 'mappings',
  Environments = 'environments',
  Stores = 'stores',
  Selections = 'selections',
  Unknown = 'unknown',
}

export const CollMap = {
  [ConfigColl.Requests]: '请求',
  [ConfigColl.RequestLinks]: '链接',
  [ConfigColl.Scripts]: '脚本',
  [ConfigColl.Mappings]: '映射',
  [ConfigColl.Environments]: '环境',
  [ConfigColl.Stores]: '存储',
  [ConfigColl.Selections]: '选择',
  [ConfigColl.Unknown]: '未知',
};

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
    const coll = this.directory.configs.get(this.collName);
    if (res.success && coll) {
      const index = coll.findIndex((item) => item.key == this.key);
      coll.splice(index, 1);
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

  private replace(data: any, kv: Kv): any {
    if (data) {
      let ansStr = JSON.stringify(data);
      Object.keys(kv).forEach((key) => {
        const value = kv[key];
        ansStr = ansStr.replace(`{{${key}}}`, value ?? '');
      });
      return JSON.parse(ansStr);
    }
  }

  private replaceClear(data: any) {
    if (data) {
      let ansStr = JSON.stringify(data);
      ansStr = ansStr.replace(/\{\{[^{}]*\}\}/g, '');
      return JSON.parse(ansStr);
    }
  }

  private paramsEscape(url: string) {
    const split: string[] = url.split('?');
    const ans: string[] = [];
    if (split.length > 1) {
      const params = split[1].split('&');
      for (const param of params) {
        const kv = param.split('=', 2);
        if (kv.length > 1) {
          ans.push(kv[0] + '=' + encodeURIComponent(kv[1]));
        }
      }
    }
    return split[0] + '?' + ans.join('&');
  }

  async exec(kv?: Kv): Promise<any> {
    let config = { ...this.axios };
    let envId = this.metadata.envId;
    let kvs: { [key: string]: string | undefined } = {};
    if (envId && ShareSet.has(envId)) {
      const env = ShareSet.get(envId) as IEnvironment;
      kvs = { ...env.metadata.kvs };
    }
    if (kv) {
      kvs = { ...kvs, ...kv };
    }
    config = this.replace(config, kvs);
    config = this.replaceClear(config);
    config.url = this.paramsEscape(config.url);
    const res = await axios.request(config);
    console.log('返回结果', res);
    return res;
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

/** 选择 */
export interface ISelection extends IBaseFileInfo<XSelection> {}
export class Selection extends BaseFileInfo<XSelection> implements ISelection {
  constructor(selection: XSelection, dir: IDirectory) {
    super(ConfigColl.Selections, selection, dir);
  }
}
