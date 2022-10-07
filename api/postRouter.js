import { Router } from "express";
import multer from "multer";
import { postImage , getPosts} from "../services/postService.js";
import { notStrict, isUser, isAdmin} from "../services/userService.js"

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

export const postRouter = new Router();

postRouter.post("/", isUser, isAdmin, upload.single("image"), postImage)

postRouter.get("/", notStrict, isUser, getPosts)