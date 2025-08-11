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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFolders = exports.createFolder = exports.getDocuments = exports.createDocument = void 0;
const document_schema_1 = __importStar(require("./document.schema"));
const createDocument = (data) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(data);
    const result = yield document_schema_1.default.create(data);
    return result;
});
exports.createDocument = createDocument;
const getDocuments = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { folderId } = data;
        const result = yield document_schema_1.default.find({ folderId });
        return result;
    }
    catch (error) {
        console.error("Error retrieving documents with aggregation:", error);
        throw new Error("Failed to retrieve documents");
    }
});
exports.getDocuments = getDocuments;
const createFolder = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingFolder = yield document_schema_1.FolderSchema.findOne({
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
        const savedFolder = yield newFolder.save();
        return savedFolder;
    }
    catch (error) {
        console.error("Error creating folder:", error);
        throw new Error("Failed to create folder");
    }
});
exports.createFolder = createFolder;
const getFolders = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const folders = yield document_schema_1.FolderSchema.aggregate([
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
});
exports.getFolders = getFolders;
//# sourceMappingURL=document.service.js.map