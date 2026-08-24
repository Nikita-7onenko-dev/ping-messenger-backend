import { emailSchema, usernameSchema } from "@/users/user.schema.js";

export const identifierSchema = emailSchema.or(usernameSchema);
