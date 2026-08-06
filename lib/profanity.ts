import Filter from "bad-words";

let filterSingleton: Filter | null = null;

function getFilter(): Filter {
  if (!filterSingleton) {
    filterSingleton = new Filter();
  }
  return filterSingleton;
}

// Client-side pass — catches the vast majority of attempts and gives instant
// feedback in the form. Public-facing fields (username, display name, bio,
// link labels) are also re-checked by a Postgres trigger on `profiles`, so
// this isn't the only line of defense — just the friendly one.
//
// Deliberately NOT applied to notes/goals/journal content: that's private,
// locked-down data (see README), and filtering someone's own private
// journal would work against the point of it being theirs alone.
export function containsProfanity(text: string): boolean {
  if (!text || !text.trim()) return false;
  return getFilter().isProfane(text);
}

export function firstProfaneField(
  fields: Record<string, string>
): string | null {
  for (const [name, value] of Object.entries(fields)) {
    if (containsProfanity(value)) return name;
  }
  return null;
}
