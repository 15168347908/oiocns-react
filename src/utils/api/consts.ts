/** 请求方法 */
export enum Method {
  GET = 'GET',
  POST = 'POST',
}

/** 执行时 */
export enum Retention {
  // 运行时
  Runtime,
  // 静态
  Static,
}

/** 执行时间 */
export enum ExecutionTime {
  /** 请求前 */
  Before,
  /** 请求后 */
  After,
}

/** 请求配置集合名称 */
export const ConfigCollName = 'request-config';
