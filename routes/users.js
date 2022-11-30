require('dotenv').config();
const express = require('express');
const { Op } = require("sequelize");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const router = express.Router();

const SECRET_KEY = "PTW7_SECRET_KEY";

const postUsersSchema = Joi.object({
    nickname: Joi.string().alphanum().min(3).required(),
    password: Joi.string().min(4).required(),
    confirmPassword: Joi.string().required(),
});

router.post("/signup", async (req, res) => {
    try {
        const {
            nickname,
            password,
            confirmPassword,
        } = await postUsersSchema.validateAsync(req.body);

        if (nickname === nickname.toLowerCase() || nickname === nickname.toUpperCase()) {
            throw new Error(err)
        }

        if (password !== confirmPassword) {
            res.status(400).send({
                errorMessage: "Password is not the same as password checkbox.",
            });
            return;
        }

        if (password === nickname) {
            res.status(400).send({
                errorMessage: "Password must be different from nickname."
            })
            return;
        }

        const existUsers = await User.findAll({
            where: { [Op.or]: [{ nickname }], }
        });

        if (existUsers.length) {
            res.status(400).send({
                errorMessage: "This is a duplicate nickname."
            })
            return;
        }

        await User.create({ nickname, password });

        res.status(201).send({ message: "You have successfully registered as a member" })

    } catch (err) {
        res.status(400).send({
            errorMessage: "The requested data type is not valid.",
        })
    }
});

router.post("/login", async (req, res) => {
    const { nickname, password } = req.body;

    const user = await User.findOne({
        where: {
            nickname,
        },
    });

    if (!user || password !== user.password) {
        res.status(400).send({
            errorMessage: "Wrong email or password.",
        });
        return;
    }

    res.send({
        token: jwt.sign({ userId: user.userId }, SECRET_KEY),
    });
});

module.exports = router;