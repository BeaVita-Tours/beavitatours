"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { codeInput } from "@sanity/code-input";
import { schemaTypes } from "@/sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export default defineConfig({
  name: "beavitatours",
  title: "BeaVitaTours Studio",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.documentTypeListItem("post").title("Posts"),
            S.documentTypeListItem("author").title("Authors"),
            S.documentTypeListItem("category").title("Categories"),
          ]),
    }),
    codeInput(),
  ],
  schema: {
    types: schemaTypes,
    // A ready-to-fill draft template for new posts so writers start with the
    // right structure instead of a blank slate.
    templates: [
      {
        id: "post-starter",
        schemaType: "post",
        title: "Post — starter",
        description: "Starts a draft with placeholder content to fill in.",
        value: {
          title: "New post",
          excerpt:
            "A short summary shown on the blog list and in search results.",
          body: [
            {
              _type: "block",
              _key: "intro",
              style: "normal",
              markDefs: [],
              children: [
                {
                  _type: "span",
                  _key: "intro-text",
                  text: "Write your introduction here. Use the + button above to add headings, quotes, links, images, and code blocks.",
                  marks: [],
                },
              ],
            },
          ],
        },
      },
    ],
  },
});
