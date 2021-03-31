import * as React from "react";
import { GetServerSideProps } from "next";
import { Layout } from "../../components/Layout";
import { Result } from "../../components/Result";
import { InitialFlagState, useFlags } from "@happykit/flags/client";
import { getFlags } from "@happykit/flags/server";

type Traits = { prefersSmallPortion: boolean };
type AppFlags = { size: "small" | "medium" | "large" };
type ServerSideProps = {
  initialFlagState: InitialFlagState<AppFlags>;
  traits: Traits;
};

// This demo uses server-side rendering, but this works just as well with
// static site generation or client-only rendering.
export const getServerSideProps: GetServerSideProps<ServerSideProps> = async (
  context
) => {
  // These could be loaded from anywhere
  const traits: Traits = { prefersSmallPortion: true };

  const { initialFlagState } = await getFlags<AppFlags>({ context, traits });
  return { props: { initialFlagState, traits } };
};

export default function Page(props: ServerSideProps) {
  const flagBag = useFlags({
    initialState: props.initialFlagState,
    traits: props.traits,
  });
  return (
    <Layout
      title="Demo: Targeting by Traits"
      source="https://github.com/happykit/flags/blob/example/pages/demo/targeting-by-traits.tsx"
    >
      <div className="py-4">
        <p className="max-w-prose text-gray-600">
          This demo shows how to use @happykit/flags for targeting by traits.
        </p>
        <p className="mt-4 max-w-prose text-gray-600">
          You can pass any traits into the flag evaluation. These traits can
          then be used by the flags defined in your flag's rules. This allows
          you to resolve flags differently based on the provided traits.
        </p>
        <p className="mt-4 max-w-prose text-gray-600">
          Traits can be related to the visitor, to the authenticated user or to
          anything else. You can pass any traits you want. Use the traits in
          your HappyKit flag rules to resolve the flag to different variants
          based on the passed traits.
        </p>
        <Result key="targeting-by-traits" value={flagBag} />
      </div>
    </Layout>
  );
}
