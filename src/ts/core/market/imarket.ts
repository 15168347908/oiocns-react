import { model, schema } from '../../base';
import { XMarketRelationArray, XMerchandiseArray } from '../../base/schema';
import { TargetType } from '../enum';
export default interface IMarket {
  /** 市场实体 */
  market: schema.XMarket;
  /** 可以拉取的成员类型 */
  pullTypes: TargetType[];
  /**
   * 更新商店信息
   * @param name 商店名称
   * @param code 商店编号
   * @param samrId 监管组织/个人
   * @param remark 备注
   * @param ispublic 是否公开
   * @returns
   */
  update(
    name: string,
    code: string,
    samrId: string,
    remark: string,
    ispublic: boolean,
  ): Promise<model.ResultType<any>>;
  /**
   * 分页获取商店成员
   * @param page 分页参数
   * @returns 加入的商店成员
   */
  getMember(page: model.PageRequest): Promise<model.ResultType<XMarketRelationArray>>;
  /**
   * 分页获取商品列表
   * @param page 分页参数
   * @returns 返回商店商品列表
   */
  getMerchandise(page: model.PageRequest): Promise<model.ResultType<XMerchandiseArray>>;
  /**
   * 分页获取加入商店申请
   * @param page 分页参数
   */
  getJoinApply(page: model.PageRequest): Promise<model.ResultType<XMarketRelationArray>>;
  /**
   * 获取商品上架申请列表
   * @param page 分页参数
   * @returns 返回商品上架申请列表
   */
  getMerchandiseApply(
    page: model.PageRequest,
  ): Promise<model.ResultType<XMerchandiseArray>>;
  /**
   * 审批商店成员加入申请
   * @param id 申请ID
   * @param status 审批结果
   * @returns 是否成功
   */
  approvalJoinApply(id: string, status: number): Promise<model.ResultType<any>>;
  /**
   * 审批商品上架申请
   * @param id 申请ID
   * @param status 审批结果
   * @returns 是否成功
   */
  approvalPublishApply(id: string, status: number): Promise<model.ResultType<any>>;
  /**
   * 拉对象加入商店
   * @param targetIds 对象ID集合
   * @param typenames 对象类型
   * @returns 是否成功
   */
  pullMember(targetIds: string[], typenames: string[]): Promise<model.ResultType<any>>;
  /**
   * 移除商店成员
   * @param id 关系成员ID
   * @param typename 成员类型
   * @return 移除人员结果
   */
  removeMember(targetIds: string[]): Promise<model.ResultType<any>>;
  /**
   * 下架商品
   * @param merchandiseId 下架商品ID
   * @returns 下架是否成功
   */
  unPublish(merchandiseId: string, belongId: string): Promise<model.ResultType<any>>;
  /**
   * 下单
   * @param nftId 区块链Id
   * @param name 订单名称
   * @param code 订单编号
   * @param spaceId 空间Id
   * @param merchandiseIds 商品Id集合
   */
  createOrder(
    // 存证ID
    nftId: string,
    // 名称
    name: string,
    // 编号
    code: string,
    // 创建组织/个人
    spaceId: string,
    // 商品ID集合
    merchandiseIds: string[],
  ): Promise<model.ResultType<any>>;
}
