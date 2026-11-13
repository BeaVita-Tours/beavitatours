import ReactMarkdown from "react-markdown";
import Image from "next/image";
import type { PublishedArticle } from "@/lib/seo/contract";

/**
 * A published guide's Markdown body, in the blog's `prose prose-blog` reading
 * style. Raw HTML is dropped, only approved inline images load, and only web,
 * site-relative, anchor and mailto links stay links.
 */
export function GuideBody({
  body,
  images = [],
}: {
  body: string;
  images?: NonNullable<PublishedArticle["blog"]>["inlineImages"];
}) {
  return (
    <div className="prose prose-blog prose-lg max-w-none [overflow-wrap:anywhere]">
      <ReactMarkdown
        skipHtml
        components={{
          img: ({ src }) => {
            const approved = images.find((image) => image.url === src);
            return approved ? (
              <Image
                src={approved.url}
                alt={approved.alt}
                width={approved.width}
                height={approved.height}
                unoptimized
                referrerPolicy="no-referrer"
                className="h-auto max-w-full rounded-xl"
              />
            ) : null;
          },
          h1: ({ children }) => <h2>{children}</h2>,
          a: ({ href, children }) => {
            if (!href || !/^(https?:\/\/|\/(?!\/)|#|mailto:)/i.test(href))
              return <span>{children}</span>;
            return (
              <a
                href={href}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
              >
                {children}
              </a>
            );
          },
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
