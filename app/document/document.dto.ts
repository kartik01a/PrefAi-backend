import { type BaseSchema } from "../common/dto/base.dto";

export interface IDocument extends BaseSchema {
  userId: string;
  uri: string;
  name: string;
  size: number;
  type: string;
  folderId: string;
}

export interface IFolder extends BaseSchema {
  userId: string;
  folderId: string;
  folderName: string;
}

