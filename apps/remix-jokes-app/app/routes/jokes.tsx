import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, Outlet, useLoaderData } from '@remix-run/react';

import { db } from '~/utils/db.server';
import { getUser } from '~/utils/session.server';

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  jokeListItems: Array<{ id: string; name: string }>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const jokeListItems = await db.joke.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true },
  });
  const user = await getUser(request);

  const data: LoaderData = {
    jokeListItems,
    user,
  };
  return json(data);
};

export default function JokesRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <header className="py-4">
        <div className="container px-4 mx-auto">
          <div className="navbar">
            <div className="flex-1">
              <h1 className="font-semibold text-5xl">
                <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
                  <span className="sm:hidden">🤪</span>
                  <span className="hidden sm:block">J🤪KES</span>
                </Link>
              </h1>
            </div>
            {data.user ? (
              <div className="flex-none">
                <div className="flex gap-4 items-center">
                  <span className="text-accent font-bold">{`Hi ${data.user.username}`}</span>
                  <Form action="/logout" method="post">
                    <button type="submit" className="btn btn-sm btn-secondary">
                      Logout
                    </button>
                  </Form>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-sm btn-info">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="py-8 sm:py-12">
        <div className="container px-4 mx-auto flex flex-col sm:flex-row gap-4">
          <div className="sm:max-w-[12rem]">
            <Link to="." className="btn btn-accent">
              Get a random joke
            </Link>
            <p className="my-[1em]">Here are a few more jokes to check out:</p>
            <ul className="my-[1em]">
              {data.jokeListItems.map((joke) => (
                <li key={joke.id} className="my-[1em] link link-hover link-accent">
                  <Link prefetch="intent" to={joke.id}>
                    {joke.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="btn btn-primary">
              Add your own
            </Link>
          </div>
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
