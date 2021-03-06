import type { ActionFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useNavigate, useTransition } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { createPost } from '~/models/post.server';

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const title = formData.get('title');
  const slug = formData.get('slug');
  const markdown = formData.get('markdown');

  const errors: ActionData = {
    title: title ? null : 'Title is required',
    slug: slug ? null : 'Slug is required',
    markdown: markdown ? null : 'Markdown is required',
  };

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);

  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof title === 'string', 'title must be a string');
  invariant(typeof slug === 'string', 'slug must be a string');
  invariant(typeof markdown === 'string', 'markdown must be a string');

  // TODO: remove me
  await new Promise((res) => setTimeout(res, 1000));

  await createPost({ title, slug, markdown });

  return redirect('/posts/admin');
};

const inputClassName = `input input-bordered w-full max-w-ws`;

export default function NewPost() {
  const errors = useActionData<ActionData>();
  const navigate = useNavigate();

  const transition = useTransition();
  const isCreating = Boolean(transition.submission);

  return (
    <Form method="post">
      <div className="form-control w-full max-w-ws">
        <label className="label">
          <span className="label-text">Post Title</span>
        </label>
        <input type="text" name="title" className={inputClassName} />
        <label className="label">
          <span className="label-text-alt text-error">{errors?.title ? errors.title : null}</span>
        </label>
      </div>
      <div className="form-control w-full max-w-ws">
        <label className="label">
          <span className="label-text">Post Slug</span>
        </label>
        <input type="text" name="slug" className={inputClassName} />
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
        />
        <label className="label">
          <span className="label-text-alt text-error">
            {errors?.markdown ? errors.markdown : null}
          </span>
        </label>
      </div>
      <div className="flex justify-end">
        <button onClick={() => navigate(-1)} className="btn btn-secondary mr-2">
          Cancel
        </button>
        <button
          type="submit"
          className={['btn btn-primary ', isCreating && 'loading'].join(' ')}
          disabled={isCreating}
        >
          {isCreating ? 'Creating...' : 'Create Post'}
        </button>
      </div>
    </Form>
  );
}
