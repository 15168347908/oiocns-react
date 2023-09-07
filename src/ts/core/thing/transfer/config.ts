import { kernel } from '@/ts/base';
import { deepClone, generateUuid } from '@/ts/base/common';
import * as schema from '@/ts/base/schema';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ShareSet } from '../../public/entity';
import { IDirectory } from '../directory';
import { FileInfo, IFileInfo } from '../fileinfo';
import { IForm } from '../form';

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

export const CollMap: { [key: string]: string } = {
  [ConfigColl.Requests]: '请求',
  [ConfigColl.RequestLinks]: '链接',
  [ConfigColl.Scripts]: '脚本',
  [ConfigColl.Mappings]: '映射',
  [ConfigColl.Environments]: '环境',
  [ConfigColl.Stores]: '存储',
  [ConfigColl.Selections]: '选择',
  [ConfigColl.Unknown]: '未知',
};

export interface IBaseFileInfo<T extends schema.XFileInfo> extends IFileInfo<T> {
  refresh(data: T): void;
}

export class BaseFileInfo<T extends schema.XFileInfo>
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
    kernel.collectionReplace(this.belongId, this.collName, this.metadata);
  }

  async delete(): Promise<boolean> {
    const res = await kernel.collectionUpdate(this.belongId, this.collName, {
      match: {
        _id: this.id,
      },
      update: {
        _set_: {
          isDeleted: true,
        },
      },
    });
    const coll = this.directory.configs.get(this.collName);
    if (res.data?.MatchedCount > 0 && coll) {
      const index = coll.findIndex((item) => item.key == this.key);
      coll.splice(index, 1);
    }
    return res.data?.MatchedCount > 0;
  }

  async rename(name: string): Promise<boolean> {
    let res = await kernel.collectionUpdate(this.belongId, this.collName, {
      match: {
        _id: this.id,
      },
      update: {
        _set_: {
          name: name,
        },
      },
    });
    console.log(this.metadata, res);
    this.setMetadata({ ...this.metadata, name });
    return res.success;
  }

  async copy(destination: IDirectory): Promise<boolean> {
    let res = await destination.createConfig(this.collName, this.metadata);
    return !!res;
  }

  async move(destination: IDirectory): Promise<boolean> {
    let res = await kernel.collectionUpdate(this.belongId, this.collName, {
      match: {
        id: this.metadata.id,
      },
      update: {
        _set_: {
          directoryId: destination.id,
        },
      },
    });
    return res.success;
  }
}

/** 未知的文件类型  */
export type IUnknown = IBaseFileInfo<schema.XFileInfo>;

export class Unknown extends BaseFileInfo<schema.XFileInfo> implements IUnknown {}

/** 环境配置 */
export type IEnvironment = IBaseFileInfo<schema.XEnvironment>;

export class Environment
  extends BaseFileInfo<schema.XEnvironment>
  implements IEnvironment
{
  constructor(environment: schema.XEnvironment, dir: IDirectory) {
    super(ConfigColl.Environments, environment, dir);
  }
}

type Kv = { [key: string]: string | undefined };

/** 请求配置，需要持久化 */
export interface IRequest extends IBaseFileInfo<schema.XRequest> {
  /** 配置文件 */
  axios: AxiosRequestConfig;
  /** 临时存储 */
  resp?: AxiosResponse;

  /** 请求执行 */
  exec(kv?: Kv): Promise<any>;
}

export class Request extends BaseFileInfo<schema.XRequest> implements IRequest {
  constructor(request: schema.XRequest, dir: IDirectory) {
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
    let config = deepClone(this.axios);
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
export interface ILink extends IBaseFileInfo<schema.XLink> {
  environment?: { [key: string]: string };
}

export class Link extends BaseFileInfo<schema.XLink> implements ILink {
  environment?: { [key: string]: string };

  constructor(link: schema.XLink, dir: IDirectory) {
    super(ConfigColl.RequestLinks, link, dir);
  }
}

/** 脚本嵌入 */
export interface IExecutable extends IBaseFileInfo<schema.XExecutable> {}

export class Executable extends BaseFileInfo<schema.XExecutable> implements IExecutable {
  constructor(executable: schema.XExecutable, dir: IDirectory) {
    super(ConfigColl.Scripts, executable, dir);
  }
}

/** 实体映射 */
export interface IMapping extends IBaseFileInfo<schema.XMapping> {
  source?: { index: number; item: schema.XAttribute | schema.XSpeciesItem };
  target?: { index: number; item: schema.XAttribute | schema.XSpeciesItem };
  clear(): void;

  mapping(data: any[]): Promise<any[]>;
}

export class Mapping extends BaseFileInfo<schema.XMapping> implements IMapping {
  source?: { index: number; item: schema.XAttribute | schema.XSpeciesItem };
  target?: { index: number; item: schema.XAttribute | schema.XSpeciesItem };

  constructor(mapping: schema.XMapping, dir: IDirectory) {
    super(ConfigColl.Mappings, mapping, dir);
  }

  clear(): void {
    this.source = undefined;
    this.target = undefined;
  }

  async mapping(data: any[]): Promise<any[]> {
    const ans: any[] = [];
    switch (this.metadata.type) {
      case 'fields':
        if (ShareSet.has(this.metadata.source) && ShareSet.has(this.metadata.target)) {
          const source = ShareSet.get(this.metadata.source) as IForm;
          const target = ShareSet.get(this.metadata.target) as IForm;
          await source.loadContent();
          await target.loadContent();
          let sourceAttrMap: Map<string, schema.XAttribute> = new Map();
          source.attributes.forEach((attr) => {
            if (attr.property?.info) sourceAttrMap.set(attr.property.info, attr);
          });
          let targetAttrMap: Map<string, schema.XAttribute> = new Map();
          target.attributes.forEach((attr) => {
            if (attr.property?.info) targetAttrMap.set(attr.property.info, attr);
          });
          for (let item of data) {
            let oldItem: { [key: string]: any } = {};
            let newItem: { [key: string]: any } = { Id: generateUuid() };
            Object.keys(item).forEach((key) => {
              if (sourceAttrMap.has(key)) {
                const attr = sourceAttrMap.get(key)!;
                oldItem[attr.id] = item[key];
              }
            });
            for (const mapping of this.metadata.mappings) {
              if (mapping.source in oldItem) {
                newItem[mapping.target] = oldItem[mapping.source];
              }
            }
            ans.push(newItem);
          }
          return ans;
        }
        break;
      case 'specieItems':
        break;
    }
    return ans;
  }
}

/** 选择 */
export interface ISelection extends IBaseFileInfo<schema.XSelection> {}

export class Selection extends BaseFileInfo<schema.XSelection> implements ISelection {
  constructor(selection: schema.XSelection, dir: IDirectory) {
    super(ConfigColl.Selections, selection, dir);
  }
}

/** 存储 */
export interface IStore extends IBaseFileInfo<schema.XStore> {}

export class Store extends BaseFileInfo<schema.XStore> implements IStore {
  constructor(store: schema.XStore, dir: IDirectory) {
    super(ConfigColl.Stores, store, dir);
  }
}
