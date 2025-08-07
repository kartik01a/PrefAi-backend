import { IDocument } from "./document.dto";
import DocumentSchema, { FolderSchema } from "./document.schema";

export const createDocument = async (data: IDocument) => {
  console.log(data)
  const result = await DocumentSchema.create(data);
  return result;
};

export const getDocuments = async (data: { folderId: string }) => {
  try {
    const { folderId } = data;
    const result = await DocumentSchema.find({ folderId });

    return result;
  } catch (error) {
    console.error("Error retrieving documents with aggregation:", error);
    throw new Error("Failed to retrieve documents");
  }
};

export const createFolder = async (data: {
  userId: string;
  folderName: string;
}) => {
  try {
    const existingFolder = await FolderSchema.findOne({
      userId: data.userId,
      folderName: data.folderName.trim(),
    });

    if (existingFolder) {
      throw new Error("Folder with this name already exists");
    }

    const newFolder = new FolderSchema({
      userId: data.userId,
      folderName: data.folderName.trim(),
    });

    const savedFolder = await newFolder.save();
    return savedFolder;
  } catch (error) {
    console.error("Error creating folder:", error);
    throw new Error("Failed to create folder");
  }
};

export const getFolders = async (data: { userId: string }) => {
  try {
    const folders = await FolderSchema.aggregate([
      {
        $match: { userId: data.userId },
      },
      {
        $lookup: {
          from: "documents",
          localField: "_id",
          foreignField: "folderId",
          as: "files",
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          folderName: 1,
          createdAt: 1,
          updatedAt: 1,
          fileCount: { $size: "$files" },
        },
      },
      {
        $sort: { folderName: 1 },
      },
    ]);

    return folders;
  } catch (error) {
    console.error("Error retrieving folders:", error);
    throw new Error("Failed to retrieve folders");
  }
};
