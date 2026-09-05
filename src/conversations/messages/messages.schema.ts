import { zodError } from "@/common/validation/zodError.js";
import { idSchema } from "@/users/user.schema.js";
import z from "zod";

const contentSchema = z.string().min(1, zodError("REQUIRED"));

export const createMessageSchema = z.union([
  z.object({
    participantId: idSchema,
    content: contentSchema,
  }),

  z.object({
    conversationId: idSchema,
    content: contentSchema,
  }),
]);
