export interface CategoryPrivateInterface {
  _id: string;
  hash: string;
  name: string;
  createdAt: number;
  isDeleted: boolean;
  imageId: string | null;
  parentId: string | null;
  description: string | null;
}

export type CategoryPublicInterface = Pick<
  CategoryPrivateInterface,
  "_id" | "parentId" | "name" | "description" | "createdAt"
> & { imageUrl: string };
