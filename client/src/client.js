import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: "ocu0uat7",
  dataset: 'production',
  apiVersion: '2022-02-01',
  useCdn: true,
  token: "sknfKJfpZ5vpnVf3XX8cBfMUFvMYwvXpnoYGRc4KfiGYdOLlNrSlbTTWjfIeBQ49SRXXMXC4cFC8rGYkIIuIb6xSMGxKeHuO3whPG4isbHTx9zrKecPUPUBl9oGk8AX9UH75m71e8NZ3ZSuRvRvRtJccg823hRT6OleNvc8tkQAJgDINGmen",
})

export const builder = imageUrlBuilder(client)

export const urlFor = (source) => builder.image(source)