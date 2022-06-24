import { Link } from '@remix-run/react';

export default function IndexRoute() {
  return (
    <div className="container mx-auto h-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <h1>
          Remix <span className="block">Jokes!</span>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to="jokes">Read Jokes</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
