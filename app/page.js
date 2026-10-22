
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";

export default function Home() {
  const filePath = path.join(process.cwd(), "public", "portfolio", "index.html");

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const html = fs.readFileSync(filePath, "utf8");

  return (
    <iframe
      src="/portfolio/index.html"
      title="Oğuzhan Sapmaz Portföy"
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
        display: "block",
      }}
    />
  );
}
