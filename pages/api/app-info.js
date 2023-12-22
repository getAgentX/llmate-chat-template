// pages/api/app-info.js

import axios from "axios";

export default async function handler(req, res) {
  try {
    const appInfoUrl = `${process.env.NEXT_PUBLIC_LLMATE_API_URL}app-run/${req.query.id}/`;

    const response = await axios.get(appInfoUrl, {
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
