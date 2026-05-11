import Link from "next/link";
const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
    <h1 className="font-baskerville text-8xl font-normal text-secondary">404</h1>
    <h2 className="mt-4 text-2xl text-muted">Page not found</h2>
    <Link href="/home/trending" className="lezada-button lezada-button--medium mt-8 inline-block">Go to Homepage</Link>
  </div>
);
export default NotFound;
