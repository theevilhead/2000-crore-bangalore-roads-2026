import { z } from "zod";
import { DAMAGE_TYPES } from "@/lib/types";

const position = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

export const newReportSchema = z.object({
  geometry: z.object({
    type: z.literal("LineString"),
    coordinates: z.array(position).min(2),
  }),
  lengthM: z.number().positive().max(200_000),
  severity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  damageTypes: z.array(z.enum(DAMAGE_TYPES)).default([]),
  note: z.string().max(500).optional(),
  sessionId: z.string().min(1),
});

export type NewReportInput = z.infer<typeof newReportSchema>;
