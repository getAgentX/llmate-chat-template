// pages/api/feedback.js

import axios from "axios";

export default async function handler(req, res) {
  const { messageId, feedbackValue } = req.body;

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}chat/message/${messageId}/feedback/`;

  const payload = {
    user_feedback: feedbackValue,
  };

  try {
    const response = await axios.put(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
