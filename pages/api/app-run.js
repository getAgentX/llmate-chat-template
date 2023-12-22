// pages/api/app-run.js

export default async function handler(req, res) {
  const apiUrl = `https://stream.llmate.ai/v1/integrate/app/6501d2848ad0f1ca427d4056/run/`;
  // const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}app/${process.env.NEXT_PUBLIC_API_ID}/run/`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "37da52c0-00b5-4638-9859-ae98ed776eaf",
      },
      body: JSON.stringify(req.body),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    async function sendEvent(data) {
      res.write(`${data}`);
    }

    async function closeConnection() {
      res.end();
    }

    async function process({ done, value }) {
      if (done) {
        closeConnection();
        return;
      }

      const chunk = decoder.decode(value);
      sendEvent(chunk);

      return reader.read().then(process);
    }

    reader.read().then(process);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
