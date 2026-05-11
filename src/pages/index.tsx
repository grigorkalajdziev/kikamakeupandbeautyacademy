import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: "/home/trending", permanent: true }
});
export default function Index() { return null; }
