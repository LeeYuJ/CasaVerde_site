import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import jwtLoginRequired from "./middlewares/jwt-login-required";
import { passport } from "./passport";

import { 
  accountRouter, 
  categoryRouter, 
  itemRouter, 
  usersRouter, 
  orderRouter, 
  viewsRouter, 
  authRouter 
} from "./routes";

const app = express();
app.use(
  cors({
    origin: process.env.DEV_HOST,
    methods: "GET, POST, PATCH, PUT, DELETE, OPTIONS", // 클라이언트 요청 시 대문자 요청
    credentials: true,
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// 프론트 라우터 등록
app.use(viewsRouter);

// 세션 등록
//app.use(session(sessionConfig));

app.use(passport.initialize());
// app.use(passport.session());

app.locals.authorization = {
  accessToken: null,
  refreshToken: null,
  provider: null
};

const { blacklist, setBlacklist } = jwtLoginRequired();
app.locals.blacklist = blacklist;

// API 라우터 등록
app.use("/api", accountRouter);
app.use("/api/users", setBlacklist, usersRouter);
app.use("/api/order", orderRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/items", itemRouter);
app.use("/api/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // response error
  const { status, message } = err;
  res.status(status || 500);
  res.json({ status, message });
});

module.exports = app;
