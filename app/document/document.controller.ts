import { type Request, type Response } from "express";
import asyncHandler from "express-async-handler";
import { createResponse } from "../common/helper/response.hepler";
import * as documentService from "./document.service";

export const createDocument = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await documentService.createDocument(req.body);
    res.send(createResponse(result, "Document created sucssefully"));
  }
);

export const getDocuments = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Folder ID is required",
      });
      return;
    }

    const result = await documentService.getDocuments({ folderId: id });
    res.send(createResponse(result, "Documents retrieved successfully"));
  }
);

export const createFolder = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await documentService.createFolder(req.body);
    res.send(createResponse(result, "Folder created sucssefully"));
  }
);

export const getFolders = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    const result = await documentService.getFolders({ userId: id });
    res.send(createResponse(result, "Documents retrieved successfully"));
  }
);
