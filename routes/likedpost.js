require('dotenv').config();
const express = require('express');
const { User, Post, LikedPost } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");

const router = express.Router();

router.get("/posts/like", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;

    const user = await User.findOne({
        where: { userId: userId },
    });

    const likedposts = await LikedPost.findAll({
        where: {
            userId: userId,
        },
    });

    const postId = likedposts.map((post) => post.postId);

    const postList = await Post.findAll({
        where: {
            postId: postId,
        },
    }).then((post) =>
        post.reduce(
            (prev, p) => ({
                ...prev,
                [p.postId]: p,
            }),
            {}
        )
    );

    const result = likedposts.map((post) => ({
        postId: post.postId,
        userId: userId,
        nickname: user.nickname,
        title: postList[post.postId].title,
        createdAt: postList[post.postId].createdAt,
        updateAt: postList[post.postId].updateAt,
        likes: postList[post.postId].likes
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
});

router.put("/posts/:postId/like", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { postId } = req.params;
    const likestatus = true;
    
    await LikedPost.create({ userId, postId: +postId, likestatus });

    const likedpost = await Post.findByPk(+postId);
    likedpost.likes += 1;
    await likedpost.save();

    res.status(201).send({ message: "Registered to like the post." })
});

module.exports = router;