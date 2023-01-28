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
  const feedbacks = await db.Feedback.findAll({
    attributes: ["id", "feedback"],
    include: [
      {
        model: db.User,
        attributes: ["id", "username"],
      },
    ],
  });
  res.send(feedbacks);
});

export default app;
