import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import fileRoutes from "./routes/fileRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://localhost:4173",
      process.env.CLIENT_URL,
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api/v1/file", fileRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
