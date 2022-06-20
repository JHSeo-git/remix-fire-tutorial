import { Link } from '@remix-run/react';

export default function AdminIndex() {
  return (
    <Link to="new" className="btn btn-secondary btn-block">
      Create a New Post
    </Link>
  );
}
