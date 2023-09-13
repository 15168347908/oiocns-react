import { XForm } from '@/ts/base/schema';
import { Command, common, kernel, model, schema } from '../../../base';
import { IDirectory } from '../directory';
import { IStandardFileInfo, StandardFileInfo } from '../fileinfo';
import { sleep } from '@/ts/base/common';

export type GraphData = () => any;

export interface ITransfer extends IStandardFileInfo<model.Transfer> {
  /** 触发器 */
  command: Command;
  /** 任务记录 */
  taskList: model.Environment[];
  /** 当前任务 */
  curTask?: model.Environment;
  /** 已遍历点 */
  curVisited?: Set<string>;
  /** 前置链接 */
  curPreLink?: ITransfer;
  /** 图状态 */
  status: model.GraphStatus;
  /** 状态转移 */
  machine(event: model.Event): void;
  /** 取图数据 */
  getData?: GraphData;
  /** 绑定图 */
  binding(getData: GraphData): void;
  /** 获取节点 */
  getNode(id: string): model.Node<any> | undefined;
  /** 增加节点 */
  addNode(node: model.Node<any>): Promise<void>;
  /** 更新节点 */
  updNode(node: model.Node<any>): Promise<void>;
  /** 删除节点 */
  delNode(id: string): Promise<void>;
  /** 节点添加脚本 */
  addNodeScript(p: model.Pos, n: model.Node<any>, s: model.Script): Promise<void>;
  /** 节点更新脚本 */
  updNodeScript(p: model.Pos, n: model.Node<any>, s: model.Script): Promise<void>;
  /** 节点删除脚本 */
  delNodeScript(p: model.Pos, n: model.Node<any>, id: string): Promise<void>;
  /** 遍历节点 */
  visitNode(node: model.Node<any>, preData?: any): Promise<void>;
  /** 获取边 */
  getEdge(id: string): model.Edge | undefined;
  /** 增加边 */
  addEdge(edge: model.Edge): Promise<void>;
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
  /** 变更环境 */
  changeEnv(id: string): Promise<void>;
  /** 请求 */
  request(node: model.Node<any>): Promise<model.HttpResponseType>;
  /** 脚本 */
  running(code: string, args: any): any;
  /** 映射 */
  mapping(node: model.Node<any>, array: any[]): Promise<any[]>;
  /** 开始执行 */
  execute(link?: ITransfer): void;
}

export class Transfer extends StandardFileInfo<model.Transfer> implements ITransfer {
  command: Command;
  taskList: model.Environment[];
  preStatus: model.GraphStatus;
  status: model.GraphStatus;
  curTask?: model.Environment;
  curVisited?: Set<string>;
  curPreLink?: ITransfer;
  getData?: GraphData;

  constructor(metadata: model.Transfer, dir: IDirectory) {
    super(metadata, dir, dir.resource.transferColl);
    this.command = new Command();
    this.taskList = [];
    this.preStatus = 'Editable';
    this.status = 'Editable';
    this.command.subscribe((type, cmd, args) => {
      switch (type) {
        case 'main':
          this.handing(cmd, args);
          break;
      }
    });
    this.setEntity();
  }

  protected receiveMessage(operate: string, data: model.Transfer): void {
    super.receiveMessage(operate, data);
    switch (operate) {
      case 'replace':
        this.command.emitter('graph', 'refresh');
        break;
    }
  }

  machine(event: model.Event): void {
    switch (event) {
      case 'Edit':
      case 'View':
        if (this.status == 'Running') {
          throw new Error('正在运行中！');
        }
        this.preStatus = this.status;
        this.status = event == 'Edit' ? 'Editable' : 'Viewable';
        break;
      case 'Run':
        if (this.status == 'Running') {
          return;
        }
        this.preStatus = this.status;
        this.status = 'Running';
        break;
    }
    this.command.emitter('graph', 'status', this.status);
  }

  binding(getData: GraphData): void {
    this.getData = getData;
  }

  async update(data: model.Transfer): Promise<boolean> {
    data.graph = this.getData?.();
    return super.update(data);
  }

  execute(link?: ITransfer) {
    this.machine('Run');
    this.curVisited = new Set();
    const env = this.metadata.envs.find((item) => item.id == this.metadata.curEnv);
    if (env) {
      this.curTask = common.deepClone(env);
      this.taskList.push(this.curTask);
    }
    this.curPreLink = link;
    this.command.emitter('main', 'refresh');
    this.command.emitter('main', 'roots');
  }

  async request(node: model.Node<any>): Promise<model.HttpResponseType> {
    let request = common.deepClone(node.data as model.HttpRequestType);
    let json = JSON.stringify(request);
    for (const match of json.matchAll(/\{\{[^{}]*\}\}/g)) {
      for (let index = 0; index < match.length; index++) {
        let matcher = match[index];
        let varName = matcher.substring(2, matcher.length - 2);
        switch (this.status) {
          case 'Running':
            json = json.replaceAll(matcher, this.curTask?.params[varName] ?? '');
            break;
          default:
            if (this.metadata.curEnv) {
              for (const env of this.metadata.envs) {
                if (env.id == this.metadata.curEnv) {
                  json = json.replaceAll(matcher, env.params[varName] ?? '');
                }
              }
            } else {
              json = json.replaceAll(matcher, '');
            }
            break;
        }
      }
    }
    let data = (await kernel.httpForward(JSON.parse(json))).data;
    return JSON.parse(data.content);
  }

  running(code: string, args: any): any {
    const runtime = {
      environment: this.curTask,
      preData: args,
      nextData: {},
      decrypt: common.decrypt,
      encrypt: common.encrypt,
      log: (...message: string[]) => {
        console.log(message);
      },
    };
    common.Sandbox(code)(runtime);
    return runtime.nextData;
  }

  async mapping(node: model.Node<any>, array: any[]): Promise<any[]> {
    const ans: any[] = [];
    const data = node.data as model.Mapping;
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
        let newItem: { [key: string]: any } = { Id: 'snowId()' };
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

  getNode(id: string): model.Node<any> | undefined {
    for (const node of this.metadata.nodes) {
      if (node.id == id) {
        return node;
      }
    }
  }

  async addNode(node: model.Node<any>): Promise<void> {
    node.preScripts = [];
    node.postScripts = [];
    let index = this.metadata.nodes.findIndex((item) => item.id == node.id);
    if (index == -1) {
      this.metadata.nodes.push(node);
      if (await this.update(this.metadata)) {
        this.command.emitter('node', 'add', node);
      }
    }
  }

  async updNode(node: model.Node<any>): Promise<void> {
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

  async addNodeScript(p: model.Pos, n: model.Node<any>, s: model.Script): Promise<void> {
    s.id = 'snowId()';
    switch (p) {
      case 'pre':
        n.preScripts.push(s);
        break;
      case 'post':
        n.postScripts.push(s);
        break;
    }
    await this.updNode(n);
  }

  async updNodeScript(p: model.Pos, n: model.Node<any>, s: model.Script): Promise<void> {
    switch (p) {
      case 'pre': {
        let index = n.preScripts.findIndex((item) => item.id == s.id);
        if (index != -1) {
          n.preScripts[index] = s;
        }
        break;
      }
      case 'post': {
        let index = n.preScripts.findIndex((item) => item.id == s.id);
        if (index != -1) {
          n.postScripts[index] = s;
        }
        break;
      }
    }
    await this.updNode(n);
  }

  async delNodeScript(pos: model.Pos, node: model.Node<any>, id: string): Promise<void> {
    switch (pos) {
      case 'pre': {
        let index = node.preScripts.findIndex((item) => item.id == id);
        node.preScripts.splice(index, 1);
        break;
      }
      case 'post': {
        let index = node.postScripts.findIndex((item) => item.id == id);
        node.postScripts.splice(index, 1);
        break;
      }
    }
    await this.updNode(node);
  }

  async visitNode(node: model.Node<any>, preData?: any): Promise<void> {
    this.command.emitter('running', 'start', [node]);
    try {
      await sleep(1000);
      for (const script of node.preScripts ?? []) {
        preData = this.running(script.code, preData);
      }
      let nextData: any;
      switch (node.typeName) {
        case 'request':
          nextData = await this.request(node);
          break;
        case 'link':
          // TODO 替换其它方案
          this.getEntity<ITransfer>((node.data as model.Transfer).id)?.execute(this);
          break;
        case 'mapping':
          nextData = await this.mapping(node, preData.array);
          break;
        case 'store':
          break;
      }
      for (const script of node.postScripts ?? []) {
        nextData = this.running(script.code, nextData);
      }
      this.curVisited?.add(node.id);
      this.command.emitter('running', 'completed', [node, nextData]);
      this.command.emitter('main', 'next', [node]);
    } catch (error) {
      this.command.emitter('running', 'error', [node, error]);
    }
  }

  getEdge(id: string): model.Edge | undefined {
    for (let edge of this.metadata.edges) {
      if (edge.id == id) {
        return edge;
      }
    }
  }

  async addEdge(edge: model.Edge): Promise<void> {
    let index = this.metadata.edges.findIndex((item) => edge.id == item.id);
    if (index == -1) {
      this.metadata.edges.push(edge);
      if (await this.update(this.metadata)) {
        this.command.emitter('edge', 'add', edge);
      }
    }
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
      const id = 'snowId()';
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

  private preCheck(node: model.Node<any>): boolean {
    this.command.emitter('node', 'loading', node);
    for (const edge of this.metadata.edges) {
      if (node.id == edge.end) {
        if (!this.curVisited?.has(edge.id)) {
          return false;
        }
      }
    }
    return true;
  }

  private async handing(cmd: string, args: any) {
    switch (cmd) {
      case 'roots': {
        const not = this.metadata.edges.map((item) => item.end);
        const roots = this.metadata.nodes.filter((item) => not.indexOf(item.id) == -1);
        for (const root of roots) {
          this.visitNode(root);
        }
        break;
      }
      case 'visitNode': {
        if (this.preCheck(args)) {
          await this.visitNode(args);
        }
        break;
      }
      case 'next': {
        for (const edge of this.metadata.edges) {
          if (args[0].id == edge.start) {
            this.curVisited?.add(edge.id);
            for (const node of this.metadata.nodes) {
              if (node.id == edge.end) {
                this.command.emitter('main', 'visitNode', node, args[1]);
              }
            }
          }
        }
        break;
      }
    }
  }
}

export const getDefaultRequestNode = (): model.RequestNode => {
  return {
    id: 'snowId()',
    name: '请求',
    typeName: '请求',
    preScripts: [],
    postScripts: [],
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

export const getDefaultMappingNode = (): model.MappingNode => {
  return {
    id: 'snowId()',
    name: '映射',
    typeName: '映射',
    preScripts: [],
    postScripts: [],
    data: {
      source: '',
      target: '',
      mappings: [],
    },
  };
};

export const getDefaultStoreNode = (): model.StoreNode => {
  return {
    id: 'snowId()',
    name: '存储',
    typeName: '存储',
    preScripts: [],
    postScripts: [],
    data: {
      formId: '',
      directoryId: '',
    },
  };
};

export const getDefaultLinkNode = (): model.LinkNode => {
  return {
    id: 'snowId()',
    name: '链接',
    typeName: '链接',
    preScripts: [],
    postScripts: [],
    data: '',
  };
};
