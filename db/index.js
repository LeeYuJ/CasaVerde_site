import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();
import { User } from "./models/user";

mongoose.connect(`${process.env.DATABASE_URL}/CasaVerde`);

mongoose.connection.on("error", () => {
  console.error.bind(console, "MongoDB connect error:");
});
mongoose.connection.on("connected", () => {
  console.log("MongoDB Connected");
});

async function boot() {
  // 관리자 유저 기본 데이터
  const adminCheck = await User.findByUserId("admin_id");
  // 관리자 데이터가 없으면 넣음.
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  if (!adminCheck) {
    await User.create({
      uuid: "admin_id",
      email: "admin@admin.com",
      password: adminPassword,
      address: "서울특별시 구구 동동",
      phone: "010-0000-0000",
      name: "admin",
      role: "ADMIN",
    });
  }

  // 관리자 jwt 확인
  // const { uuid, email, password } = adminCheck;
  // console.log(createJWT({ uuid, email, password, role: "USER" }));
}

boot();

export * from "./models/item";
export * from "./models/order";
export * from "./models/user";
export * from "./models/orderItem";
export * from "./models/category";
