import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { XFileInfo } from '@/ts/base/schema';
import { IDirectory, IFileInfo } from '@/ts/core';
import React from 'react';
import { MenuItemType } from 'typings/globelType';

// 目录菜单
export const loadMenu = (directory: IDirectory, typeName: string): MenuItemType => {
  return {
    key: directory.id,
    item: directory,
    label: directory.name,
    itemType: directory.typeName,
    icon: <EntityIcon entityId={directory.id} typeName={directory.typeName} size={18} />,
    children: [
      ...directory.children.map((item) => loadMenu(item, typeName)),
      ...directory.configs.filter((item) => item.typeName == typeName).map(loadEntity),
    ],
  };
};

/** 文件项菜单 */
export const loadEntity = (entity: IFileInfo<XFileInfo>): MenuItemType => {
  return {
    key: entity.id,
    item: entity,
    label: entity.name,
    itemType: entity.typeName,
    icon: <EntityIcon entityId={entity.id} typeName={entity.typeName} size={18} />,
    children: [],
  };
};
