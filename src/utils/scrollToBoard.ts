export function scrollToBoard(behavior: ScrollBehavior = "smooth") {
  requestAnimationFrame(() => {
    document.getElementById("board")?.scrollIntoView({ behavior, block: "start" });
  });
}

export const BOARD_QUERY_KEYS = ["q", "kind", "city", "company", "department", "stream"] as const;

export function shouldScrollToBoard(search: string): boolean {
  const params = new URLSearchParams(search);
  return BOARD_QUERY_KEYS.some((key) => params.has(key));
}
