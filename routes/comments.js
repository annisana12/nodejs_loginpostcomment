require('dotenv').config();
const express = require('express');
const { User, Comment } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");

const router = express.Router();

router.post("/comments/:postId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { postId } = req.params;
    const { comment } = req.body;

    if (comment) {
        await Comment.create({ postId, userId, comment });
        res.status(201).send({ message: "You wrote a comment." })
    } else {
        res.status(400).send({ message: "Please enter the comment content." })
    }
});

router.get("/comments/:postId", async (req, res) => {
    const { postId } = req.params;

    const commentList = await Comment.findAll({
        where: {
            postId: +postId,
        },
    });

    const userId = commentList.map((comment) => comment.userId);

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

    const result = commentList.map((comment) => ({
        commentId: comment.commentId,
        userId: comment.userId,
        nickname: usersList[comment.userId].nickname,
        comment: comment.comment,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
    }));

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

router.put("/comments/:commentId", authMiddleware, async (req, res) => {
    const { commentId } = req.params;
    const { userId } = res.locals.user;
    const { comment } = req.body;

    if (comment) {
        const existsComment = await Comment.findOne({
            where: {
                commentId: +commentId,
                userId,
            },
        });

        if (existsComment) {
            existsComment.comment = comment;

            await existsComment.save();
            res.status(201).send({ message: "Comment edited." })
        } else {
            res.status(400).send({ message: "Comment do not exist." })
        }
    } else {
        res.status(400).send({ message: "Please enter the comment content." })
    }

});

router.delete("/comments/:commentId", authMiddleware, async (req, res) => {
    const { commentId } = req.params;
    const { userId } = res.locals.user;

    const existsComment = await Comment.findOne({
        where: {
            commentId: +commentId,
            userId,
        },
    });

    if (existsComment) {
        await existsComment.destroy();
        res.status(201).send({ message: "Comment deleted." })
    } else {
        res.status(400).send({ message: "Comment do not exist." })
    }
});

module.exports = router;