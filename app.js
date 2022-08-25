import express from 'express';
import "dotenv/config";
import { PORT } from "./lib/index.js";
import { fileURLToPath } from 'url';
import path from 'path';
import POOL from "./database/db.js";

const app = express();
app.set("views", "./views");
app.set("view engine", "ejs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname + '/public')));

app.get("/", async (req, res, next) => {
    // SELECT ID OF USER IN POST AND JOIN ID AUTHOR IN AUTHOR TABLE
    const [result] = await POOL.execute("SELECT post.Id, post.Title, post.Contents, post.CreationTimestamp, author.FirstName, author.LastName FROM post JOIN author ON post.Author_Id = author.Id ORDER BY post.Title");
    res.render("layout", {template: "home", datas: result});
})

app.get("/detail/:id", async (req, res, next) => {
    const [result] = await POOL.execute("SELECT post.Id, post.Title, post.Contents, author.FirstName, author.LastName FROM post JOIN author ON post.Author_Id = author.Id WHERE post.Id = ?", [req.params.id]);
    const [comments] = await POOL.execute("SELECT comment.Id, comment.NickName, comment.Contents, comment.CreationTimestamp, comment.Post_Id, post.Id FROM comment JOIN post ON post.Id = comment.Post_Id WHERE comment.Post_Id = ? ORDER BY CreationTimestamp", [req.params.id]);
    console.log("comments", comments);
    res.render("layout", {template: "detail", datas: result[0], postId: req.params.id, comments: comments});
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})