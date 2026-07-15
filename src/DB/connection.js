import mongoose from "mongoose";
import { DB_URI } from "../../Config/config.service.js";
import chalk from "chalk";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("DB connected successfully");
        })

        await mongoose.connect(DB_URI, {
            serverSelectionTimeoutMS: 5000
        });

    } catch (error) {
        console.log(chalk.red("Error connecting DB", error.message));
    }
}

export default connectDB;