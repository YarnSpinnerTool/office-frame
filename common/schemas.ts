import { z } from "zod";

export const CalendarResponseSchema = z.object({
    "entries": z.array(z.object({
        title: z.string(),
        start: z.string(),
        end: z.string().optional(),
    }))
})

export type CalendarResponse = z.infer<typeof CalendarResponseSchema>

const endpoints = [
    "/image",
    "/calendar",
] as const;

export type Endpoint = typeof endpoints[number];