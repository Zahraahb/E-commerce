import connectionDB from "../db/connectionDB.js";
import * as routers from "../src/modules/index.routes.js";
import { AppError } from "../utils/classError.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";
import { deleteFromDB } from "../utils/deleteFromDB.js";
import { globalErrorHandling } from "../utils/globalErrorHandler.js";
import cors from "cors"

export const initApp = (app, express) => {
  
  app.use(cors());

  
  app.use(express.json());
  connectionDB();

  app.use("/users", routers.userRouter);
  app.use("/categories", routers.categoryRouter);
  app.use("/subCategories", routers.subCategoryRouter);
  app.use("/brands", routers.brandRouter);
  app.use("/products", routers.productRouter);
  app.use("/coupons", routers.couponRouter);
  app.use("/cart", routers.cartRouter);
  app.use("/orders", routers.orderRouter);
  app.use("/reviews", routers.reviewRouter);
  app.use("/wishlist", routers.wishListRouter);
  

  app.get("/", (req, res) => res.status(200).json({msg:"welcome on my project!"}));

  app.use("*", (req, res, next) => {
    return next(new AppError(`invalid url ${req.originalUrl}`, 404));
  });

  //global error handling middleware
  app.use(globalErrorHandling, deleteFromCloudinary, deleteFromDB);
  
};
