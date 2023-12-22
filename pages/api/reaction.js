// pages/api/reaction.js

import axios from "axios";

export default async function handler(req, res) {
  const { id, data } = req.body;

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}chat/message/${id}/reaction/`;

  const payload = {
    user_reaction: data,
  };

  try {
    const response = await axios.put(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY,
      },
    });

    // Assuming response.data contains the relevant information you want to send
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
