import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const generateTokensForUser = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const createUser = async (userData) => {
  return await User.create(userData);
};

export const findUserByUsernameOrEmail = async (username, email) => {
  return await User.findOne({ $or: [{ username }, { email }] });
};

export const uploadUserImages = async (avatarPath, coverPath) => {
  const avatar = await uploadOnCloudinary(avatarPath);
  const coverImage = await uploadOnCloudinary(coverPath);
  return { avatar, coverImage };
};

export const getUserById = async (id, excludeFields = "") => {
  return await User.findById(id).select(excludeFields);
};

export const verifyPassword = async (user, password) => {
  return await user.isPasswordCorrect(password);
};

export const updateRefreshToken = async (userId, token) => {
  return await User.findByIdAndUpdate(
    userId,
    { refreshToken: token },
    { new: true }
  );
};

export const removeRefreshToken = async (userId) => {
  return await User.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
};

export const updatePasswordService = async (userId, newPassword) => {
  const user = await User.findById(userId);
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
};

export const updateUserProfileService = async (userId, data) => {
  return await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true }
  ).select("-password -refreshToken");
};
