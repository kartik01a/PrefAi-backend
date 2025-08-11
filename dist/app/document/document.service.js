"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFolders = exports.createFolder = exports.getDocuments = exports.createDocument = void 0;
const document_schema_1 = __importStar(require("./document.schema"));
const createDocument = async (data) => {
    console.log(data);
    const result = await document_schema_1.default.create(data);
    return result;
};
exports.createDocument = createDocument;
const getDocuments = async (data) => {
    try {
        const { folderId } = data;
        const result = await document_schema_1.default.find({ folderId });
        return result;
    }
    catch (error) {
        console.error("Error retrieving documents with aggregation:", error);
        throw new Error("Failed to retrieve documents");
    }
};
exports.getDocuments = getDocuments;
const createFolder = async (data) => {
    try {
        const existingFolder = await document_schema_1.FolderSchema.findOne({
            userId: data.userId,
            folderName: data.folderName.trim(),
        });
        if (existingFolder) {
            throw new Error("Folder with this name already exists");
        }
        const newFolder = new document_schema_1.FolderSchema({
            userId: data.userId,
            folderName: data.folderName.trim(),
        });
        const savedFolder = await newFolder.save();
        return savedFolder;
    }
    catch (error) {
        console.error("Error creating folder:", error);
        throw new Error("Failed to create folder");
    }
};
exports.createFolder = createFolder;
const getFolders = async (data) => {
    try {
        const folders = await document_schema_1.FolderSchema.aggregate([
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
    }
    catch (error) {
        console.error("Error retrieving folders:", error);
        throw new Error("Failed to retrieve folders");
    }
};
exports.getFolders = getFolders;
