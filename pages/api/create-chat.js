// pages/api/create-chat.js

import axios from "axios";

export default async function handler(req, res) {
  try {
    const chatUrl = `${process.env.NEXT_PUBLIC_API_URL}chat/create/`;

    const response = await axios.post(chatUrl, req.body, {
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
