import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IDirectory } from '@/ts/core';
import { FileItemModel } from '@/ts/base/model';

export type Parameters = Record<string, any>;

enum Retention {
  Runtime,
  Static,
}

/** 环境变量 */
export interface IEnvironment {
  domain: string;
  type: Retention;
  parameters: Parameters;

  /** 联合一些其他环境变量 */
  union(other: IEnvironment);
}

/** 可执行类型 */
enum ExecutionType {
  /** 数据转换 */
  DataConvert,
  /** 自定义可执行脚本 */
  CustomScript,
}

/** 执行时间 */
enum ExecutionTime {
  /** 请求前 */
  Before,
  /** 请求后 */
  After,
}

/** 可执行的 */
export interface IExecutable {
  type: ExecutionType;
  time: ExecutionTime;
  file?: FileItemModel;

  exec(...args: any): any;
}

/** 请求配置，需要持久化 */
export interface IRequestConfig<D> {
  axiosConfig: AxiosRequestConfig<D>;
  directory: IDirectory;

  /** 添加一个请求头 */
  addHeader(key: string, value: string): IRequestConfig<D>;
  /** 删除一个请求头 */
  delHeader(key: string, value: string): IRequestConfig<D>;
  /** 添加一个参数 */
  addParam(key: string, value: string): IRequestConfig<D>;
  /** 删除一个参数 */
  delParam(key: string, value: string): IRequestConfig<D>;
  /** 设置数据 */
  setData(any: D): IRequestConfig<D>;
  /** 添加一个可执行脚本 */
  addExecutable(exec: IExecutable);
  /** 移除一个可执行脚本 */
  delExecutable(key: string);
  /** 保存配置文件 */
  save(): FileItemModel;
}

/** 请求执行 */
export interface IRequestExecutor<D> {
  config: IRequestConfig<D>;
  next?: IRequestExecutor<any>;

  /** 执行请求 */
  exec(env: IEnvironment): Promise<AxiosResponse>;
}

