import mongoose from "mongoose";

const connectionDB = async () => {
  return await mongoose
    .connect("mongodb://127.0.0.1:27017/Ecommerce")
    .then(() => {
      console.log("connected to database...");
    })
    .catch((err) => {
      console.log(err);
    });
};

export default connectionDB;
