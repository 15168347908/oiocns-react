import { FileItemModel } from '@/ts/base/model';
import * as Const from './consts';

export type Parameters = Record<string, any>;

/** 环境变量 */
export interface IEnvironment {
  domain: string;
  type: Const.Retention;
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

/** 可执行的 */
export interface IExecutable {
  type: ExecutionType;
  time: Const.ExecutionTime;
  file?: FileItemModel;

  exec(...args: any): any;
}
