import Link from 'next/link';

interface Article {
  title: string;
  url: string;
  logo: string;
  emoji: string;
  publication: string;
}

const articles: Article[] = [
  {
    title: 'Best Mexican Food in NWA',
    url: 'https://www.bkmag.com/2024/11/19/best-caribbean-restaurants-brooklyn/',
    logo: '/logos/bkmag-icon.svg',
    emoji: '🏆',
    publication: 'Brooklyn Magazine',
  },
  {
    title: 'Cinco de Mayo Celebration',
    url: 'https://www.nytimes.com/2024/06/17/style/juneteenth-brooklyn-lay-out.html',
    logo: '/logos/nytimes-icon.svg',
    emoji: '🎉',
    publication: 'The New York Times',
  },
  {
    title: 'New Highfill Location',
    url: 'https://patch.com/new-york/bed-stuy/pop-jerk-chicken-spot-gets-forever-home-eater',
    logo: '/logos/patch-icon.svg',
    emoji: '🏡',
    publication: 'Patch',
  },
  {
    title: 'Living the Mexican-American Dream',
    url: 'https://ny.eater.com/2022/9/14/23339205/wadadli-am-jerk-chicken-cafe-bed-stuy-brooklyn',
    logo: '/logos/eater-icon.svg',
    emoji: '🇲🇽',
    publication: 'Eater NY',
  },
];

export function Press() {
  return (
    <nav
      aria-labelledby="press-highlights"
      className="mb-1 w-64 rounded-xl bg-zinc-50/70 px-2 pb-2 shadow-md"
    >
      <h2
        id="press-highlights"
        className="my-1 select-none text-center font-bold text-black"
      >
        Press
      </h2>
      <ul className="m-0 list-none p-0">
        {articles.map((article) => (
          <li key={article.url} className="mb-1 last:mb-0">
            <Link
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between space-x-1 rounded-md border-black/10 border-b px-2 py-1 transition-colors hover:bg-black focus:outline-none focus:ring-none"
              aria-label={`${article.title} - ${article.publication}`}
            >
              {/* <Image
                src={article.logo}
                alt={`${article.publication} logo`}
                width={12}
                height={12}
                className="flex-shrink-0 rounded-sm"
              /> */}
              <span className="flex-grow truncate text-left font-semibold text-[.65rem] text-pueb group-hover:text-orange-50">
                {article.title}
              </span>
              <span
                className="flex-shrink-0 text-base transition-transform group-hover:scale-125"
                aria-hidden="true"
              >
                {article.emoji}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
