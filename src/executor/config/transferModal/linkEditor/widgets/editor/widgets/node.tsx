import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { model } from '@/ts/base';
import { generateUuid, sleep } from '@/ts/base/common';
import { ShareIdSet } from '@/ts/core/public/entity';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Graph, Node } from '@antv/x6';
import React, { useEffect, useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import cls from './../../../index.module.less';
import { generateEdge } from './edge';
import { LinkStore } from './graph';

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

export const addNode = (props: NodeOptions): Node<Node.Properties> => {
  const { graph, position } = props;
  const id = generateUuid();
  const node: Node.Metadata = {
    id: id,
    shape: 'data-processing-dag-node',
    ...position,
    data: {},
    ports: [
      {
        id: `${id}-in`,
        group: 'in',
      },
      {
        id: `${id}-out`,
        group: 'out',
      },
    ],
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
  });
  const source = node.id;
  const target = newNode.id;
  // 创建该节点出发到下游节点的边
  createEdge(source, target, graph);
};

const menus: { [key: string]: MenuItemType } = {
  open: {
    key: 'open',
    label: '编辑',
    itemType: '编辑',
    children: [],
  },
  update: {
    key: 'update',
    label: '更新',
    itemType: '更新',
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

interface Info {
  node: Node;
  graph: Graph;
}

export const ProcessingNode: React.FC<Info> = ({ node, graph }) => {
  const entity = node.getData() as model.Node<any>;
  const link = graph.getPlugin<LinkStore>('LinkStore')!.link;
  const [graphStatus, setGraphStatus] = useState<model.GraphStatus>(link.status);
  const [nodeStatus, setNodeStatus] = useState<model.NodeStatus>('Stop');
  const [visible, setVisible] = useState<boolean>(false);
  const [visibleOperate, setVisibleOperate] = useState<boolean>(false);
  const [visibleClosing, setVisibleClosing] = useState<boolean>(true);
  const [visibleMenu, setVisibleMenu] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>();

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

  useEffect(() => {
    const id = link.command.subscribe(async (type, cmd, args) => {
      switch (type) {
        case 'blank': {
          switch (cmd) {
            case 'click':
            case 'contextmenu':
              setVisibleMenu(false);
              break;
          }
          break;
        }
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
              setNodeStatus('Stop');
              break;
            case 'contextmenu':
              if (args.node.id == node.id) {
                const position = node.getPosition();
                setVisibleMenu(true);
                setMenuPosition({ x: args.x - position.x, y: args.y - position.y });
              }
              break;
          }
          break;
        case 'ergodic':
          try {
            await sleep(500);
            switch (cmd) {
              case '请求': {
                break;
              }
              case '脚本': {
                break;
              }
              case '映射': {
                break;
              }
              case '实体配置':
              case '事项配置': {
                return;
              }
              case '选择': {
                break;
              }
              case '存储': {
                break;
              }
            }
            setNodeStatus('Completed');
          } catch (error) {
            setNodeStatus('Error');
          }
          break;
      }
    });
    return () => {
      link.command.unsubscribe(id);
    };
  });

  // 状态
  const Status: React.FC<{}> = () => {
    switch (nodeStatus) {
      case 'Stop':
        return <PauseCircleOutlined style={{ color: '#9498df', fontSize: 18 }} />;
      case 'Running':
        return <LoadingOutlined style={{ color: '#9498df', fontSize: 18 }} />;
      case 'Completed':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />;
      case 'Error':
        return <StopOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
    }
  };

  // 节点信息
  const Info: React.FC<{}> = () => {
    return (
      <div className={`${cls['flex-row']} ${cls['info']} ${cls['border']}`}>
        <EntityIcon entity={entity} />
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
          {ShareIdSet.get(entity.belongId)?.name}
        </div>
      </div>
    );
  };

  // 右键菜单
  const ContextMenu: React.FC<{}> = () => {
    return (
      <div
        style={{
          visibility: visibleMenu ? 'visible' : 'hidden',
          left: menuPosition?.x,
          top: menuPosition?.y,
        }}
        onContextMenu={(e) => e.stopPropagation()}
        className={`${cls['context-menu']} ${cls['context-border']}`}>
        <ul className={`${cls['dropdown']}`}>
          {[menus.open, menus.update].map((item) => {
            return (
              <li
                key={item.key}
                className={`${cls['item']}`}
                onClick={(e) => {
                  e.stopPropagation();
                  link.command.emitter('entity', item.key, { entity });
                  setVisibleMenu(false);
                }}>
                {item.label}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // 结构
  return (
    <div
      className={`
        ${cls['flex-row']}
        ${cls['container']}
        ${cls['border']}
        ${visible ? cls['selected'] : ''}`}
      onMouseEnter={() => setVisibleClosing(true)}
      onMouseLeave={() => setVisibleClosing(false)}
      onDoubleClick={() => {
        switch (entity.typeName) {
          case '脚本':
            link.command.emitter('entity', 'update', { entity });
            break;
          default:
            link.command.emitter('entity', 'open', { entity });
            break;
        }
      }}>
      <Tag />
      <Status />
      <Info />
      {graphStatus == 'Editable' && (
        <>
          <Remove />
          <ContextMenu />
        </>
      )}
    </div>
  );
};
