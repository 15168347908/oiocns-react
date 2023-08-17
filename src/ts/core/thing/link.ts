import { kernel } from '../../base';
import { XLink } from '../../base/schema';
import { storeCollName } from '../public';
import { IDirectory } from './directory';
import { FileInfo, IFileInfo } from './fileinfo';

/** 请求配置，需要持久化 */
export interface ILink extends IFileInfo<XLink> {
  /** 刷新数据 */
  refresh(data: XLink): void;
}

export class Link extends FileInfo<XLink> implements ILink {
  constructor(link: XLink, dir: IDirectory) {
    super(link, dir);
  }

  async delete(): Promise<boolean> {
    const res = await kernel.anystore.remove(
      this.metadata.belongId,
      storeCollName.RequestLinks,
      {
        id: this.metadata.id,
      },
    );
    if (res.success) {
      this.directory.links = this.directory.links.filter((i) => i.key != this.key);
    }
    return res.success;
  }

  async rename(name: string): Promise<boolean> {
    let res = await kernel.anystore.update(
      this.metadata.belongId,
      storeCollName.RequestLinks,
      {
        match: {
          id: this.metadata.id,
        },
        update: {
          name: name,
        },
      },
    );
    return res.success;
  }

  async copy(destination: IDirectory): Promise<boolean> {
    let res = await destination.createLink(this.metadata);
    return !!res;
  }

  async move(destination: IDirectory): Promise<boolean> {
    let res = await kernel.anystore.update(
      this.metadata.belongId,
      storeCollName.Requests,
      {
        match: {
          id: this.metadata.id,
        },
        update: {
          directoryId: destination.id,
        },
      },
    );
    return res.success;
  }

  refresh(data: XLink) {
    super.setMetadata(data);
    kernel.anystore
      .remove(this.metadata.belongId, storeCollName.RequestLinks, {
        id: this.metadata.id,
      })
      .then(() => {
        kernel.anystore.insert(
          this.metadata.belongId,
          storeCollName.RequestLinks,
          this.metadata,
        );
      });
  }
}
