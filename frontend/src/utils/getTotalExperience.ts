export function getTotalExperience(
  totalExperience: number | undefined,
  short?: boolean
) {
  let experience = totalExperience;
  let totalExperienceParts = [];
  if (experience) {
    const years = (experience / 12) | 0;
    const months = experience % 12;
    if (years) {
      short
        ? totalExperienceParts.push(`${years}y`)
        : totalExperienceParts.push(years, years > 1 ? "years" : "year");
    }
    if (months) {
      if (totalExperienceParts.length > 0 && !short) {
        totalExperienceParts.push("and");
      }
      short
        ? totalExperienceParts.push(`${months}m`)
        : totalExperienceParts.push(months, years > 1 ? "months" : "month");
    }
  }

  return totalExperienceParts.join(" ");
}
