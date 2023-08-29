import { linkCmd } from '@/ts/base/common/command';
import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { useEffect, useState } from 'react';
import cls from './../index.module.less';

interface IProps {}

interface Kv {
  k: string;
  v: string;
}

export const Environments: React.FC<IProps> = () => {
  const [kvs, setKvs] = useState<Kv[]>([]);
  const columns: ColumnsType<Kv> = [
    {
      title: '键',
      dataIndex: 'k',
      key: 'k',
    },
    {
      title: '值',
      dataIndex: 'v',
      key: 'v',
      render: (value) => {
        return (
          <div style={{ width: 200 }} className={cls['text-overflow']}>
            {value}
          </div>
        );
      },
    },
  ];
  useEffect(() => {
    const id = linkCmd.subscribe((type, cmd, args) => {
      if (type == 'environments') {
        switch (cmd) {
          case 'add':
            const newKvs: Kv[] = [...kvs];
            Object.entries(args as { [key: string]: string }).forEach((item) => {
              const old = newKvs.findIndex((old) => (old.k = item[0]));
              newKvs.splice(old, 1);
              newKvs.push({ k: item[0], v: item[1] });
            });
            setKvs(newKvs);
            break;
          case 'clear':
            setKvs([]);
            break;
        }
      }
    });
    return () => {
      linkCmd.unsubscribe(id);
    };
  });
  if (kvs.length == 0) {
    return <></>;
  }
  return <Table columns={columns} dataSource={kvs} />;
};
