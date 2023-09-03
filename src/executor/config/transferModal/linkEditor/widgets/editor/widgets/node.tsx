import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { generateUuid, sleep } from '@/ts/base/common';
import { linkCmd } from '@/ts/base/common/command';
import { XEntity, XExecutable } from '@/ts/base/schema';
import { IEntity, ShareIdSet, ShareSet } from '@/ts/core/public/entity';
import { ConfigColl, IExecutable, IRequest, ISelection } from '@/ts/core/thing/config';
import Encryption from '@/utils/encryption';
import { Sandbox } from '@/utils/sandbox';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Cell, Graph, Model, Node } from '@antv/x6';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import { AiFillPlusCircle } from 'react-icons/ai';
import { MenuItemType } from 'typings/globelType';
import cls from './../../../index.module.less';
import { Persistence, Temping } from './graph';
import { AxiosError } from 'axios';
import { generateEdge } from './edge';

export enum ExecStatus {
  Stop = 'stop',
  Running = 'running',
  Completed = 'completed',
  Error = 'error',
}

export interface DataNode {
  entityId: string;
}

interface NodeOptions {
  graph: Graph;
  position: { x: number; y: number };
}

/**
 * 根据起点初始下游节点的位置信息
 * @param node 起始节点
 * @param graph
 * @param dx
 * @param dy
 * @returns
 */
const getDownstreamNodePosition = (node: Node, graph: Graph, dx = 250, dy = 100) => {
  // 找出画布中以该起始节点为起点的相关边的终点id集合
  const downstreamNodeIdList: string[] = [];
  graph.getEdges().forEach((edge) => {
    const originEdge = edge.toJSON();
    if (originEdge.source.cell === node.id) {
      downstreamNodeIdList.push(originEdge.target);
    }
  });
  // 获取起点的位置信息
  const position = node.getPosition();
  let minX = Infinity;
  let maxY = -Infinity;
  graph.getNodes().forEach((graphNode) => {
    if (downstreamNodeIdList.indexOf(graphNode.id) > -1) {
      const nodePosition = graphNode.getPosition();
      // 找到所有节点中最左侧的节点的x坐标
      if (nodePosition.x < minX) {
        minX = nodePosition.x;
      }
      // 找到所有节点中最x下方的节点的y坐标
      if (nodePosition.y > maxY) {
        maxY = nodePosition.y;
      }
    }
  });

  return {
    x: minX !== Infinity ? minX : position.x + dx,
    y: maxY !== -Infinity ? maxY + dy : position.y,
  };
};

// 根据节点的类型获取ports
const getPortsByType = (id: string) => {
  return [
    {
      id: `${id}-in`,
      group: 'in',
    },
    {
      id: `${id}-out`,
      group: 'out',
    },
  ];
};

export const addNode = (props: NodeOptions & DataNode): Node<Node.Properties> => {
  const { graph, position, entityId } = props;
  const id = generateUuid();
  const node: Node.Metadata = {
    id: id,
    shape: 'data-processing-dag-node',
    ...position,
    data: { entityId: entityId },
    ports: getPortsByType(id),
  };
  return graph.addNode(node);
};

/**
 * 创建边并添加到画布
 * @param source
 * @param target
 * @param graph
 */
export const createEdge = (source: string, target: string, graph: Graph) => {
  const edge = {
    ...generateEdge(),
    source: {
      cell: source,
      port: `${source}-out`,
    },
    target: {
      cell: target,
      port: `${target}-in`,
    },
  };
  if (graph) {
    graph.addEdge(edge);
  }
};

// 创建下游的节点和边
export const createDownstream = (graph: Graph, node: Node, entityId: string) => {
  // 获取下游节点的初始位置信息
  const position = getDownstreamNodePosition(node, graph);
  // 创建下游节点
  const newNode = addNode({
    graph: graph,
    position: { ...position },
    entityId: entityId,
  });
  const source = node.id;
  const target = newNode.id;
  // 创建该节点出发到下游节点的边
  createEdge(source, target, graph);
};

const menus: { [key: string]: MenuItemType } = {
  request: {
    key: ConfigColl.Requests,
    label: '请求',
    itemType: '请求',
    children: [],
  },
  script: {
    key: ConfigColl.Scripts,
    label: '脚本',
    itemType: '脚本',
    children: [],
  },
  mapping: {
    key: ConfigColl.Mappings,
    label: '映射',
    itemType: '映射',
    children: [],
  },
  store: {
    key: ConfigColl.Stores,
    label: '数据',
    itemType: '数据',
    children: [],
  },
  form: {
    key: 'form',
    label: '表单',
    itemType: '表单',
    children: [],
  },
  selection: {
    key: ConfigColl.Selections,
    label: '选择',
    itemType: '选择',
    children: [],
  },
};

/** 拉出节点可以创建的下一步节点 */
const getNextMenu = (typeName: string): MenuItemType[] => {
  switch (typeName) {
    case '请求':
    case '脚本':
      return [menus.script, menus.request, menus.mapping, menus.store, menus.selection];
    case '映射':
      return [menus.script, menus.mapping, menus.store];
    case '实体配置':
    case '事项配置':
      return [menus.script];
    case '选择':
      return [menus.script, menus.request];
    default:
      return [];
  }
};

// 遍历参数
interface ErgodicArgs {
  preNode?: Node;
  preData?: any;
  nodeId: string;
}

// 发送消息
const emitter = (type: string, preNode: Node, nextId: string, preData: any) => {
  linkCmd.emitter('ergodic', type, {
    preNode: preNode,
    preData: preData,
    nodeId: nextId,
  });
};

interface Info {
  node: Node;
  graph: Graph;
}

export const getShareEntity = (
  node: Node | Cell<Cell.Properties>,
): IEntity<XEntity> | undefined => {
  const { entityId } = node.getData() as DataNode;
  return ShareSet.get(entityId);
};

export const ProcessingNode: React.FC<Info> = ({ node, graph }) => {
  const [nodeStatus, setNodeStatus] = useState<ExecStatus>(ExecStatus.Stop);
  const [visible, setVisible] = useState<boolean>(false);
  const [visibleOperate, setVisibleOperate] = useState<boolean>(false);
  const [visibleClosing, setVisibleClosing] = useState<boolean>(false);
  const entity = getShareEntity(node);
  if (!entity) {
    return <></>;
  }

  useEffect(() => {
    const id = linkCmd.subscribe(async (type, cmd, args) => {
      switch (type) {
        case 'node':
          switch (cmd) {
            case 'selected':
              if (args.node.id == node.id) {
                setVisible(true);
              }
              break;
            case 'unselected':
              if (args.node.id == node.id) {
                setVisible(false);
                setVisibleOperate(false);
              }
              break;
            case 'clearStatus':
              setNodeStatus(ExecStatus.Stop);
              break;
          }
          break;
        case 'ergodic':
          const { nodeId, preData } = args as ErgodicArgs;
          if (nodeId != node.id) return;
          setNodeStatus(ExecStatus.Running);
          const ergodic = (nextData: any) => {
            const iterator: Model.SearchIterator = (cell, distance) => {
              if (distance == 1) {
                const next = getShareEntity(cell);
                if (next) {
                  emitter(next.metadata.typeName, node, cell.id, nextData);
                }
              }
            };
            graph.searchCell(node, iterator, { outgoing: true });
          };
          const formCall = (type: string, data: any, msg?: string) => {
            switch (type) {
              case '成功':
                setNodeStatus(ExecStatus.Completed);
                ergodic(data);
                break;
              case '取消':
              case '错误':
                message.error(msg);
                setNodeStatus(ExecStatus.Error);
                break;
            }
          };
          const isArray = (data: any) => {
            if (!(data instanceof Array)) {
              throw new Error('输入必须是一个数组！');
            }
          };
          const temping = graph.getPlugin<Temping>(Persistence);
          const curEnv = temping?.curEnv();
          const executing = (input: any, coder: string): any => {
            const runtime = {
              environment: curEnv,
              preData: input,
              nextData: {},
              ...Encryption,
            };
            console.log(runtime);
            Sandbox(coder)(runtime);
            linkCmd.emitter('environments', 'refresh', graph);
            return runtime.nextData;
          };
          try {
            await sleep(1000);
            switch (cmd) {
              case '请求': {
                const request = entity as IRequest;
                const response = await request.exec({ ...curEnv, ...preData });
                const exec = request.metadata.suffixExec;
                if (exec) {
                  const executable = ShareIdSet.get(exec) as XExecutable;
                  ergodic(executing(response, executable.coder));
                  break;
                }
                ergodic(response);
                break;
              }
              case '脚本': {
                const exec = entity as IExecutable;
                ergodic(executing(preData, exec.metadata.coder));
                break;
              }
              case '映射': {
                isArray(preData.array);
                break;
              }
              case '实体配置':
              case '事项配置': {
                linkCmd.emitter('input', 'open', {
                  formId: entity.id,
                  call: formCall,
                });
                return;
              }
              case '选择': {
                isArray(preData.array);
                const selection = entity as ISelection;
                linkCmd.emitter('selection', 'open', {
                  selection: selection.metadata,
                  data: preData.array,
                  call: formCall,
                });
                break;
              }
            }
            setNodeStatus(ExecStatus.Completed);
          } catch (error) {
            console.log(error);
            if (error instanceof AxiosError) {
              if (error.response) {
                const data = error.response.data;
                const msg = '执行请求异常，错误信息：' + JSON.stringify(data);
                message.error(msg);
              } else {
                message.error('执行请求异常，错误信息：' + error.message);
              }
            } else if (error instanceof Error) {
              message.error('执行异常，错误信息：' + error.message);
            } else {
              message.error('执行异常');
            }
            setNodeStatus(ExecStatus.Error);
          }
          break;
      }
    });
    return () => {
      linkCmd.unsubscribe(id);
    };
  });

  // 展开菜单
  const PlusMenus: React.FC<{}> = () => {
    const menus = getNextMenu(entity.typeName);
    return (
      <div
        style={{ visibility: visible ? 'visible' : 'hidden' }}
        className={`${cls['flex-row']} ${cls['plus-menu']}`}>
        <AiFillPlusCircle
          size={24}
          color={'#9498df'}
          onClick={() => setVisibleOperate(!visibleOperate)}
        />
        <ul
          className={`${cls['dropdown']}`}
          style={{ visibility: visibleOperate ? 'visible' : 'hidden' }}>
          {menus.map((item) => {
            return (
              <li
                key={item.key}
                className={`${cls['item']}`}
                onClick={() => {
                  switch (item.itemType) {
                    case '请求':
                    case '脚本':
                    case '映射':
                    case '选择':
                      linkCmd.emitter('graph', 'openSelector', [node, item]);
                      break;
                  }
                }}>
                {item.label}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // 状态
  const Status: React.FC<{}> = () => {
    switch (nodeStatus) {
      case ExecStatus.Stop:
        return <PauseCircleOutlined style={{ color: '#9498df', fontSize: 18 }} />;
      case ExecStatus.Running:
        return <LoadingOutlined style={{ color: '#9498df', fontSize: 18 }} />;
      case ExecStatus.Completed:
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />;
      case ExecStatus.Error:
        return <StopOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
    }
  };

  // 节点信息
  const Info: React.FC<{}> = () => {
    return (
      <div className={`${cls['flex-row']} ${cls['info']} ${cls['border']}`}>
        <EntityIcon entity={entity.metadata} />
        <div style={{ marginLeft: 10 }}>{entity.name}</div>
      </div>
    );
  };

  // 标签
  const Tag: React.FC<{}> = () => {
    return (
      <div className={cls['tag']}>
        <div className={`${cls['tag-item']} ${cls['text-overflow']}`}>
          {entity.typeName}
        </div>
        <div className={`${cls['tag-item']} ${cls['text-overflow']}`}>
          {ShareIdSet.get(entity.metadata.belongId)?.name}
        </div>
      </div>
    );
  };

  // 删除标记
  const Remove: React.FC<{}> = () => {
    if (visibleClosing) {
      const style = { color: '#9498df', fontSize: 12 };
      return (
        <CloseCircleOutlined
          style={style}
          className={cls['remove']}
          onClick={() => {
            node.remove();
          }}
        />
      );
    }
    return <></>;
  };

  // 结构
  return (
    <div
      className={`${cls['flex-row']} ${cls['container']} ${cls['border']}`}
      onMouseEnter={() => setVisibleClosing(true)}
      onMouseLeave={() => setVisibleClosing(false)}
      onDoubleClick={() => linkCmd.emitter('entity', 'update', { entity })}>
      <Remove></Remove>
      <Tag></Tag>
      <Status></Status>
      <PlusMenus></PlusMenus>
      <Info></Info>
    </div>
  );
};
