const dataMethods = ["body", "query", "headers", "file", "files"];

export const validation = (schema) => {
  return (req, res, next) => {
    let errors = [];
    dataMethods.forEach((key) => {
      if (schema[key]) {
        const { error } = schema[key].validate(req[key], {
          abortEarly: false,
        });
        if (error?.details) {
          error.details.forEach((err) => {
            errors.push(err.message);
          });
        }
      }
    });
    if (errors.length) {
      return res.status(409).json({ msg: "validation error", errors });
    }
    next();
  };
};
