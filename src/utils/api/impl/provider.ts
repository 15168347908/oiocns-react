import { kernel } from '@/ts/base';
import { IBelong } from '@/ts/core';
import { IRequestConfig } from '../types';
import { ConfigCollName } from '../consts';

export default class ConfigProvider {
  private _cache: Map<string, IRequestConfig[]>;

  constructor() {
    this._cache = new Map();
  }

  async loadAll(belong: IBelong, reload: boolean = false) {
    if (!this._cache.has(belong.id) || reload) {
      let res = await kernel.anystore.aggregate(belong.belongId, ConfigCollName, {
        match: {
          belongId: belong.belongId,
        },
      });
      this._cache.set(belong.id, res.data);
    }
    return [];
  }
}
