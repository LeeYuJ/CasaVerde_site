import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import dbBoot from "./db";
import jwtLoginRequired from "./middlewares/jwt-login-required";
import { passport, session, sessionConfig } from "./passport";

import { accountRouter, categoryRouter, itemRouter, usersRouter, orderRouter, viewsRouter } from "./routes";
import { authRouter } from "./routes/auth";

const app = express();
const whitelist = ["http://localhost:3000", "http://kdt-sw-6-team08.elicecoding.com"];
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET, POST, PATCH, PUT, DELETE", // 클라이언트 요청 시 대문자 요청
    credentials: true,
  })
);

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// 세션 등록
// app.use(session(sessionConfig));

app.use(passport.initialize());
// app.use(passport.session());

const { blacklist, setBlacklist } = jwtLoginRequired();
app.locals.blacklist = blacklist;

// 프론트 라우터 등록
app.use("/", viewsRouter);

// API 라우터 등록
app.use("/", accountRouter);
app.use("/users", setBlacklist, usersRouter);
app.use("/order", orderRouter);
app.use("/categories", categoryRouter);
app.use("/items", itemRouter);
app.use("/auth", authRouter);

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
