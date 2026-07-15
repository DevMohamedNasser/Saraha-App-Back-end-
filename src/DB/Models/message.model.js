import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Content is mandatory"],
      minLength: [1, "min length is 1 char"],
      maxLength: [500, "max length is 500 char"],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "receiverId is required"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

messageSchema.index({ receiverId: 1 });

const messageModel =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default messageModel;
