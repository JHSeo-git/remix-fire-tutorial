import { Link } from '@remix-run/react';

export default function Index() {
  return (
    <div className="container mx-auto max-w-2xl p-10 text-center">
      <Link to="/posts" className="text-xl link">
        Posts
      </Link>
    </div>
  );
}
