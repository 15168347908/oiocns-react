import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { linkCmd } from '@/ts/base/common/command';
import { XEntity } from '@/ts/base/schema';
import { IDirectory, IEntity } from '@/ts/core';
import { ConfigColl } from '@/ts/core/thing/config';
import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import React, { ReactNode } from 'react';
import { MenuItemType } from 'typings/globelType';
import { NewEntity } from './linkEditor/widgets/toolBar';

type GenLabel = (current: IEntity<XEntity>) => ReactNode;

export type MenuItem = Omit<MenuItemType, 'Children'> & {
  node: ReactNode;
  isLeaf?: boolean;
  selectable: boolean;
  children: MenuItem[];
};

/** 根据类型加载不同文件项 */
const loadFiles = (current: IDirectory, typeNames: string[], genLabel?: GenLabel) => {
  const items = [];
  for (const typeName of typeNames) {
    switch (typeName) {
      case '事项配置':
      case '实体配置':
        items.push(
          ...current.forms
            .filter((item) => item.typeName == typeName)
            .map((entity) => loadEntity(entity, genLabel)),
        );
      default:
        items.push(
          ...(current.configs
            .get(typeName)
            ?.map((entity) => loadEntity(entity, genLabel)) ?? []),
        );
    }
  }
  return items;
};

/** 加载目录 */
export const loadDirs = (current: IDirectory): MenuItemType => {
  return loadMenus(current, []);
};

/** 单一类型菜单 */
export const loadMenu = (current: IDirectory, typeName: string): MenuItem => {
  return loadMenus(current, [typeName]);
};

/** 多类型菜单 */
export const loadMenus = (
  current: IDirectory,
  typeNames: string[],
  genLabel?: GenLabel,
): MenuItem => {
  return {
    key: current.id,
    item: current,
    label: current.name,
    itemType: current.typeName,
    icon: <EntityIcon entityId={current.id} typeName={current.typeName} size={18} />,
    children: [
      ...current.children.map((item) => loadMenus(item, typeNames, genLabel)),
      ...loadFiles(current, typeNames, genLabel),
    ],
    isLeaf: false,
    selectable: false,
    node: genLabel?.(current),
  };
};

/** 表单项 */
export const loadFormsMenu = (current: IDirectory, genLabel?: GenLabel) => {
  return loadMenus(current, ['事项配置', '实体配置'], genLabel);
};

/** 环境 */
export const loadEnvironmentsMenu = (current: IDirectory, genLabel?: GenLabel) => {
  return loadMenus(current, [ConfigColl.Environments], genLabel);
};

/** 脚本 */
export const loadScriptsMenu = (current: IDirectory, genLabel?: GenLabel) => {
  return loadMenus(current, [ConfigColl.Scripts], genLabel);
};

/** 请求 */
export const loadRequestsMenu = (current: IDirectory, genLabel?: GenLabel) => {
  return loadMenus(current, [ConfigColl.Requests], genLabel);
};

/** 文件项菜单 */
export const loadEntity = (entity: IEntity<XEntity>, genLabel?: GenLabel): MenuItem => {
  return {
    key: entity.id,
    item: entity,
    label: entity.name,
    itemType: entity.typeName,
    icon: <EntityIcon entityId={entity.id} typeName={entity.typeName} size={18} />,
    children: [],
    isLeaf: true,
    selectable: true,
    node: genLabel?.(entity),
  };
};

/** 默认展开的树节点 */
export const expand = (nodes: MenuItem[], targetTypes: string[]): string[] => {
  let ans: string[] = [];
  for (const node of nodes) {
    if (node.children) {
      const children = expand(node.children, targetTypes);
      if (children.length > 0) {
        ans.push(node.key);
        ans.push(...children);
      }
    }
    if (targetTypes.indexOf(node.itemType) != -1) {
      ans.push(node.key);
    }
  }
  return ans;
};

/** 默认的生成图标 */
export const defaultGenLabel = (entity: IEntity<XEntity>, types: string[]): ReactNode => {
  return (
    <Space>
      {entity.name}
      {types.indexOf(entity.typeName) != -1 && (
        <EditOutlined
          onClick={(e) => {
            e.stopPropagation();
            linkCmd.emitter('entity', 'update', { entity });
          }}
        />
      )}
      {entity.typeName == '目录' && (
        <NewEntity curDir={entity as IDirectory} types={types} size="small" />
      )}
    </Space>
  );
};
