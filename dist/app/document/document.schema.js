"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const folderSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    folderName: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});
const documentSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    uri: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    size: {
        type: Number,
        required: true,
        min: 0,
    },
    type: {
        type: String,
        required: true,
        trim: true,
    },
    folderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'folder',
        required: true,
        index: true,
    },
}, {
    timestamps: true,
});
exports.FolderSchema = mongoose_1.default.model("folder", folderSchema);
exports.default = mongoose_1.default.model("document", documentSchema);
