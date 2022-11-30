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

export type CategoryPrivateInterface = CategoryInterface & { imageUrl: string };
export type CategoryPublicInterface = Pick<
  CategoryInterface,
  "_id" | "parentId" | "name" | "description" | "createdAt"
> & { imageUrl: string };
