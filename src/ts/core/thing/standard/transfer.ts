import { sleep } from '@/ts/base/common';
import { XForm } from '@/ts/base/schema';
import { formatDate } from 'devextreme/localization';
import { Command, common, kernel, model, schema } from '../../../base';
import { IDirectory } from '../directory';
import { IStandardFileInfo, StandardFileInfo } from '../fileinfo';
import { IForm } from './form';
import { ShareIdSet } from '../../public/entity';

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
  /** 取消绑定 */
  unbinding(): void;
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
  mapping(node: model.Node, array: any[]): Promise<{ [key: string]: any[] }>;
  /** 写入 */
  writing(node: model.Node, array: { [key: string]: any[] }): Promise<any[]>;
  /** 模板 */
  template<T>(node: model.Node): Promise<model.Sheet<T>[]>;
  /** 读取 */
  reading(node: model.Node): Promise<any>;
  /** 输入 */
  inputting(node: model.Node): Promise<any>;
  /** 创建任务 */
  execute(status: model.GStatus, event: model.GEvent): Promise<void>;
  /** 创建任务 */
  nextExecute(preTask: ITask): Promise<void>;
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
    this.setEntity();
  }

  get cacheFlag(): string {
    return 'transfers';
  }

  async execute(status: model.GStatus, event: model.GEvent): Promise<void> {
    this.curTask = new Task(this, event, status);
    this.taskList.push(this.curTask);
    await this.curTask.starting();
  }

  async nextExecute(preTask: ITask): Promise<void> {
    this.curTask = new Task(this, preTask.initEvent, preTask.initStatus, preTask);
    this.taskList.push(this.curTask);
    await this.curTask.starting();
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

  unbinding(): void {
    this.getData = undefined;
  }

  async update(data: model.Transfer): Promise<boolean> {
    if (this.getData) {
      data.graph = this.getData();
    }
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

  async writing(node: model.Node, array: { [key: string]: any[] }): Promise<any[]> {
    const write = node as model.Store;
    if (write.directIs) {
      for (const app of await this.directory.target.directory.loadAllApplication()) {
        const works = await app.loadWorks();
        const work = works.find((item) => item.id == write.workId);
        await work?.loadWorkNode();
        if (work && work.node) {
          const apply = await work.createApply();
          if (apply) {
            const map = new Map<string, model.FormEditData>();
            const editForm: model.FormEditData = {
              before: [],
              after: [],
              nodeId: work.node.id,
              creator: apply.belong.userId,
              createTime: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S'),
            };
            const belongId = this.directory.belongId;
            const allForms = [...work.primaryForms, ...work.detailForms];
            for (const key of Object.keys(array)) {
              for (const form of allForms) {
                if (key == form.id) {
                  for (const item of array[key]) {
                    editForm.after.push({ ...item });
                  }
                }
              }
              map.set(key, editForm);
            }
            await apply.createApply(belongId, '自动写入', map);
          }
        }
      }
    }
    return [];
  }

  async mapping(node: model.Node, array: any[]): Promise<{ [key: string]: any[] }> {
    const data = node as model.Mapping;
    const ans: model.AnyThingModel[] = [];
    const sourceForm = this.findMetadata<XForm>(data.source);
    if (sourceForm) {
      const sourceMap = new Map<string, schema.XAttribute>();
      sourceForm.attributes.forEach((attr) => sourceMap.set(attr.code, attr));
      for (let item of array) {
        let oldItem: { [key: string]: any } = {};
        let newItem: any = { id: item[data.idName] };
        Object.keys(item).forEach((key) => {
          if (sourceMap.has(key)) {
            const attr = sourceMap.get(key)!;
            oldItem[attr.id] = item[key];
          }
        });
        for (const mapping of data.mappings) {
          if (mapping.source in oldItem) {
            if (mapping.typeName && ['选择型', '分类型'].includes(mapping.typeName)) {
              const oldValue = oldItem[mapping.source];
              for (const mappingItem of mapping.mappings ?? []) {
                if (mappingItem.source == oldValue) {
                  newItem[mapping.target] = mappingItem.target;
                  break;
                }
              }
            } else {
              newItem[mapping.target] = oldItem[mapping.source];
            }
          }
        }
        ans.push(newItem);
      }
    }
    return { [data.target]: ans };
  }

  async template<T>(node: model.Node): Promise<model.Sheet<T>[]> {
    const tables = node as model.Tables;
    const ans: model.Sheet<T>[] = [];
    for (const formId of tables.formIds) {
      const form = this.getEntity<IForm>(formId);
      if (form) {
        await form.loadContent();
        const columns: model.Column[] = [];
        for (const field of form.fields) {
          columns.push({
            title: field.name,
            dataIndex: field.id,
            valueType: field.valueType,
          });
        }
        ans.push({
          name: form.name,
          columns: columns,
          data: [],
        });
      }
    }
    return ans;
  }

  async reading(node: model.Node): Promise<boolean> {
    // const table = node as model.Tables;
    // if (table.file) { }
    return false;
  }

  async inputting(node: model.Node): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const formNode = node as model.Form;
        const form = ShareIdSet.get(formNode.formId + '*') as IForm;
        if (form) {
          await form.loadContent();
        } else {
          throw new Error('未获取到表单信息！');
        }
        const id = this.command.subscribe((type, cmd, args) => {
          if (type == 'data' && cmd == 'inputCall') {
            const { value, formNode } = args;
            if (formNode.id != node.id) return;
            const data: { [key: string]: any } = {};
            for (const key in value) {
              for (const field of form.fields) {
                if (field.id == key) {
                  data[field.name] = value[key];
                }
              }
            }
            this.command.unsubscribe(id);
            resolve(data);
          }
        });
        this.command.emitter('data', 'input', { form, formNode });
      } catch (error) {
        reject(error);
      }
    });
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
  /** 前置任务 */
  preTask?: ITask;
  /** 启动事件 */
  initEvent: model.GEvent;
  /** 启动状态 */
  initStatus: model.GStatus;
  /** 开始执行 */
  starting(): Promise<void>;
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
    if (task) {
      this.metadata = common.deepClone(task.metadata);
    } else {
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
    }
    this.visitedNodes = new Map();
    this.visitedEdges = new Set();
    this.preTask = task;
    this.command = transfer.command;
  }

  async starting(): Promise<void> {
    this.machine(this.initEvent);
    this.refreshEnvs();
    this.refreshTasks();
    await this.iterateRoots();
  }

  refreshEnvs() {
    this.command.emitter('environments', 'refresh');
  }

  refreshTasks() {
    this.command.emitter('tasks', 'refresh');
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
    let nextData: any;
    try {
      this.dataCheck(preData);
      await sleep(500);
      let env = this.metadata.env?.params;
      if (node.preScripts) {
        preData = this.transfer.running(node.preScripts, preData, env);
      }
      const isArray = (array: any[]) => {
        if (!Array.isArray(array)) {
          throw new Error('输入必须是一个数组！');
        }
      };
      switch (node.typeName) {
        case '请求':
          nextData = await this.transfer.request(node, env);
          break;
        case '子图':
          {
            // TODO 替换其它方案
            const nextId = (node as model.SubTransfer).nextId;
            await this.transfer
              .getTransfer(nextId)
              ?.execute(this.initStatus, this.initEvent);
          }
          break;
        case '映射':
          isArray(preData.array);
          nextData = await this.transfer.mapping(node, preData.array);
          break;
        case '存储':
          Object.keys(preData).forEach((key) => isArray(preData[key]));
          await this.transfer.writing(node, preData);
          nextData = preData;
          break;
        case '表格':
          await this.transfer.reading(node);
          break;
        case '表单':
          nextData = await this.transfer.inputting(node);
          break;
      }
      if (node.postScripts) {
        nextData = this.transfer.running(node.postScripts, nextData, env);
      }
      this.visitedNodes.set(node.id, { code: node.code, data: nextData });
      node.status = 'Completed';
      this.command.emitter('running', 'completed', [node]);
    } catch (error) {
      this.visitedNodes.set(node.id, { code: node.code, data: error });
      this.machine('Throw');
      node.status = 'Error';
      this.command.emitter('running', 'error', [node, error]);
    }
    this.refreshEnvs();
    if (await this.tryRunning(nextData)) {
      await this.next(node);
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

  async iterateRoots(): Promise<void> {
    if (await this.tryRunning()) {
      const not = this.metadata.edges.map((item) => item.end);
      const roots = this.metadata.nodes.filter((item) => not.indexOf(item.id) == -1);
      await Promise.all(roots.map((root) => this.visitNode(root)));
    }
  }

  async next(preNode: model.Node): Promise<void> {
    for (const edge of this.metadata.edges) {
      if (preNode.id == edge.start) {
        this.visitedEdges.add(edge.id);
        for (const node of this.metadata.nodes) {
          if (node.id == edge.end) {
            const next = this.preCheck(node);
            if (next.s) {
              await this.visitNode(node, next.d);
            }
          }
        }
      }
    }
  }

  async tryRunning(nextData?: any): Promise<boolean> {
    if (this.visitedNodes.size == this.metadata.nodes.length) {
      this.metadata.endTime = new Date();
      this.machine('Completed');
      this.refreshTasks();
      if (this.initStatus == 'Editable') {
        this.command.emitter('graph', 'status', 'Editable');
      } else if (this.initStatus == 'Viewable') {
        this.command.emitter('graph', 'status', 'Viewable');
      }
      await this.selfCircle(nextData);
      return false;
    }
    return true;
  }

  async selfCircle(nextData?: any) {
    if (this.transfer.metadata.isSelfCirculation) {
      let judge = this.transfer.metadata.judge;
      if (judge) {
        let params = this.metadata.env?.params;
        const res = this.transfer.running(judge, nextData, params);
        if (res.success) {
          await this.transfer.nextExecute(this);
        }
      }
    }
  }
}

export const getDefaultFormNode = (): model.Form => {
  return {
    id: common.generateUuid(),
    code: 'form',
    name: '表单',
    typeName: '表单',
    formId: '',
  };
};

export const getDefaultTableNode = (): model.Tables => {
  return {
    id: common.generateUuid(),
    code: 'table',
    name: '表格',
    typeName: '表格',
    formIds: [],
  };
};

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
    idName: 'id',
    nameName: 'name',
    source: '',
    target: '',
    mappingType: 'OToI',
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
    name: '子图',
    typeName: '子图',
    nextId: '',
  };
};
