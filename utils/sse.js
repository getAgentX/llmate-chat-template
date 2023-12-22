export const createSSEWithPost = async (url, options) => {
  const response = await fetch(url, options);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  // Create a custom EventSource-like object
  const sse = new EventSource("");

  // Handle stream of data manually
  function pushMessageEvent(data) {
    const event = new MessageEvent("message", { data });
    sse.dispatchEvent(event);
  }
  function pushCloseEvent() {
    const event = new Event("close");
    sse.dispatchEvent(event);
  }

  reader.read().then(function process({ done, value }) {
    if (done) {
      pushCloseEvent();
      sse.close();
      return;
    }

    const chunk = decoder.decode(value);
    pushMessageEvent(chunk);

    return reader.read().then(process);
  });

  return sse;
};
