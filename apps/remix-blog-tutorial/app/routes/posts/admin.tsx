import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useNavigate } from '@remix-run/react';

import { getPosts } from '~/models/post.server';

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader: LoaderFunction = async () => {
  return json({ posts: await getPosts() });
};

export default function PostAdmin() {
  const { posts } = useLoaderData<LoaderData>();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-2xl p-10">
      <nav className="navbar">
        <button onClick={() => navigate(-1)} className="btn btn-ghost">
          back
        </button>
      </nav>
      <h1 className="text-6xl font-bold text-center">Admin</h1>
      <div className="divider" />
      <div className="grid grid-cols-4 gap-6">
        <nav className="col-span-4 md:col-span-1">
          <ul>
            {posts.map((post) => (
              <li className="mb-4" key={post.slug}>
                <Link to={post.slug} className="btn btn-block btn-primary">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="col-span-4 md:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
