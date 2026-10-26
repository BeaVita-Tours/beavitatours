import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(60),
      description: "A short label, e.g. 'Dolomites' or 'Food & Wine'.",
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
      description: "The URL segment used for /blog/category/<slug>.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.max(200),
      description: "Optional. Shown as the page subtitle on the category archive.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
    },
  },
});
