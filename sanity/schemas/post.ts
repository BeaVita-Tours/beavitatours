import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().min(3).max(120),
      description: "The headline of the post, shown on the blog list and in search results.",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: "The URL segment. Generated from the title — e.g. /blog/a-day-in-the-dolomites.",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(220),
      description: "A short summary (up to 220 characters) shown on cards and used as the meta description fallback.",
    }),
    defineField({
      name: "mainImage",
      title: "Cover image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (Rule) => Rule.required().max(160),
          description: "Describes the image for screen readers and SEO. Required.",
        }),
      ],
      description: "The large image displayed at the top of the post and on its card.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Heading 4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "External link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (Rule) =>
                      Rule.required().uri({ scheme: ["http", "https"] }),
                  },
                  {
                    name: "openInNewTab",
                    type: "boolean",
                    title: "Open in new tab",
                    initialValue: true,
                  },
                ],
              },
              {
                name: "internalLink",
                type: "object",
                title: "Internal post link",
                fields: [
                  {
                    name: "post",
                    type: "reference",
                    to: [{ type: "post" }],
                    validation: (Rule) => Rule.required(),
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          title: "Image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative text",
              description: "Describes the image for screen readers and SEO.",
            },
          ],
        },
        { type: "code", title: "Code block" },
      ],
      description: "The main article content. Use the + button to add headings, images, and code blocks.",
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      description: "One or more categories. Used to group posts on the blog.",
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      description: "The person credited for the post.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (Rule) => Rule.required(),
      description: "When the post goes live. Posts with a future date stay hidden until then.",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      description: "Optional overrides for how the post appears in Google and social shares. Falls back to title/excerpt/image when left empty.",
      fields: [
        {
          name: "seoTitle",
          title: "SEO title",
          type: "string",
          validation: (Rule) => Rule.max(60),
          description: "Browser tab / Google headline. Defaults to the post title.",
        },
        {
          name: "seoDescription",
          title: "SEO description",
          type: "text",
          rows: 3,
          validation: (Rule) => Rule.max(160),
          description: "The snippet shown under the headline. Defaults to the excerpt.",
        },
        {
          name: "seoImage",
          title: "Social share image",
          type: "image",
          options: { hotspot: true },
          description: "1200×630 recommended. Defaults to the cover image.",
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "excerpt",
      media: "mainImage",
    },
  },
});
