import type { ActionFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData, Link, useSearchParams, Form } from '@remix-run/react';

import { db } from '~/utils/db.server';
import { login, register, createUserSession } from '~/utils/session.server';

export const meta: MetaFunction = () => {
  return {
    title: 'Remix Jokes | Login',
    description: 'Login to submit your own jokes to Remix Jokes!',
  };
};

function validateUsername(username: unknown) {
  if (typeof username !== 'string' || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== 'string' || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

function validateUrl(url: any) {
  console.log(url);
  let urls = ['/jokes', '/', 'https://remix.run'];
  if (urls.includes(url)) {
    return url;
  }
  return '/jokes';
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    loginType: string;
    username: string;
    password: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const loginType = form.get('loginType');
  const username = form.get('username');
  const password = form.get('password');
  const redirectTo = validateUrl(form.get('redirectTo') || '/jokes');
  if (
    typeof loginType !== 'string' ||
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    typeof redirectTo !== 'string'
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fields = { loginType, username, password };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean)) return badRequest({ fieldErrors, fields });

  switch (loginType) {
    case 'login': {
      const user = await login({ username, password });
      console.log({ user });
      if (!user) {
        return badRequest({
          fields,
          formError: `Username/Password combination is incorrect`,
        });
      }
      return createUserSession(user.id, redirectTo);
    }
    case 'register': {
      const userExists = await db.user.findFirst({
        where: { username },
      });
      if (userExists) {
        return badRequest({
          fields,
          formError: `User with username ${username} already exists`,
        });
      }
      const user = await register({ username, password });
      if (!user) {
        return badRequest({
          fields,
          formError: `Something went wrong trying to create a new user.`,
        });
      }
      return createUserSession(user.id, redirectTo);
    }
    default: {
      return badRequest({
        fields,
        formError: `Login type invalid`,
      });
    }
  }
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();

  return (
    <div className="px-4 h-full flex flex-col items-center justify-center">
      <div className="card w-96 max-w-full bg-base-300 shadow-xl">
        <div className="card-body">
          <h1 className="card-title">Login</h1>
          <Form method="post">
            <input
              type="hidden"
              name="redirectTo"
              value={searchParams.get('redirectTo') ?? undefined}
            />
            <fieldset className="my-4 flex gap-4 justify-center">
              <legend className="sr-only">Login or Register?</legend>
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="loginType"
                  value="login"
                  className="radio radio-accent"
                  defaultChecked={
                    !actionData?.fields?.loginType || actionData?.fields?.loginType === 'login'
                  }
                />
                <span className="label-text ml-4">Login</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="loginType"
                  value="register"
                  className="radio radio-accent"
                  defaultChecked={actionData?.fields?.loginType === 'register'}
                />
                <span className="label-text ml-4">Register</span>
              </label>
            </fieldset>
            <div className="form-control">
              <label htmlFor="username-input" className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                id="username-input"
                name="username"
                className="input input-bordered bg-base-200 placeholder:opacity-70"
                defaultValue={actionData?.fields?.username}
                aria-invalid={Boolean(actionData?.fieldErrors?.username)}
                aria-errormessage={actionData?.fieldErrors?.username ? 'username-error' : undefined}
              />
              {actionData?.fieldErrors?.username ? (
                <label className="label" role="alert" id="username-error">
                  <span className="label-text-alt text-error">
                    {actionData.fieldErrors.username}
                  </span>
                </label>
              ) : null}
            </div>
            <div className="form-control">
              <label htmlFor="password-input" className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                id="password-input"
                name="password"
                type="password"
                className="input input-bordered bg-base-200 placeholder:opacity-70"
                defaultValue={actionData?.fields?.password}
                aria-invalid={Boolean(actionData?.fieldErrors?.password) || undefined}
                aria-errormessage={actionData?.fieldErrors?.password ? 'password-error' : undefined}
              />
              {actionData?.fieldErrors?.password ? (
                <label className="label" role="alert" id="password-error">
                  <span className="label-text-alt text-error">
                    {actionData.fieldErrors.password}
                  </span>
                </label>
              ) : null}
            </div>
            <button type="submit" className="mt-4 btn btn-primary btn-block">
              Submit
            </button>
            <div id="form-error-message">
              {actionData?.formError ? (
                <label className="label" role="alert">
                  <span className="label-text-alt text-error">{actionData.formError}</span>
                </label>
              ) : null}
            </div>
          </Form>
        </div>
      </div>
      <div className="mt-4">
        <ul className="flex gap-4">
          <li>
            <Link to="/" className="link link-hover link-accent decoration-wavy">
              Home
            </Link>
          </li>
          <li>
            <Link to="/jokes" className="link link-hover link-accent decoration-wavy">
              Jokes
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
