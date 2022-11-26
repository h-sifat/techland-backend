export interface CategoryInterface {
  _id: string;
  hash: string;
  name: string;
  createdAt: number;
  isDeleted: boolean;
  imageId: string | null;
  parentId: string | null;
  description: string | null;
}
