import joi from "joi";

export const generalFieldes = {
  headers: joi.object({
    token: joi.string().required(),
    "content-type": joi.string(),
    "content-length": joi.string(),
    accept: joi.string(),
    host: joi.string(),
    "user-agent": joi.string(),
    "accept-encoding": joi.string(),
    connection: joi.string(),
    "x-forwarded-for": joi.string(),
    "x-forwarded-proto": joi.string(),
    forwarded: joi.string(),
    "x-real-ip": joi.string(),
    "x-vercel-id": joi.string(),
    "x-vercel-deployment-url": joi.string(),
    "x-vercel-ip-continent": joi.string(),
    "x-vercel-ip-country": joi.string(),
    "x-vercel-ip-country-region": joi.string(),
    "x-vercel-ip-city": joi.string(),
    "x-vercel-ip-latitude": joi.number(),
    "x-vercel-ip-longitude": joi.number(),
    "x-vercel-ip-timezone": joi.string(),
    "x-vercel-ip-as-number": joi.string(),
    "x-vercel-proxy-signature": joi.string(),
    "x-vercel-forwarded-for": joi.string(),
    "x-forwarded-host": joi.string(),
    "access-control-allow-credentials": joi.string(),
    "access-control-allow-origin": joi.string(),
    "x-vercel-proxied-for": joi.string(),
    "x-vercel-ja4-digest": joi.string(),
    "x-vercel-proxy-signature-ts": joi.string(),
    "postman-token": joi.string()
  }),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    mimetype: joi.string().required(),
    fieldname: joi.string().required(),
    encoding: joi.string().required(),
    destination: joi.string().required(),
    originalname: joi.string().required(),
  }),
};
