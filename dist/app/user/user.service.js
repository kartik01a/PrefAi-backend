"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countItems = exports.getUserByEmail = exports.getAllUser = exports.getUserById = exports.deleteUser = exports.editUser = exports.updateUser = exports.updateUserData = exports.createUser = void 0;
const user_schema_1 = __importDefault(require("./user.schema"));
const createUser = async (data) => {
    const result = await user_schema_1.default.create(data);
    const { refreshToken, password, ...user } = result.toJSON();
    return user;
};
exports.createUser = createUser;
const updateUserData = async (id, data) => {
    const protectedFields = [
        "email",
        "firstName",
        "lastName",
        "passportNumber",
        "role",
        "password",
        "refreshToken",
        "facebookId",
        "provider",
        "_id",
        "createdAt",
        "updatedAt",
        "title",
        "country",
        "maritalStatus",
        "dob",
    ];
    const filteredData = {};
    Object.entries(data).forEach(([key, value]) => {
        if (!protectedFields.includes(key)) {
            filteredData[key] = value;
        }
    });
    const result = await user_schema_1.default.findOneAndUpdate({ _id: id }, filteredData, {
        new: true,
        select: "-password -refreshToken -facebookId",
    });
    return result;
};
exports.updateUserData = updateUserData;
const updateUser = async (id, data) => {
    const result = await user_schema_1.default.findOneAndUpdate({ _id: id }, data, {
        new: true,
        select: "-password -refreshToken -facebookId",
    });
    return result;
};
exports.updateUser = updateUser;
const editUser = async (id, data) => {
    const result = await user_schema_1.default.findOneAndUpdate({ _id: id }, data, {
        new: true,
        select: "-password -refreshToken -facebookId",
    });
    return result;
};
exports.editUser = editUser;
const deleteUser = async (id) => {
    const result = await user_schema_1.default.deleteOne({ _id: id }, { select: "-password -refreshToken -facebookId" });
    return result;
};
exports.deleteUser = deleteUser;
const getUserById = async (id, projection) => {
    const result = await user_schema_1.default.findById(id, projection).lean();
    return result;
};
exports.getUserById = getUserById;
const getAllUser = async (projection, options) => {
    const result = await user_schema_1.default.find({}, projection, options).lean();
    return result;
};
exports.getAllUser = getAllUser;
const getUserByEmail = async (email, projection) => {
    const result = await user_schema_1.default.findOne({ email }, projection).lean();
    return result;
};
exports.getUserByEmail = getUserByEmail;
const countItems = () => {
    return user_schema_1.default.count();
};
exports.countItems = countItems;
