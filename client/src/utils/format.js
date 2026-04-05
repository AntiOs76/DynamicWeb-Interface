export function formatDate(dateValue) {
  if (!dateValue) {
    return "Not reviewed yet";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(dateValue));
}

export function formatRelativeDue(dateValue) {
  if (!dateValue) {
    return "Ready now";
  }

  const target = new Date(dateValue);
  const now = new Date();
  const diffDays = Math.round((target.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) {
    return "Due now";
  }

  if (diffDays === 1) {
    return "Due tomorrow";
  }

  return `Due in ${diffDays} days`;
}

