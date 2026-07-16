import userModel from "../../DB/Models/user.model.js";
import { NOtFoundException } from "../../Utils/Responses/error.response.js";
import { create, findById, findOne } from "../../DB/db.repo.js";
import messageModel from "../../DB/Models/message.model.js";
import { successResponse } from "../../Utils/Responses/success.response.js";

export const sendMessage = async (req, res) => {
  const { receiverId } = req.params;
  const { content } = req.body;

  const receiver = await findOne({
    model: userModel,
    filter: {
      _id: receiverId,
      freezedAt: { $exists: false },
    },
  });
  if (!receiver)
    throw NOtFoundException("Receiver not found or account is freezed");

  const message = await create({
    model: messageModel,
    data: [
      {
        content,
        receiverId,
      },
    ],
  });

  successResponse({ res, statusCode: 201, data: { message } });
};

export const getMessages = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const receiverId = req.user._id;

  const skip = (page - 1) * limit;

  const [messages, totalMessage] = await Promise.all([
    messageModel
      .find({ receiverId })
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit)),
    messageModel.countDocuments({ receiverId }),
  ]);

  successResponse({
    res,
    statusCode: 200,
    message: "Inbox retrieved successfully",
    data: {
      pagination: {
        messages,
        currentPage: page,
        totalPages: Math.ceil(totalMessage / limit),
        totalMessage,
      },
    },
  });
};

export const toggleRead = async (req, res) => {
  const messageId = req.params.messageId;
  const receiverId = req.user._id;

  const message = await findById({ model: messageModel, id: messageId });
  if (!message || message.receiverId.toString() !== receiverId.toString())
    throw NOtFoundException("Message not found or Unauthorized");

  message.isRead = !message.isRead;
  await message.save();

  successResponse({
    res,
    statusCode: 200,
    message: `Message marked as ${message.isRead ? "read" : "unread"}`,
    data: {
      updatedMessage: message,
    },
  });
};

export const toggleFav = async (req, res) => {
  const { messageId } = req.params;
  const receiverId = req.user._id;

  const message = await findById({ model: messageModel, id: messageId });
  if (!message || message.receiverId.toString() !== receiverId.toString())
    throw NOtFoundException("Message not found or Unauthorized");

  message.isFavorite = !message.isFavorite;
  await message.save();

  successResponse({
    res,
    statusCode: 200,
    message: message.isFavorite ? "Added to favorite" : "Removed from favorite",
    data: {
      updatedMessage: message,
    },
  });
};
