import { OrderITodo, OrderStatus } from './interface';

import { common, kernel, schema } from '../../base';
import userCtrl from '@/ts/controller/setting/userCtrl';

export default class OrderTodo implements OrderITodo {
  id: string;
  name: string;
  get count(): number {
    return this.saleList.length;
  }
  saleList: schema.XOrderDetail[];
  buyList: schema.XOrder[];
  constructor() {
    this.name = '订单管理';
    this.id = 'order';
    this.saleList = [];
    this.buyList = [];
    this.getSaleList();
    this.getBuyList();
  }
  getSaleList = async () => {
    const result = await kernel.querySellOrderList({
      id: userCtrl.User!.target.id,
      status: 0,
      page: {
        offset: 0,
        filter: '',
        limit: common.Constants.MAX_UINT_16,
      },
    });
    if (result?.success && result.data.total > 0 && result.data.result) {
      this.saleList = result.data.result;
    }
  };
  getBuyList = async () => {
    const result = await kernel.queryBuyOrderList({
      id: userCtrl.User!.target.id,
      status: 0,
      page: {
        offset: 0,
        filter: '',
        limit: common.Constants.MAX_UINT_16,
      },
    });
    if (result?.success && result.data.total > 0 && result.data.result) {
      this.buyList = result.data.result;
    }
  };
  deliver = async (target: schema.XOrderDetail) => {
    const result = await kernel.deliverMerchandise({
      id: target.id,
      status: OrderStatus.deliver,
    });
    if (result.success) {
      this.saleList = this.removeList<schema.XOrderDetail>(
        this.saleList,
        target.id,
        OrderStatus.deliver,
      ) as schema.XOrderDetail[];
    }
    return result;
  };
  reject = async (target: schema.XOrderDetail) => {
    const result = await kernel.rejectMerchandise({
      id: target.id,
      status: OrderStatus.rejectOrder,
    });
    if (result.success) {
      this.buyList = this.removeList<schema.XOrder>(
        this.buyList,
        target.id,
        OrderStatus.rejectOrder,
      );
    }
    return result;
  };
  cancel = async (
    target: schema.XOrderDetail | schema.XOrder,
    status: OrderStatus.buyerCancel | OrderStatus.sellerCancel,
  ) => {
    console.log({ id: target.id, status });
    const result = await kernel.cancelOrderDetail({ id: target.id, status });
    if (result.success) {
      if (status === OrderStatus.buyerCancel) {
        this.buyList = this.removeList<schema.XOrder>(
          this.buyList,
          target.id,
          OrderStatus.buyerCancel,
        );
      } else {
        this.saleList = this.removeList<schema.XOrderDetail>(
          this.saleList,
          target.id,
          OrderStatus.sellerCancel,
        ) as schema.XOrderDetail[];
      }
    }
    return result;
  };

  protected removeList = <T extends Record<string, any>>(
    list: T[],
    needRemoveId: string,
    type?: OrderStatus,
  ) => {
    if (type === OrderStatus.buyerCancel || type === OrderStatus.rejectOrder) {
      const newList: schema.XOrder[] = [];
      for (let index = 0; index < list.length; index++) {
        const { details, ...other } = list[index] as unknown as schema.XOrder;
        if (details && details.length > 0) {
          newList.push({
            ...other,
            details: details.map((n: schema.XOrderDetail) => {
              if (n.id === needRemoveId) {
                n.status = type;
              }
              return n;
            }),
          });
        }
      }
      return newList;
    } else {
      return list.length > 0
        ? list.filter((n: any) => {
            if (n.id === needRemoveId && n.status) {
              n.status = type;
            }
            return n;
          })
        : [];
    }
  };
}