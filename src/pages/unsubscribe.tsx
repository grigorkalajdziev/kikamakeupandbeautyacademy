import { useRouter } from "next/router";
import { useEffect, useState } from "react";
const Unsubscribe = () => {
  const { query } = useRouter();
  const [status, setStatus] = useState("Processing...");
  useEffect(() => {
    if (!query.email) return;
    fetch(`/api/unsubscribe?email=${query.email}`)
      .then(() => setStatus("You have been unsubscribed successfully."))
      .catch(() => setStatus("Error unsubscribing."));
  }, [query.email]);
  return <div className="flex min-h-screen items-center justify-center text-center"><h2 className="text-xl text-secondary">{status}</h2></div>;
};
export default Unsubscribe;
