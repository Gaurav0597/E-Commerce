import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncWrapper.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import * as AuthService from "../services/auth.service.js";
import { STATUS_CODES } from "../constants/statusCodes.js";
import { MESSAGES } from "../constants/messages.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, password, fullName, email } = req.body;

  if (
    [username, password, fullName, email].some((field) => field?.trim() === "")
  )
    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.ALL_FIELDS_REQUIRED);

  const existingUser = await AuthService.findUserByUsernameOrEmail(
    username,
    email
  );
  if (existingUser)
    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.USER_EXISTS);

  const avatarPath = req?.files?.avatar?.[0]?.path;
  const coverPath = req?.files?.coverImage?.[0]?.path;

  if (!avatarPath)
    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.AVATAR_REQUIRED);

  const { avatar, coverImage } = await AuthService.uploadUserImages(
    avatarPath,
    coverPath
  );

  if (!avatar)
    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.AVATAR_UPLOAD_FAILED);

  const user = await AuthService.createUser({
    username: username.toLowerCase(),
    email,
    password,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await AuthService.getUserById(
    user._id,
    "-password -refreshToken"
  );
  if (!createdUser)
    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      MESSAGES.SOMETHING_WENT_WRONG
    );

  res
    .status(STATUS_CODES.CREATED)
    .json(
      new ApiResponse(
        STATUS_CODES.CREATED,
        createdUser,
        MESSAGES.REGISTRATION_SUCCESS
      )
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email)
    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.USER_EMIAL_REQ);

  const user = await AuthService.findUserByUsernameOrEmail(username, email);
  if (!user)
    throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND);

  const isValid = await AuthService.verifyPassword(user, password);
  if (!isValid)
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.PASSWORD_INCORRECT);

  const { accessToken, refreshToken } = await AuthService.generateTokensForUser(
    user._id
  );
  const loggedInUser = await AuthService.getUserById(
    user._id,
    "-password -refreshToken"
  );

  const options = { httpOnly: true, secure: true };
  res
    .status(STATUS_CODES.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        STATUS_CODES.OK,
        { user: loggedInUser, accessToken, refreshToken },
        "Login successful"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await AuthService.removeRefreshToken(req?.user._id);
  const options = { httpOnly: true, secure: true };
  res
    .status(STATUS_CODES.OK)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(STATUS_CODES.OK, {}, MESSAGES.LOGOUT_SUCCESS));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token)
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);

  const decoded = jwt.verify(token, process.env.REQUEST_TOKEN_SECRET);
  const user = await AuthService.getUserById(decoded?._id);
  if (!user || token !== user.refreshToken)
    throw new ApiError(
      STATUS_CODES.UNAUTHORIZED,
      MESSAGES.INVALID_REFRESH_TOKEN
    );

  const { accessToken, refreshToken } = await AuthService.generateTokensForUser(
    user._id
  );
  const options = { httpOnly: true, secure: true };

  res
    .status(STATUS_CODES.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        STATUS_CODES.OK,
        { accessToken, refreshToken },
        MESSAGES.TOKEN_REFRESHED
      )
    );
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.PASSWORD_REQUIRED);

  const user = await AuthService.getUserById(req?.user._id);
  const isValid = await AuthService.verifyPassword(user, oldPassword);
  if (!isValid) throw new ApiError(400, MESSAGES.PASSWORD_INCORRECT);

  await AuthService.updatePasswordService(user._id, newPassword);
  res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, {}, MESSAGES.PASSWORD_UPDATED));
});

export const updateUserProfileDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) throw new ApiError(404, MESSAGES.INVALID_DETAILS);

  const updatedUser = await AuthService.updateUserProfileService(
    req.user?._id,
    {
      fullName,
      email,
    }
  );

  res
    .status(STATUS_CODES.OK)
    .json(
      new ApiResponse(STATUS_CODES.OK, updatedUser, MESSAGES.PROFILE_UPDATED)
    );
});
