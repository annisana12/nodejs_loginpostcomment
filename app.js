require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
const commentRouter = require("./routes/comments");
const likedPostRouter = require("./routes/likedpost");

app.use(express.json());

app.use("/", express.urlencoded({ extended: false }), [
    userRouter, postRouter, commentRouter, likedPostRouter
]);

app.listen(port, () => {
    console.log(`Server is open with port: ${port}`);
});