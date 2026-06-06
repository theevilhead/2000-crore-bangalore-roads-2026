import { v4 as uuid } from "uuid";

const KEY = "br_session_id";

// Auth seam: today this is an anonymous device id. Phone-OTP later swaps the
// implementation (return the verified user id) without touching call sites.
export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(KEY, id);
  }
  return id;
}
