import express from "express";
import * as db from "../db.js";
import authMid from "../middlewares/auth.js";

const app = express.Router();

app.post("/create_feedback", authMid("user"), async (req, res) => {
  const { user } = req;
  const { feedback } = req.body;

  if (!feedback) return res.status(400).send("feedback is required");

  const feedbackObj = await db.Feedback.create({
    feedback,
  });

  user.addFeedback(feedbackObj);
  res.send("feedback has been created");
});

app.get("/get_feedbacks", authMid("admin"), async (req, res) => {
  const feedbacks = await db.Feedback.findAll({});

  const feedbackWithUser = await Promise.all(
    feedbacks.map(async (feedback) => {
      const user = await db.User.findOne({
        where: { id: feedback.userid },
        attributes: ["username", "email", "createdAt"],
        include: [
          {
            model: db.UserInfo,
            attributes: ["name"],
          },
        ],
      });

      return {
        id: feedback.id,
        feedback: feedback.feedback,
        username: user.username,
        name: user.UserInfo.name,
        email: user.email,
        createdAt: user.createdAt,
      };
    })
  );

  res.send(feedbackWithUser);
});

export default app;
