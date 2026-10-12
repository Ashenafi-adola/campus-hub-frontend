


export const getTimeSince = (item: string|undefined): string => {
    if (!item) return "unknown";
    const that = new Date(item);
    const current = new Date();

    const difference = current.getTime() - that.getTime();

    const days = Math.floor(difference / 86_400_000);
    const hours = Math.floor(difference / 3_600_000);
    const minutes = Math.floor(difference / 60_000);
    if (days >= 30){
        return "long time ago"
    }else if (days > 0) {
        return days === 1 ? `${days} day ago` : `${days} days ago`;
    } else if (hours > 0) {
        return hours === 1 ? `${hours} hour ago` : `${hours} hours ago`;
    } else if (minutes > 0) {
        return `${minutes} minute ago`;
    }

    return "just now";
};

export function getInitials(name: string) {
  return name
    .replace(/^Dr\.\s*/i, "")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}