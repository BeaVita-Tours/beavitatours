import ReactMarkdown from "react-markdown";

/**
 * A published guide's Markdown body, in the blog's `prose prose-blog` reading
 * style. Raw HTML is dropped, images are skipped so article image URLs are not
 * loaded automatically, and only web, site-relative, anchor and mailto links
 * stay links.
 */
export function GuideBody({ body }: { body: string }) {
  return (
    <div className="prose prose-blog prose-lg max-w-none [overflow-wrap:anywhere]">
      <ReactMarkdown
        skipHtml
        components={{
          img: () => null,
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
