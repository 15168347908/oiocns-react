import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { FileItemModel } from '@/ts/base/model';

export type Parameters = Record<string, any>;

export interface XRequestConfig {
  id: string;
  name: string;
  code: string;
  axios: AxiosRequestConfig;
}

export enum Method {
  POST = 'POST',
  GET = 'GET',
}

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
  union(other: IEnvironment): void;
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
export interface IRequestConfig {
  config: XRequestConfig;

  /** 替换占位符 */
  replaceHolder(env: IEnvironment): void;
  save(): FileItemModel;
}

/** 请求执行 */
export interface IRequestExecutor {
  requestConfig: IRequestConfig;

  /** 执行请求 */
  exec(env?: IEnvironment): Promise<AxiosResponse>;
}
