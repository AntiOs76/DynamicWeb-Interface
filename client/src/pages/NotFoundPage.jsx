import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="screen-center">
      <div className="panel centered-panel">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="muted-text">This route does not exist in the RecallFlow workspace.</p>
        <Link className="primary-button inline-button" to="/">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

