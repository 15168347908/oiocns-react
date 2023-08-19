import ShareShowComp from '@/components/Common/ShareShowComp';
import CustomTree from '@/components/CustomTree';
import { Command } from '@/ts/base';
import { XFileInfo } from '@/ts/base/schema';
import { IBelong, IDirectory } from '@/ts/core';
import { IBaseFileInfo } from '@/ts/core/thing/config';
import { Button, Input, Modal, Space, TreeProps } from 'antd';
import React, { Key, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import cls from './index.module.css';
import { ConfigColl } from '@/ts/core/thing/directory';
interface IProps<X extends XFileInfo> {
  current: IBaseFileInfo<X>;
  cmd: Command;
}

export const OpenSelector = <X extends XFileInfo>({ current, cmd }: IProps<X>) => {
  const [selected, setSelected] = useState<IBaseFileInfo<X>[]>([]);
  const onClick = (collName: ConfigColl) => {
    Modal.confirm({
      icon: <></>,
      width: 800,
      content: (
        <Selector
          collName={collName}
          current={current}
          selected={selected}
          setSelected={setSelected}
          cmd={cmd}
        />
      ),
      onOk: () => {
        switch (collName) {
          case ConfigColl.Requests:
            cmd.emitter('graph', 'insertRequest', selected);
            setSelected([]);
            break;
          case ConfigColl.Scripts:
            cmd.emitter('graph', 'insertScript', selected);
            setSelected([]);
            break;
        }
      },
    });
  };
  return (
    <Space>
      <Button onClick={() => onClick(ConfigColl.Requests)}>插入 Request</Button>
      <Button onClick={() => onClick(ConfigColl.Scripts)}>插入 Script</Button>
    </Space>
  );
};

interface IExtends<X extends XFileInfo> extends IProps<X> {
  collName: ConfigColl;
  selected: IBaseFileInfo<X>[];
  setSelected: (requests: IBaseFileInfo<X>[]) => void;
}

const Selector = <X extends XFileInfo>({
  collName,
  current,
  selected,
  setSelected,
}: IExtends<X>) => {
  let belong = current.directory.target as IBelong;
  const [filter, setFilter] = useState<string>('');
  const [centerTreeData, setCenterTreeData] = useState<any>([]);
  const [centerCheckedKeys, setCenterCheckedKeys] = useState<Key[]>([]);

  const onSelect: TreeProps['onSelect'] = async (_, info: any) => {
    const directory: IDirectory = info.node.item;
    let configs = await directory.loadConfigs(collName);
    setCenterTreeData(
      configs.map((item) => {
        return {
          key: item.id,
          title: item.name,
          value: item.id,
          item: item,
          children: [],
        };
      }),
    );
  };

  // 中间树形点击事件
  const onCheck: TreeProps['onCheck'] = (checkedKeys, info) => {
    if (Array.isArray(checkedKeys)) {
      setCenterCheckedKeys(checkedKeys);
    }
    const request: IBaseFileInfo<X> = (info.node as any).item;
    if (info.checked) {
      selected.push(request);
      setSelected(selected);
    } else {
      setSelected([...selected.filter((i) => i.id != request.id)]);
    }
  };

  const buildWorkThingTree = (directory: IDirectory[]): any[] => {
    const result: any[] = [];
    for (const item of directory) {
      result.push({
        key: item.id,
        title: item.name,
        value: item.id,
        item: item,
        children: buildWorkThingTree(item.children),
      });
    }
    return result;
  };

  const handelDel = (id: string) => {
    setCenterCheckedKeys(centerCheckedKeys.filter((data) => data != id));
    setSelected(selected.filter((i) => i.id != id));
  };

  return (
    <>
      <div className={cls.layout}>
        <div className={cls.content}>
          <div style={{ width: '33%' }} className={cls.left}>
            <Input
              className={cls.leftInput}
              prefix={<AiOutlineSearch />}
              placeholder="请设置关键字"
            />
            <div className={cls.leftContent}>
              <CustomTree
                checkable={false}
                autoExpandParent={true}
                onSelect={onSelect}
                treeData={buildWorkThingTree([belong.directory])}
              />
            </div>
          </div>

          <div className={cls.center}>
            <Input
              className={cls.centerInput}
              prefix={<AiOutlineSearch />}
              placeholder="搜索"
              onChange={(e) => {
                setFilter(e.target.value);
              }}
            />
            <div className={cls.centerContent}>
              <CustomTree
                checkable
                checkedKeys={centerCheckedKeys}
                autoExpandParent={true}
                onCheck={onCheck}
                treeData={centerTreeData.filter((i: any) => i.title.includes(filter))}
              />
            </div>
          </div>
          <div style={{ width: '33%' }} className={cls.right}>
            <ShareShowComp departData={selected} deleteFuc={handelDel}></ShareShowComp>
          </div>
        </div>
      </div>
    </>
  );
};

export default Selector;
