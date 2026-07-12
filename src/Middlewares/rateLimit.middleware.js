import { TooManyRequestsException } from "../Utils/Responses/error.response.js";

const ipRequest = {};

// array but with unique indexes العناصر لما تتكرر تخزنها مره واحده بس
const blockedIps = new Set();

// array each ["127.0.0.1" ===> {time, count}, ] each element/index refers to object
const unblockerTimers = new Map();

const RATE_LIMIT = 3;
const WINDOW_MS = 1 * 60 * 1000;

export const customRateLimiter = () => {
  return (req, res, next) => {
    const ip = req.ip;
    // console.log(ip);

    if (blockedIps.has(ip))
      throw TooManyRequestsException("Too many requests, please try later.");

    const currentTime = Date.now();

    // اول مره تدخل البرنامج
    if (!ipRequest[ip]) {
      ipRequest[ip] = {
        count: 1,
        startTime: currentTime,
      };
      return next();
    }

    // انت بالفعل عملت ريكوست وموجود عندي في الاوبجكت
    const diff = currentTime - ipRequest[ip].startTime;
    if (diff < WINDOW_MS) {
      ipRequest[ip].count++;

      // عملنا check علي الوقت فاضل الcount
      if (ipRequest[ip].count > RATE_LIMIT) {
        blockedIps.add(ip);

        // لو وقت البلوك خلص شيله م ال map وال set ،،،، (مفيهوش setTimeout متخزن يبقي تمام نعمل setTimeout جديد)
        if (!unblockerTimers.has(ip)) {
          const timer = setTimeout(() => {
            blockedIps.delete(ip);
            unblockerTimers.delete(ip);
            delete ipRequest[ip];
          }, WINDOW_MS);
          unblockerTimers.set(ip, timer);
        }
        throw TooManyRequestsException("Too many requests, please try later.");
      }
    } else {
      // عدي عليك الوقت بعد المحاولات الكتير هعملك reset
      ipRequest[ip] = {
        count: 1,
        startTime: currentTime,
      };
    }

    return next();
  };
};
