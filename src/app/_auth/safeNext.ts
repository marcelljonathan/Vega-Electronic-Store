// Where to go after signing in. Only same-site paths are allowed, so a link
// like /signin?next=https://evil.example can't send users to another site.
export function safeNext(next: string | string[] | undefined) {
  if (
    typeof next === "string" &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\")
  ) {
    return next;
  }
  return "/";
}
