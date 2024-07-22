import connectionDB from "../db/connectionDB.js";
import * as routers from "../src/modules/index.routes.js";

import { AppError } from "../utils/classError.js";
import { globalErrorHandling } from "../utils/globalErrorHandler.js";

export const initApp = (app, express) => {
  const port = 3000;

  connectionDB();
  app.use(express.json());

  app.use("/users", routers.userRouter);
  app.use("/categories", routers.categoryRouter);
  app.use("/subCategories", routers.subCategoryRouter);
  app.use("/brands", routers.brandRouter);

  

  app.get("/", (req, res) => res.send("Hello World!"));

  app.use("*", (req, res, next) => {
    return next(new AppError(`invalid url ${req.originalUrl}`, 404));
  });

  //global error handling middleware
  app.use(globalErrorHandling);
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};
