import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';

export const meta: MetaFunction = () => ({
  title: "Remix: So great, it's funny!",
  description: 'Remix jokes app. Learn Remix and laugh at the same time!',
});

export default function IndexRoute() {
  return (
    <div className="px-4 h-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-center font-semibold text-4xl text-shadow lg:text-5xl">
          Remix <span className="block uppercase text-7xl lg:text-8xl">Jokes!</span>
        </h1>
        <nav className="mt-5">
          <ul>
            <li>
              <Link
                to="jokes"
                className="font-semibold link link-accent link-hover decoration-wavy"
              >
                Read Jokes
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
