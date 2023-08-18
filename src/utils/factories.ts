import { UIError } from "./types";

export const createUIError = (message: string, trace?: string): UIError => ({
  message,
  trace,
});
