import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./utils/globalErrorHandler.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("public"));

app.use(cookieParser());

app.use(globalErrorHandler);

export { app };
