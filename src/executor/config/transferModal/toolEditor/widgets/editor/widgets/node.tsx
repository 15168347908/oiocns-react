import { XFileInfo } from '@/ts/base/schema';
import { Graph, Node, StringExt } from '@antv/x6';
import { Dropdown } from 'antd';
import { MenuItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useState } from 'react';
import { IconBaseProps } from 'react-icons';
import { AiFillPlusCircle, AiOutlineCheck, AiOutlineLoading } from 'react-icons/ai';
import cls from './../index.module.less';

export enum ExecStatus {
  Stop = 'stop',
  Running = 'running',
  Completed = 'completed',
}

const config: IconBaseProps = { size: 12, color: '#9498df' };
const statusMap: { [key: string]: React.ReactNode } = {
  [ExecStatus.Stop]: <AiOutlineCheck {...config} />,
  [ExecStatus.Running]: <AiOutlineLoading {...config} />,
};

interface DataNode<XFileInfo, S> {
  entity: XFileInfo;
  status: S;
}

interface NodeOptions {
  graph: Graph;
  position: { x: number; y: number };
}

interface Info {
  node: Node;
  graph: Graph;
}

/**
 * 根据起点初始下游节点的位置信息
 * @param node 起始节点
 * @param graph
 * @returns
 */
const getDownstreamNodePosition = (node: Node, graph: Graph, dx = 250, dy = 100) => {
  // 找出画布中以该起始节点为起点的相关边的终点id集合
  const downstreamNodeIdList: string[] = [];
  graph.getEdges().forEach((edge) => {
    const originEdge = edge.toJSON()?.data;
    if (originEdge.source === node.id) {
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
const getPortsByType = (entity: XFileInfo) => {
  let ports = [];
  switch (entity.typeName) {
    default:
      ports = [
        {
          id: `${entity.id}-in`,
          group: 'in',
        },
        {
          id: `${entity.id}-out`,
          group: 'out',
        },
      ];
      break;
  }
  return ports;
};

export const addNode = <X extends XFileInfo, S>(
  props: NodeOptions & DataNode<X, S>,
): Node<Node.Properties> => {
  const { graph, position, entity } = props;
  const node: Node.Metadata = {
    shape: 'data-processing-dag-node',
    ...position,
    data: {
      nodeType: entity.typeName,
      status: ExecStatus.Stop,
      entity: entity,
    },
    ports: getPortsByType(entity),
  };
  const ans = graph.addNode(node)
  console.log(node);
  return ans;
};

/**
 * 创建边并添加到画布
 * @param source
 * @param target
 * @param graph
 */
const createEdge = (source: string, target: string, graph: Graph) => {
  const edge = {
    id: StringExt.uuid(),
    shape: 'data-processing-curve',
    source: {
      cell: source,
      port: `${source}-out`,
    },
    target: {
      cell: target,
      port: `${target}-in`,
    },
    zIndex: -1,
    data: {
      source,
      target,
    },
  };
  if (graph) {
    graph.addEdge(edge);
  }
};

// 创建下游的节点和边
const createDownstream = (graph: Graph, node: Node, entity: XFileInfo) => {
  // 获取下游节点的初始位置信息
  const position = getDownstreamNodePosition(node, graph);
  // 创建下游节点
  const newNode = addNode({
    graph: graph,
    position: { ...position },
    entity: entity,
    status: ExecStatus.Stop,
  });
  const source = node.id;
  const target = newNode.id;
  // 创建该节点出发到下游节点的边
  createEdge(source, target, graph);
};

const menus = {
  request: {
    key: 'request',
    label: '请求',
  },
  script: {
    key: 'script',
    label: '脚本',
  },
};

/** 拉出节点可以创建的下一步节点 */
const getNextMenu = (entity: XFileInfo): MenuItemType[] => {
  switch (entity.typeName) {
    case '请求':
      return [menus.request, menus.script];
    case '脚本':
      return [menus.script];
    default:
      return [];
  }
};

export const ProcessingNode: React.FC<Info> = ({ node, graph }) => {
  const { entity, status } = node.getData() as DataNode<XFileInfo, ExecStatus>;
  const [fold, setFold] = useState<boolean>(false);
  const menus = getNextMenu(entity);
  console.log(node.getData());

  // 弹出拖动菜单
  const getPlusDagMenu = () => {
    return (
      <ul>
        {menus.map((item) => {
          return (
            <li
              className="each-sub-menu"
              key={item?.key}
              onClick={() => {
                createDownstream(graph, node, entity);
                setFold(false);
              }}>
              {item?.label}
            </li>
          );
        })}
      </ul>
    );
  };

  const Next: React.FC<any> = () => {
    switch (entity.typeName) {
      case '请求':
        return (
          <Dropdown
            open={fold}
            placement="bottom"
            trigger={['click', 'contextMenu']}
            dropdownRender={getPlusDagMenu}
            onOpenChange={setFold}
            menu={{
              items: menus,
              onClick: ({ key }) => {
                console.log(key);
              },
            }}>
            <AiFillPlusCircle size={24} color={'#9498df'} />
          </Dropdown>
        );
      default:
        return <></>;
    }
  };
  return (
    <div className={`${cls['container']} ${cls['flex-row']}`}>
      <div>{entity.name}</div>
      {statusMap[status]}
      <div className={`${cls['flex-row']} ${cls['plus-menu']}`}>{<Next></Next>}</div>
    </div>
  );
};
