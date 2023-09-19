import { XForm } from '@/ts/base/schema';
import { Command, common, kernel, model, schema } from '../../../base';
import { IDirectory } from '../directory';
import { IStandardFileInfo, StandardFileInfo } from '../fileinfo';
import { sleep } from '@/ts/base/common';
import { formatDate } from 'devextreme/localization';
import { WorkTask } from '../../work/task';
import orgCtrl from '@/ts/controller';
import { TaskStatus } from '../../public';

export type GraphData = () => any;

export interface ITransfer extends IStandardFileInfo<model.Transfer> {
  /** 触发器 */
  command: Command;
  /** 任务记录 */
  taskList: ITask[];
  /** 当前任务 */
  curTask?: ITask;
  /** 获取实体 */
  getTransfer(id: string): ITransfer | undefined;
  /** 取图数据 */
  getData?: GraphData;
  /** 绑定图 */
  binding(getData: GraphData): void;
  /** 是否有环 */
  hasLoop(): boolean;
  /** 获取节点 */
  getNode(id: string): model.Node | undefined;
  /** 增加节点 */
  addNode(node: model.Node): Promise<void>;
  /** 更新节点 */
  updNode(node: model.Node): Promise<void>;
  /** 删除节点 */
  delNode(id: string): Promise<void>;
  /** 获取边 */
  getEdge(id: string): model.Edge | undefined;
  /** 增加边 */
  addEdge(edge: model.Edge): Promise<boolean>;
  /** 更新边 */
  updEdge(edge: model.Edge): Promise<void>;
  /** 删除边 */
  delEdge(id: string): Promise<void>;
  /** 新增环境 */
  addEnv(env: model.Environment): Promise<void>;
  /** 修改环境 */
  updEnv(env: model.Environment): Promise<void>;
  /** 删除环境 */
  delEnv(id: string): Promise<void>;
  /** 当前环境 */
  getCurEnv(): model.Environment | undefined;
  /** 变更环境 */
  changeEnv(id: string): Promise<void>;
  /** 请求 */
  request(node: model.Node, env?: model.KeyValue): Promise<model.HttpResponseType>;
  /** 脚本 */
  running(code: string, args: any, env?: model.KeyValue): any;
  /** 映射 */
  mapping(node: model.Node, array: any[]): Promise<any[]>;
  /** 写入 */
  writing(node: model.Node, array: any[]): Promise<any[]>;
  /** 创建任务 */
  execute(status: model.GStatus, event: model.GEvent): void;
  /** 完成任务 */
  completed(status: model.GStatus, event: model.GEvent): void;
}

export class Transfer extends StandardFileInfo<model.Transfer> implements ITransfer {
  command: Command;
  taskList: ITask[];
  curTask?: ITask;
  getData?: GraphData;

  constructor(metadata: model.Transfer, dir: IDirectory) {
    super(metadata, dir, dir.resource.transferColl);
    this.taskList = [];
    this.command = new Command();
    this.command.subscribe((type, cmd, args) => {
      switch (type) {
        case 'main':
          this.curTask?.handing(cmd, args);
          break;
      }
    });
    this.setEntity();
  }

  execute(status: model.GStatus, event: model.GEvent): void {
    this.curTask = new Task(this, event, status);
    this.taskList.push(this.curTask);
    this.curTask.starting();
  }

  completed(initStatus: model.GStatus, _: model.GEvent): void {
    this.curTask = undefined;
    if (initStatus == 'Editable') {
      this.command.emitter('graph', 'status', 'Editable');
    } else if (initStatus == 'Viewable') {
      this.command.emitter('graph', 'status', 'Viewable');
    }
  }

  getTransfer(id: string): ITransfer | undefined {
    return this.getEntity(id);
  }

  async copy(destination: IDirectory): Promise<boolean> {
    if (this.allowCopy(destination)) {
      return await super.copyTo(destination.id, destination.resource.transferColl);
    }
    return false;
  }

  async move(destination: IDirectory): Promise<boolean> {
    if (this.allowCopy(destination)) {
      return await super.copyTo(destination.id, destination.resource.transferColl);
    }
    return false;
  }

  hasLoop(): boolean {
    const hasLoop = (node: model.Node, chain: Set<string>) => {
      for (const edge of this.metadata.edges) {
        if (edge.start == node.id) {
          for (const next of this.metadata.nodes) {
            if (edge.end == next.id) {
              if (chain.has(next.id)) {
                return true;
              }
              if (hasLoop(next, new Set([...chain, next.id]))) {
                return true;
              }
            }
          }
        }
      }
      return false;
    };
    const not = this.metadata.edges.map((item) => item.end);
    const roots = this.metadata.nodes.filter((item) => not.indexOf(item.id) == -1);
    for (const root of roots) {
      if (hasLoop(root, new Set<string>([root.id]))) {
        return true;
      }
    }
    return false;
  }

  binding(getData: GraphData): void {
    this.getData = getData;
  }

  async update(data: model.Transfer): Promise<boolean> {
    data.graph = this.getData?.();
    return await super.update(data);
  }

  async request(node: model.Node, env?: model.KeyValue): Promise<model.HttpResponseType> {
    let request = common.deepClone(node as model.Request);
    let json = JSON.stringify(request.data);
    for (const match of json.matchAll(/\{\{[^{}]*\}\}/g)) {
      for (let index = 0; index < match.length; index++) {
        let matcher = match[index];
        let varName = matcher.substring(2, matcher.length - 2);
        json = json.replaceAll(matcher, env?.[varName] ?? '');
      }
    }
    let res = await kernel.httpForward(JSON.parse(json));
    return res.data?.content ? JSON.parse(res.data.content) : res;
  }

  running(code: string, args: any, env?: model.KeyValue): any {
    const runtime = {
      environment: env ?? {},
      preData: args,
      nextData: {},
      decrypt: common.decrypt,
      encrypt: common.encrypt,
      log: (args: any) => {
        console.log(args);
      },
    };
    common.Sandbox(code)(runtime);
    return runtime.nextData;
  }

  async writing(node: model.Node, array: any[]): Promise<any[]> {
    const write = node as model.Store;
    console.log(write);
    if (write.directIs) {
      for (const app of this.directory.target.directory.applications) {
        const works = await app.loadWorks();
        const work = works.find((item) => item.id == write.workId);
        await work?.loadWorkNode();
        console.log(work, works);
        if (work && work.primaryForms.length > 0 && work.node) {
          console.log(work);
          const apply = await work.createApply();
          if (apply) {
            console.log(apply);
            const map = new Map<string, model.FormEditData>();
            const editForm: model.FormEditData = {
              before: [],
              after: [],
              nodeId: work.node.id,
              creator: apply.belong.userId,
              createTime: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S'),
            };
            const belongId = this.directory.belongId;
            for (const item of array) {
              const res = await kernel.createThing(belongId, [], '资产卡片');
              if (res.success) {
                const one: model.AnyThingModel = { ...item, ...res.data };
                editForm.after.push(one);
              }
            }
            map.set(work.primaryForms[0].id, editForm);
            console.log(map);
            const success = await apply.createApply(belongId, '自动写入', map);
            console.log(success);
            if (success) {
              const tasks = await kernel.queryApproveTask({ id: '0' });
              console.log(tasks);
              if (tasks.success) {
                for (const task of tasks.data.result) {
                  const workTask = new WorkTask(task, orgCtrl.provider);
                  const res = await workTask.approvalTask(
                    TaskStatus.ApprovalStart,
                    '同意',
                  );
                  console.log(res);
                }
              }
            }
          }
        }
      }
    }
    return [];
  }

  async mapping(node: model.Node, array: any[]): Promise<any[]> {
    const data = node as model.Mapping;
    const ans: any[] = [];
    const form = this.findMetadata<XForm>(data.source);
    if (form) {
      const sourceMap = new Map<string, schema.XAttribute>();
      form.attributes.forEach((attr) => {
        if (attr.property?.info) {
          sourceMap.set(attr.property.info, attr);
        }
      });
      for (let item of array) {
        let oldItem: { [key: string]: any } = {};
        let newItem: { [key: string]: any } = { Id: common.generateUuid() };
        Object.keys(item).forEach((key) => {
          if (sourceMap.has(key)) {
            const attr = sourceMap.get(key)!;
            oldItem[attr.id] = item[key];
          }
        });
        for (const mapping of data.mappings) {
          if (mapping.source in oldItem) {
            newItem[mapping.target] = oldItem[mapping.source];
          }
        }
        ans.push(newItem);
      }
    }
    return ans;
  }

  getNode(id: string): model.Node | undefined {
    for (const node of this.metadata.nodes) {
      if (node.id == id) {
        return node;
      }
    }
  }

  async addNode(node: model.Node): Promise<void> {
    let index = this.metadata.nodes.findIndex((item) => item.id == node.id);
    if (index == -1) {
      this.metadata.nodes.push(node);
      if (await this.update(this.metadata)) {
        this.command.emitter('node', 'add', node);
      }
    }
  }

  async updNode(node: model.Node): Promise<void> {
    let index = this.metadata.nodes.findIndex((item) => item.id == node.id);
    if (index != -1) {
      this.metadata.nodes[index] = node;
      if (await this.update(this.metadata)) {
        this.command.emitter('node', 'update', node);
      }
    }
  }

  async delNode(id: string): Promise<void> {
    let index = this.metadata.nodes.findIndex((item) => item.id == id);
    if (index != -1) {
      let node = this.metadata.nodes[index];
      this.metadata.nodes.splice(index, 1);
      if (await this.update(this.metadata)) {
        this.command.emitter('node', 'delete', node);
      }
    }
  }

  getEdge(id: string): model.Edge | undefined {
    for (let edge of this.metadata.edges) {
      if (edge.id == id) {
        return edge;
      }
    }
  }

  async addEdge(edge: model.Edge): Promise<boolean> {
    let index = this.metadata.edges.findIndex((item) => edge.id == item.id);
    if (index == -1) {
      this.metadata.edges.push(edge);
      if (this.hasLoop()) {
        this.metadata.edges.splice(this.metadata.edges.length - 1, 1);
        return false;
      }
      if (await this.update(this.metadata)) {
        this.command.emitter('edge', 'add', edge);
      }
    }
    return true;
  }

  async updEdge(edge: model.Edge): Promise<void> {
    let index = this.metadata.edges.findIndex((item) => item.id == edge.id);
    if (index != -1) {
      this.metadata.edges[index] = edge;
      if (await this.update(this.metadata)) {
        this.command.emitter('edge', 'update', edge);
      }
    }
  }

  async delEdge(id: string): Promise<void> {
    let index = this.metadata.edges.findIndex((item) => item.id == id);
    if (index != -1) {
      this.metadata.edges.splice(index, 1);
      if (await this.update(this.metadata)) {
        this.command.emitter('edge', 'delete', id);
      }
    }
  }

  async addEnv(env: model.Environment): Promise<void> {
    let index = this.metadata.envs.findIndex((item) => {
      return item.id == env.id;
    });
    if (index == -1) {
      const id = common.generateUuid();
      this.metadata.envs.push({ ...env, id: id });
      this.metadata.curEnv = id;
      if (await this.update(this.metadata)) {
        this.command.emitter('environments', 'refresh');
      }
    }
  }

  async updEnv(env: model.Environment): Promise<void> {
    let index = this.metadata.envs.findIndex((item) => {
      return item.id == env.id;
    });
    if (index != -1) {
      this.metadata.envs[index] = env;
      if (await this.update(this.metadata)) {
        this.command.emitter('environments', 'refresh');
      }
    }
  }

  async delEnv(id: string): Promise<void> {
    let index = this.metadata.envs.findIndex((item) => {
      return item.id == id;
    });
    if (index != -1) {
      this.metadata.envs.splice(index, 1);
      if (await this.update(this.metadata)) {
        if (id == this.metadata.curEnv) {
          this.metadata.curEnv = undefined;
        }
        this.command.emitter('environments', 'refresh');
      }
    }
  }

  getCurEnv(): model.Environment | undefined {
    for (const env of this.metadata.envs) {
      if (env.id == this.metadata.curEnv) {
        return env;
      }
    }
  }

  async changeEnv(id: string): Promise<void> {
    for (const item of this.metadata.envs) {
      if (item.id == id) {
        this.metadata.curEnv = id;
        if (await this.update(this.metadata)) {
          this.command.emitter('environments', 'refresh');
        }
      }
    }
  }
}

const Machine: model.Shift<model.GEvent, model.GStatus>[] = [
  { start: 'Editable', event: 'EditRun', end: 'Running' },
  { start: 'Viewable', event: 'ViewRun', end: 'Running' },
  { start: 'Running', event: 'Completed', end: 'Completed' },
  { start: 'Running', event: 'Throw', end: 'Error' },
];

export interface ITask {
  /** 触发器 */
  command: Command;
  /** 迁移配置 */
  transfer: ITransfer;
  /** 元数据 */
  metadata: model.Task;
  /** 已遍历点（存储数据） */
  visitedNodes: Map<string, { code: string; data: any }>;
  /** 已遍历边 */
  visitedEdges: Set<string>;
  /** 前置链接 */
  preTask?: ITask;
  /** 启动事件 */
  initEvent: model.GEvent;
  /** 启动状态 */
  initStatus: model.GStatus;
  /** 状态转移 */
  machine(event: model.GEvent): void;
  /** 遍历节点 */
  visitNode(node: model.Node, preData?: any): Promise<void>;
  /** 处理事件 */
  handing(cmd: string, args: any): Promise<void>;
  /** 开始执行 */
  starting(): void;
}

export class Task implements ITask {
  command: Command;
  transfer: ITransfer;
  metadata: model.Task;
  visitedNodes: Map<string, { code: string; data: any }>;
  visitedEdges: Set<string>;
  initEvent: model.GEvent;
  initStatus: model.GStatus;
  preTask?: ITask;

  constructor(
    transfer: ITransfer,
    initEvent: model.GEvent,
    initStatus: model.GStatus,
    task?: ITask,
  ) {
    this.transfer = transfer;
    this.initEvent = initEvent;
    this.initStatus = initStatus;
    this.metadata = common.deepClone({
      id: common.generateUuid(),
      status: initStatus,
      nodes: transfer.metadata.nodes.map((item) => {
        return {
          ...item,
          status: initStatus,
        };
      }),
      env: transfer.getCurEnv(),
      edges: transfer.metadata.edges,
      graph: transfer.metadata.graph,
      startTime: new Date(),
    });
    this.visitedNodes = new Map();
    this.visitedEdges = new Set();
    this.preTask = task;
    this.command = transfer.command;
  }

  starting(): void {
    this.machine(this.initEvent);
    this.command.emitter('environments', 'refresh');
    this.command.emitter('tasks', 'refresh', this.transfer.taskList);
    this.command.emitter('main', 'roots');
  }

  machine(event: model.GEvent): void {
    if (this.metadata.status == 'Error') {
      return;
    }
    for (const shift of Machine) {
      if (shift.start == this.metadata.status && event == shift.event) {
        this.metadata.status = shift.end;
        this.command.emitter('graph', 'status', this.metadata.status);
      }
    }
  }

  running(code: string, args: any, env?: model.KeyValue) {
    return this.transfer.running(code, args, env);
  }

  async request(node: model.Node, env?: model.KeyValue) {
    return await this.transfer.request(node, env);
  }

  private dataCheck(preData?: any) {
    if (preData) {
      if (preData instanceof Error) {
        throw preData;
      }
      for (const key of Object.keys(preData)) {
        const data = preData[key];
        if (data instanceof Error) {
          throw data;
        }
      }
    }
  }

  async visitNode(node: model.Node, preData?: any): Promise<void> {
    node.status = 'Running';
    this.command.emitter('running', 'start', [node]);
    try {
      this.dataCheck(preData);
      await sleep(500);
      if (node.preScripts) {
        preData = this.running(node.preScripts, preData, this.metadata.env?.params);
      }
      let nextData: any;
      const isArray = (array: any[]) => {
        if (!Array.isArray(array)) {
          throw new Error('输入必须是一个数组！');
        }
      };
      switch (node.typeName) {
        case '请求':
          nextData = await this.request(node);
          break;
        case '链接':
          // TODO 替换其它方案
          const nextId = (node as model.SubTransfer).nextId;
          this.transfer.getTransfer(nextId)?.execute(this.initStatus, this.initEvent);
          break;
        case '映射':
          isArray(preData.array);
          nextData = await this.transfer.mapping(node, preData.array);
          break;
        case '存储':
          isArray(preData);
          await this.transfer.writing(node, preData);
          break;
      }
      if (node.postScripts) {
        nextData = this.running(node.postScripts, nextData);
      }
      this.visitedNodes.set(node.id, { code: node.code, data: nextData });
      node.status = 'Completed';
      this.command.emitter('running', 'completed', [node]);
      if (this.tryRunning()) {
        this.command.emitter('main', 'next', [node]);
      }
    } catch (error) {
      this.visitedNodes.set(node.id, { code: node.code, data: error });
      this.machine('Throw');
      node.status = 'Error';
      this.command.emitter('running', 'error', [node, error]);
      if (this.tryRunning()) {
        this.command.emitter('main', 'next', [node, error]);
      }
    }
  }

  private preCheck(node: model.Node): { s: boolean; d: { [key: string]: any } } {
    let data: { [key: string]: any } = {};
    for (const edge of this.metadata.edges) {
      if (node.id == edge.end) {
        if (!this.visitedEdges.has(edge.id)) {
          return { s: false, d: {} };
        }
        if (this.visitedNodes.has(edge.start)) {
          const nodeData = this.visitedNodes.get(edge.start)!;
          data[nodeData.code] = nodeData.data;
        }
      }
    }
    if (Object.keys(data).length == 1) {
      return { s: true, d: data[Object.keys(data)[0]] };
    }
    return { s: true, d: data };
  }

  async handing(cmd: string, args: any) {
    switch (cmd) {
      case 'roots': {
        if (this.tryRunning()) {
          const not = this.metadata.edges.map((item) => item.end);
          const roots = this.metadata.nodes.filter((item) => not.indexOf(item.id) == -1);
          for (const root of roots) {
            this.visitNode(root);
          }
        }
        break;
      }
      case 'visitNode': {
        const next = this.preCheck(args[0]);
        if (next.s) {
          await this.visitNode(args[0], next.d);
        }
        break;
      }
      case 'next': {
        for (const edge of this.metadata.edges) {
          if (args[0].id == edge.start) {
            this.visitedEdges?.add(edge.id);
            for (const node of this.metadata.nodes) {
              if (node.id == edge.end) {
                this.command.emitter('main', 'visitNode', [node]);
              }
            }
          }
        }
        break;
      }
    }
  }

  tryRunning(): boolean {
    if (this.visitedNodes.size == this.metadata.nodes.length) {
      this.metadata.endTime = new Date();
      this.command.emitter('tasks', 'refresh', this.transfer.taskList);
      this.machine('Completed');
      this.transfer.completed(this.initStatus, this.initEvent);
      return false;
    }
    return true;
  }
}

export const getDefaultRequestNode = (): model.Request => {
  return {
    id: common.generateUuid(),
    code: 'request',
    name: '请求',
    typeName: '请求',
    data: {
      uri: '',
      method: 'GET',
      header: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      content: '',
    },
  };
};

export const getDefaultMappingNode = (): model.Mapping => {
  return {
    id: common.generateUuid(),
    code: 'mapping',
    name: '映射',
    typeName: '映射',
    source: '',
    target: '',
    mappings: [],
  };
};

export const getDefaultStoreNode = (): model.Store => {
  return {
    id: common.generateUuid(),
    code: 'store',
    name: '存储',
    typeName: '存储',
    directoryId: '',
    workId: '',
    directIs: false,
  };
};

export const getDefaultTransferNode = (): model.SubTransfer => {
  return {
    id: common.generateUuid(),
    code: 'transfer',
    name: '链接',
    typeName: '链接',
    nextId: '',
  };
};
