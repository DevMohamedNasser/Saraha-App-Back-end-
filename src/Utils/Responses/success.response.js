// return res.status(200).json({ message: "welcome" });

// named arguments not position
export const successResponse = ({res, statusCode = 200, message = "Done", data = {}}) => {
    return res.status(statusCode).json({message, data});
}