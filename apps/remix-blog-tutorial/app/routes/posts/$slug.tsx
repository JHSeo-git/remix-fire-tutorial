import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { marked } from 'marked';
import invariant from 'tiny-invariant';

import type { Post } from '~/models/post.server';
import { getPost } from '~/models/post.server';

type LoaderData = { post: Post; html: string };

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, 'params.slug is required');

  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);

  const html = marked(post.markdown);

  return json<LoaderData>({ post, html });
};

export default function PostSlug() {
  const { post, html } = useLoaderData<LoaderData>();

  return (
    <>
      <h1 className="text-6xl font-bold text-center">{post.title}</h1>
      <div className="divider my-10" />
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
