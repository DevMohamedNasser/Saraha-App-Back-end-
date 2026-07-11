import { WHITE_LIST } from "../../../Config/config.service.js";
import { BadRequestException } from "../Responses/error.response.js";

export function corsOptions() {
  const whiteList = WHITE_LIST.split(",");
  const corsOptions = {
    origin: function (origin, callback) {
      if (whiteList.includes(origin)) callback(null, true);
      else if (!origin)
        // as postman, apiDogs, ... return undefined/falsy value
        callback(null, true);
      else callback(BadRequestException("Not allowed by CORS."));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  };

  return corsOptions;
}
