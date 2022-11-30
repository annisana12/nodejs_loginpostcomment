require('dotenv').config();
const express = require('express');
const { User, Post } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");

const router = express.Router();

router.post("/posts", authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const { title, content } = req.body;

    if (title && content) {
        const userId = user.userId;
        const likes = 0;

        await Post.create({ userId, title, content, likes });

        res.status(201).send({ message: "You created a post." })
    } else {
        res.status(400).send({ message: "Please enter the title and content." })
    }
})

router.get("/posts", async (req, res) => {
    const postsList = await Post.findAll({});

    const userId = postsList.map((post) => post.userId);

    const usersList = await User.findAll({
        where: {
            userId: userId,
        },
    }).then((user) =>
        user.reduce(
            (prev, u) => ({
                ...prev,
                [u.userId]: u,
            }),
            {}
        )
    );

    const result = postsList.map((post) => ({
        postId: post.postId,
        userId: post.userId,
        nickname: usersList[post.userId].nickname,
        title: post.title,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likes: post.likes
    }))

    const sortedResult = result.sort((a, b) => {
        const date1 = a.createdAt;
        const date2 = b.createdAt;
        if (date1 < date2) {
            return 1
        } else if (date1 > date2) {
            return -1
        } else {
            return 1
        }
    });

    res.status(201).send({ data: sortedResult });
})

router.get("/posts/:postId", async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findByPk(+postId);
    const user = await User.findOne({
        where: { userId: post.userId },
    });

    const result = {
        postId: +postId,
        userId: post.userId,
        nickname: user.nickname,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likes: post.likes
    }

    res.status(201).send({ data: result });
})

router.put("/posts/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { user } = res.locals;
    const userId = user.userId;
    const { title, content } = req.body;

    if (title && content) {
        const existsPost = await Post.findOne({
            where: {
                postId: +postId,
                userId,
            },
        });

        if (existsPost) {
            existsPost.title = title;
            existsPost.content = content;

            await existsPost.save();
            res.status(201).send({ message: "Post edited." })
        } else {
            res.status(400).send({ message: "Post do not exist." })
        }
    } else {
        res.status(400).send({ message: "Please enter the title and content." })
    }
});

router.delete("/posts/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;

    const existsPost = await Post.findOne({
        where: {
            postId: +postId,
            userId,
        },
    });

    if (existsPost) {
        await existsPost.destroy();
        res.status(201).send({ message: "Post deleted." })
    } else {
        res.status(400).send({ message: "Post do not exist." })
    }
});

module.exports = router;