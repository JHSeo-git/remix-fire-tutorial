import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { getPosts } from '~/models/post.server';

type LoaderData = {
  // this is a handy way to say: "posts is whatever type getPosts resolves to"
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader = async () => {
  return json<LoaderData>({
    posts: await getPosts(),
  });
};

export default function Posts() {
  const { posts } = useLoaderData<LoaderData>();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Posts</h1>
        <Link to="admin" className="btn btn-primary">
          Admin
        </Link>
      </div>
      <div className="divider" />
      <ul>
        {posts.map((post) => (
          <li className="my-2" key={post.slug}>
            <Link
              to={post.slug}
              className="btn btn-block btn-ghost justify-start text-info text-xl"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
