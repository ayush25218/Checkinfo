import { businessTaxonomy } from "@/backend/businessTaxonomy";
import { indiaCities } from "@/frontend/admin/indiaLocations";

export const dynamic = "force-static";

export async function GET() {
  const cityByName = new Map<string, { label: string; population: number; value: string }>();

  for (const city of indiaCities) {
    const label = city.name;
    const key = label.toLowerCase();
    const population = city.population ?? 0;
    const existing = cityByName.get(key);
    if (!existing || population > existing.population) {
      cityByName.set(key, {
        label,
        population,
        value: city.id,
      });
    }
  }

  const cities = [...cityByName.values()]
    .sort((a, b) => {
      const aStartsWithLetter = /^[a-z]/i.test(a.label);
      const bStartsWithLetter = /^[a-z]/i.test(b.label);
      if (aStartsWithLetter !== bStartsWithLetter) return aStartsWithLetter ? -1 : 1;
      return a.label.localeCompare(b.label);
    })
    .map(({ label, value }) => ({ label, value }));

  return Response.json({
    categories: businessTaxonomy.map((category) => ({
      label: category.name,
      value: category.slug,
    })),
    cities,
  });
}
