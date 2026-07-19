import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Client } from "@/app/client";
import { Suspense } from "react";
const Page = async () => {
  const queryClient = getQueryClient();
  // getQueryClient creates a query cache container (a bucket to store fetched data temporarily on the server).
  void queryClient.prefetchQuery(trpc.hello.queryOptions({ text: "Aryan" }));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
        <Client />
      </Suspense>
    </HydrationBoundary>
  );
};
export default Page;
