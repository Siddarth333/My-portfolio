// SSR error wrapper: when a request fails with a bare 500, log the original error
// captured by error-capture and serve a friendly HTML error page instead.
import { consumeLastCapturedError, describeError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export default createServerEntry({
  async fetch(request, ...rest) {
    try {
      const response = await handler.fetch(request, ...rest);
      if (response.status >= 500 && (request.headers.get("accept") ?? "").includes("text/html")) {
        const captured = consumeLastCapturedError();
        if (captured) console.error(describeError(captured));
        return new Response(renderErrorPage(), {
          status: response.status,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      return response;
    } catch (error) {
      console.error(describeError(error));
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
});
