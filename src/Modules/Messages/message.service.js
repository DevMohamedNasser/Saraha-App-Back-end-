import userModel from "../../DB/Models/user.model.js";
import { NOtFoundException } from "../../Utils/Responses/error.response.js";
import { create, findOne } from "../../DB/db.repo.js";
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
