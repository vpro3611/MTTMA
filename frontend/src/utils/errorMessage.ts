/**
 * Get a safe message from an unknown catch value.
 * Use in catch (e: unknown) instead of (e: any) and e.message.
 */
export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e && typeof (e as { message: unknown }).message === "string") {
    return (e as { message: string }).message;
  }
  return String(e);
}
