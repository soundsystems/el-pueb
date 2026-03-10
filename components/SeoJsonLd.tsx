import type { Thing, WithContext } from "schema-dts";

export function SeoJsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
  return <script type="application/ld+json">{JSON.stringify(data)}</script>;
}
