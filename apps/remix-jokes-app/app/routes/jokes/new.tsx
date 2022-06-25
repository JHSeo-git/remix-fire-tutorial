import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useCatch, useTransition } from '@remix-run/react';
import { JokeDisplay } from '~/components/joke';

import { db } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return json({});
};

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return `That joke is too short`;
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return `That joke's name is too short`;
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const name = form.get('name');
  const content = form.get('content');

  if (typeof name !== 'string' || typeof content !== 'string') {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  };
  const fields = { name, content };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const joke = await db.joke.create({ data: { ...fields, jokesterId: userId } });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData>();
  const transition = useTransition();

  if (transition.submission) {
    const name = transition.submission.formData.get('name');
    const content = transition.submission.formData.get('content');
    if (
      typeof name === 'string' &&
      typeof content === 'string' &&
      !validateJokeContent(content) &&
      !validateJokeName(name)
    ) {
      console.log('tran');
      return <JokeDisplay joke={{ name, content }} isOwner={true} canDelete={false} />;
    }
  }

  return (
    <div>
      <p className="font-bold py-[1em]">Add your own hilarious joke</p>
      <Form method="post">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            type="text"
            name="name"
            className="input input-bordered bg-base-200 placeholder:opacity-70"
            placeholder="What is your name?"
            defaultValue={actionData?.fields?.name}
            aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
            aria-errormessage={actionData?.fieldErrors?.name ? 'name-error' : undefined}
          />
          {actionData?.fieldErrors?.name ? (
            <label className="label" role="alert" id="name-error">
              <span className="label-text-alt text-error">{actionData.fieldErrors.name}</span>
            </label>
          ) : null}
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Content</span>
          </label>
          <textarea
            name="content"
            className="textarea textarea-bordered bg-base-200 placeholder:opacity-70"
            placeholder="Type your joke!"
            defaultValue={actionData?.fields?.content}
            aria-invalid={Boolean(actionData?.fieldErrors?.content) || undefined}
            aria-errormessage={actionData?.fieldErrors?.content ? 'content-error' : undefined}
          />
          {actionData?.fieldErrors?.content ? (
            <label className="label" role="alert" id="content-error">
              <span className="label-text-alt text-error">{actionData.fieldErrors.content}</span>
            </label>
          ) : null}
        </div>
        <div className="mt-4">
          {actionData?.formError ? (
            <p className="text-error" role="alert">
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary btn-block">
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <div className="bg-error rounded-lg p-4 text-white">
        <p>You must be logged in to create a joke.</p>
        <Link to="/login" className="mt-4 btn btn-warning btn-sm">
          Login
        </Link>
      </div>
    );
  }
}

export function ErrorBoundary() {
  return (
    <div className="bg-error rounded-lg p-4 text-white">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}
