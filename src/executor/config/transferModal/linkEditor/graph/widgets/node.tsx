import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { model } from '@/ts/base';
import { XTarget } from '@/ts/base/schema';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Graph, Node } from '@antv/x6';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import cls from './../../index.module.less';
import { TransferStore } from './graph';
import { ITransfer } from '@/ts/core';

interface IProps {
  node: Node;
  graph: Graph;
}

type ShowType = Exclude<model.GStatus, 'Completed'>;

export const ProcessingNode: React.FC<IProps> = ({ node, graph }) => {
  const store = graph.getPlugin<TransferStore>('TransferStore');
  const [status, setStatus] = useState<ShowType>(store?.initStatus ?? 'Viewable');
  const [data, setData] = useState<model.Node>(node.getData() as model.Node);
  useEffect(() => {
    const id = store?.transfer.subscribe((type, cmd, args) => {
      switch (type) {
        case 'graph':
          switch (cmd) {
            case 'status':
              setStatus(args);
              break;
          }
          break;
        case 'node':
          switch (cmd) {
            case 'update':
              if (args.id == data.id) {
                setData(args);
              }
              break;
          }
      }
    });
    return () => {
      return store?.transfer.unsubscribe(id!);
    };
  });
  switch (status) {
    case 'Editable':
      return (
        <EditingNode
          transfer={store?.transfer}
          current={data}
          node={node}
          graph={graph}
        />
      );
    case 'Viewable':
      return <ViewNode current={data} />;
    case 'Running':
      return (
        <RunningNode
          transfer={store?.transfer}
          current={data}
          node={node}
          graph={graph}
        />
      );
  }
};

interface RunProps extends IProps {
  transfer?: ITransfer;
  current: model.Node;
}

const RunningNode: React.FC<RunProps> = ({ current, transfer }) => {
  const [status, setStatus] = useState<model.NStatus>((current as model.RunNode).status);
  useEffect(() => {
    const id = transfer?.command.subscribe(async (type, cmd, args) => {
      switch (type) {
        case 'running':
          const node = args[0];
          if (node.id == current.id) {
            switch (cmd) {
              case 'status':
                setStatus(args[0]);
                if (args[0] == 'Error') {
                  message.error(args[1]?.message ?? '执行异常');
                }
                break;
            }
          }
          break;
      }
    });
    return () => {
      transfer?.command.unsubscribe(id!);
    };
  });
  return (
    <div className={`${cls['flex-row']} ${cls['container']} ${cls['border']}`}>
      <Tag typeName={current.typeName} transfer={transfer} />
      <Status status={status} />
      <Info name={current.name} />
    </div>
  );
};

interface ViewProps {
  current: model.Node;
}

const ViewNode: React.FC<ViewProps> = ({ current }) => {
  return (
    <div className={`${cls['flex-row']} ${cls['container']} ${cls['border']}`}>
      <Tag typeName={current.typeName} />
      <Status status={'Viewable'} />
      <Info name={current.name} />
    </div>
  );
};

interface EditingProps extends IProps {
  transfer?: ITransfer;
  current: model.Node;
}

const EditingNode: React.FC<EditingProps> = ({ node, transfer, current }) => {
  const [visibleMenu, setVisibleMenu] = useState<boolean>(false);
  const [pos, setPosition] = useState<{ x: number; y: number }>();
  const [visibleClosing, setVisibleClosing] = useState<boolean>(false);
  useEffect(() => {
    const id = transfer?.command.subscribe(async (type, cmd, args) => {
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
            case 'contextmenu':
              if (args.node.id == node.id) {
                const position = node.getPosition();
                setVisibleMenu(true);
                setPosition({ x: args.x - position.x, y: args.y - position.y });
              }
              break;
            case 'delete':
              if (args.id == node.id) {
                node.remove();
              }
              break;
            case 'refresh':
              break;
          }
          break;
      }
    });
    return () => {
      transfer?.command.unsubscribe(id ?? '');
    };
  });
  return (
    <div
      className={`${cls['flex-row']} ${cls['container']} ${cls['border']}`}
      onMouseEnter={() => setVisibleClosing(true)}
      onMouseLeave={() => setVisibleClosing(false)}
      onDoubleClick={() => {
        switch (current.typeName) {
          case '脚本':
            transfer?.command.emitter('tools', 'update', current);
            break;
          default:
            transfer?.command.emitter('tools', 'edit', current);
            break;
        }
      }}>
      <Tag typeName={current.typeName} transfer={transfer} />
      <Status status={'Editable'} />
      <Info name={current.name} />
      {visibleClosing && <Remove onClick={() => node.remove()} />}
      {visibleMenu && <ContextMenu transfer={transfer} node={current} pos={pos!} />}
    </div>
  );
};

interface RemoveProps {
  onClick: () => void;
}

const Remove: React.FC<RemoveProps> = ({ onClick }) => {
  const style = { color: '#9498df', fontSize: 12 };
  return (
    <CloseCircleOutlined
      style={style}
      className={cls['remove']}
      onClick={() => onClick()}
    />
  );
};

interface StatusProps {
  status: model.NStatus;
}

const Status: React.FC<StatusProps> = ({ status }) => {
  switch (status) {
    case 'Editable':
      return <PauseCircleOutlined style={{ color: '#9498df', fontSize: 18 }} />;
    case 'Viewable':
      return <PauseCircleOutlined style={{ color: '#9498df', fontSize: 18 }} />;
    case 'Running':
      return <LoadingOutlined style={{ color: '#9498df', fontSize: 18 }} />;
    case 'Completed':
      return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />;
    case 'Error':
      return <StopOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
  }
};

interface TagProps {
  typeName: string;
  transfer?: ITransfer;
}

const Tag: React.FC<TagProps> = ({ typeName, transfer }) => {
  const belongId = transfer?.metadata.belongId ?? '';
  return (
    <div className={cls['tag']}>
      <div className={`${cls['tag-item']} ${cls['text-overflow']}`}>{typeName}</div>
      <div className={`${cls['tag-item']} ${cls['text-overflow']}`}>
        {transfer?.findMetadata<XTarget>(belongId)?.name ?? '归属'}
      </div>
    </div>
  );
};

interface ContextProps {
  transfer?: ITransfer;
  node: model.Node;
  pos: { x: number; y: number };
}

const ContextMenu: React.FC<ContextProps> = ({ transfer, node, pos }) => {
  const menus: { [key: string]: MenuItemType } = {
    open: {
      key: 'edit',
      label: '打开',
      itemType: '打开',
      children: [],
    },
    update: {
      key: 'update',
      label: '更新',
      itemType: '更新',
      children: [],
    },
    copy: {
      key: 'copy',
      label: '复制',
      itemType: '复制',
      children: [],
    },
  };
  return (
    <div
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.stopPropagation()}
      className={`${cls['context-menu']} ${cls['context-border']}`}>
      <ul className={`${cls['dropdown']}`}>
        {Object.keys(menus)
          .map((key) => menus[key])
          .map((item) => {
            return (
              <li
                key={item.key}
                className={`${cls['item']}`}
                onClick={(e) => {
                  e.stopPropagation();
                  transfer?.command.emitter('tools', item.key, node);
                }}>
                {item.label}
              </li>
            );
          })}
      </ul>
    </div>
  );
};

interface InfoProps {
  name: string;
}

// 节点信息
const Info: React.FC<InfoProps> = ({ name }) => {
  return (
    <div className={`${cls['flex-row']} ${cls['info']} ${cls['border']}`}>
      <EntityIcon entityId={name} />
      <div style={{ marginLeft: 10 }}>{name}</div>
    </div>
  );
};
