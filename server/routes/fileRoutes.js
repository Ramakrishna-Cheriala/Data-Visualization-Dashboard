import express from "express";
import upload from "../middlewares/multer.js";
import {
  uploadFileController,
  filePreviewController,
} from "../controllers/fileController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadFileController);
router.get("/preview", filePreviewController);

export default router;
