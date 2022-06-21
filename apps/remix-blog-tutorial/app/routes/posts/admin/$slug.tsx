import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useTransition } from '@remix-run/react';
import invariant from 'tiny-invariant';

import type { Post } from '~/models/post.server';
import { updatePost, deletePost, getPost } from '~/models/post.server';

type LoaderData = { post: Post };

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, 'params.slug is required');

  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);

  return json<LoaderData>({ post });
};

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
      intent: null | string;
    }
  | undefined;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const title = formData.get('title');
  const slug = formData.get('slug');
  const markdown = formData.get('markdown');
  const intent = formData.get('intent');

  const errors: ActionData = {
    title: title ? null : 'Title is required',
    slug: slug ? null : 'Slug is required',
    markdown: markdown ? null : 'Markdown is required',
    intent: intent ? null : 'Intent is required',
  };

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);

  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof title === 'string', 'title must be a string');
  invariant(typeof slug === 'string', 'slug must be a string');
  invariant(typeof markdown === 'string', 'markdown must be a string');
  invariant(typeof intent === 'string', 'intent must be a string');

  // TODO: remove me
  await new Promise((res) => setTimeout(res, 1000));

  if (intent === 'update') {
    await updatePost({ title, slug, markdown });
    return redirect(`/posts/${slug}`);
  } else {
    await deletePost(slug);
    return redirect('/posts');
  }
};

const inputClassName = `input input-bordered w-full max-w-ws`;

export default function EditPost() {
  const { post } = useLoaderData<LoaderData>();
  const errors = useActionData<ActionData>();

  const transition = useTransition();
  const isUpdating = Boolean(transition.submission);

  return (
    <Form method="post">
      <div className="form-control w-full max-w-ws">
        <label className="label">
          <span className="label-text">Post Title</span>
        </label>
        <input type="text" name="title" className={inputClassName} defaultValue={post.title} />
        <label className="label">
          <span className="label-text-alt text-error">{errors?.title ? errors.title : null}</span>
        </label>
      </div>
      <div className="form-control w-full max-w-ws">
        <label className="label">
          <span className="label-text">Post Slug</span>
        </label>
        <input
          type="text"
          name="slug"
          className={inputClassName}
          defaultValue={post.slug}
          readOnly
        />
        <label className="label">
          <span className="label-text-alt text-error">{errors?.slug ? errors.slug : null}</span>
        </label>
      </div>
      <div className="form-control w-full max-w-ws">
        <label className="label">
          <span className="label-text">Markdown</span>
        </label>
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          className={`textarea textarea-bordered h-96 font-mono`}
          defaultValue={post.markdown}
        />
        <label className="label">
          <span className="label-text-alt text-error">
            {errors?.markdown ? errors.markdown : null}
          </span>
        </label>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          name="intent"
          value="delete"
          className={['btn btn-secondary mr-2', isUpdating && 'loading'].join(' ')}
          disabled={isUpdating}
        >
          Delete Post
        </button>
        <button
          type="submit"
          name="intent"
          value="update"
          className={['btn btn-primary ', isUpdating && 'loading'].join(' ')}
          disabled={isUpdating}
        >
          Update Post
        </button>
      </div>
    </Form>
  );
}
