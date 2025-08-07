const { body } = require("express-validator");

// Validation rules for creating  document
export const createDocumentValidation = [
  body("userId")
    .isString()
    .notEmpty()
    .withMessage("User ID is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("User ID must be between 1 and 100 characters")
    .trim(),

  body("uri")
    .isString()
    .notEmpty()
    .withMessage("URI is required")
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("URI must be a valid URL with http or https protocol")
    .isLength({ max: 2048 })
    .withMessage("URI must not exceed 2048 characters"),

  body("name")
    .isString()
    .notEmpty()
    .withMessage("File name is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("File name must be between 1 and 255 characters")
    .matches(/^[^<>:"/\\|?*\x00-\x1f]+$/)
    .withMessage("File name contains invalid characters")
    .trim(),

  body("size")
    .isNumeric()
    .withMessage("Size must be a number")
    .isInt({ min: 0, max: 5368709120 })
    .withMessage("Size must be between 0 and 5GB (5368709120 bytes)")
    .toInt(),

  body("type")
    .isString()
    .notEmpty()
    .withMessage("File type is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("File type must be between 1 and 100 characters")
    .matches(/^[a-zA-Z0-9\/\-\+\.]+$/)
    .withMessage("File type must be a valid MIME type format")
    .trim(),

  body("folderId")
    .isString()
    .notEmpty()
    .withMessage("User ID is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("User ID must be between 1 and 100 characters")
    .trim(),
];
export const createFolderValidation = [
  body("userId")
    .isString()
    .notEmpty()
    .withMessage("User ID is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("User ID must be between 1 and 100 characters")
    .trim(),

  body("folderName")
    .isString()
    .notEmpty()
    .withMessage("File name is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("File name must be between 1 and 255 characters")
    .matches(/^[^<>:"/\\|?*\x00-\x1f]+$/)
    .withMessage("File name contains invalid characters")
    .trim(),
];
