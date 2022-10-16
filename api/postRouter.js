import { Router } from "express";
import multer from "multer";
import { postImage , getPosts, deletePost, updateHomepage, likePost, removeLike, getLikes} from "../services/postService.js";
import { notStrict, isUser, isAdmin} from "../services/userService.js"

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

export const postRouter = new Router();

postRouter.post("/", isUser, isAdmin, upload.single("image"), postImage)

postRouter.get("/", notStrict, isUser, getPosts)

postRouter.delete("/", isUser, isAdmin, deletePost)

postRouter.patch("/homepage/switch",isUser,isAdmin,updateHomepage)

postRouter.post("/like", isUser, likePost)

postRouter.delete("/like", isUser, removeLike)

postRouter.get("/my/likes", isUser, getLikes)