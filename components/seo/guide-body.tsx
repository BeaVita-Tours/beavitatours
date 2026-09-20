import ReactMarkdown from "react-markdown";
import styles from "./guide-body.module.css";

export function GuideBody({ body }: { body: string }) {
  return (
    <div className={styles.body}>
      <ReactMarkdown
        skipHtml
        components={{
          // Skip images so article image URLs are not loaded automatically.
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
