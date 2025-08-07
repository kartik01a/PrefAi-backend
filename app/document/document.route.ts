import { Router } from "express";
import { catchError } from "../common/middleware/cath-error.middleware";
import * as documentController from "./document.controller";
import * as documentValidator from "./document.validation";

const router = Router();

router
  .get("/folder/:id", documentController.getFolders)
  .post(
    "/folder",
    documentValidator.createFolderValidation,
    catchError,
    documentController.createFolder
  )
  .get("/:id", documentController.getDocuments)
  .post(
    "/",
    documentValidator.createDocumentValidation,
    catchError,
    documentController.createDocument
  );

export default router;
