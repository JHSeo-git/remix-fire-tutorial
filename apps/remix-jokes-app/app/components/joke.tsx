import { Link, Form } from '@remix-run/react';
import type { Joke } from '@prisma/client';

export function JokeDisplay({
  joke,
  isOwner,
  canDelete = true,
}: {
  joke: Pick<Joke, 'content' | 'name'>;
  isOwner: boolean;
  canDelete?: boolean;
}) {
  return (
    <div>
      <p className="font-bold py-[1em]">Here's your hilarious joke:</p>
      <p className="py-[1em] prose">{joke.content}</p>
      <div className="flex gap-4">
        <Link to="." className="btn btn-primary flex-1">
          {joke.name} Permalink
        </Link>
        {isOwner ? (
          <Form method="post">
            <input type="hidden" name="_method" value="delete" />
            <button type="submit" className="btn btn-error" disabled={!canDelete}>
              Delete
            </button>
          </Form>
        ) : null}
      </div>
    </div>
  );
}
