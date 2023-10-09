import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import dbBoot from "./db";
import jwtLoginRequired from "./middlewares/jwt-login-required";

import {
  accountRouter,
  categoryRouter,
  itemRouter,
  usersRouter,
  orderRouter,
  viewsRouter,
} from "./routes";

const app = express();
app.use(cors());

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

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

// console.log(exam({}, 1, 10));
// const mongoose = require("mongoose");
// import { model } from "mongoose";
// import { OrderSchema } from "./db/schemas/order";
// //import { OrderModel } from "./db/models/order";
// const OrderModel = model("Order", OrderSchema);

// const user_id = new mongoose.Types.ObjectId();
// console.log(user_id, "dfsdf101010`10");

// async function exam(data, page, perPage) {
//   console.log(data, page, perPage);
//   const [total, orders] = await Promise.all([
//     OrderModel.countDocuments({}),
//     OrderModel.find(data)
//       .sort({ createdAt: -1 })
//       .skip(perPage * (page - 1))
//       .limit(perPage)
//       .populate("user_id"), // populate 추가하기
//   ]);

//   //console.log(total, orders);
//   const totalPage = Math.ceil(total / perPage);

//   return [orders, totalPage];
// }

module.exports = app;
