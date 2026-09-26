import ReactMarkdown from "react-markdown";
import type { Post } from "@/lib/blog/types";
import { BlogImage } from "./blog-image";

/** Same prose markup as Alex's template; only explicitly saved photos can render. */
export function BlogBody({ value, images = [] }: { value?: string; images?: Post["inlineImages"] }) {
  return <ReactMarkdown skipHtml components={{
    h1: ({ children }) => <h2 className="scroll-mt-28">{children}</h2>,
    h2: ({ children }) => <h2 className="scroll-mt-28">{children}</h2>,
    h3: ({ children }) => <h3 className="scroll-mt-28">{children}</h3>,
    h4: ({ children }) => <h4 className="scroll-mt-28">{children}</h4>,
    p: ({ node, children }) => node?.children.some((child) => child.type === "element" && child.tagName === "img") ? <>{children}</> : <p>{children}</p>,
    img: ({ src, alt }) => {
      const image = images.find((image) => image.url === src);
      if (!image) return null;
      return <figure><BlogImage src={image.url} alt={alt ?? image.alt} width={image.width} height={image.height} sizes="(min-width: 768px) 768px, 100vw" className="rounded-xl" />
        {(alt || image.alt) && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{alt || image.alt}</figcaption>}
      </figure>;
    },
    a: ({ href, children }) => !href || !/^(https?:\/\/|\/(?!\/)|#|mailto:)/i.test(href)
      ? <span>{children}</span> : <a href={href} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>{children}</a>,
  }}>{value ?? ""}</ReactMarkdown>;
}
