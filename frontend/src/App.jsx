import { useEffect, useMemo } from "react";
import legacyHtml from "./legacy.html?raw";

function extractBody(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : html;
  return body.replace(/<script[\s\S]*?<\/script>/gi, "");
}

export default function App() {
  const markup = useMemo(() => extractBody(legacyHtml), []);

  useEffect(() => {
    import("./legacy-app.js");
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
