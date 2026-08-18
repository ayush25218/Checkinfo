import { HomePage } from "@/frontend/web/HomePage";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: PageProps) {
  const params = (await searchParams) || {};
  const code = firstSearchParam(params.code);
  const state = firstSearchParam(params.state);

  if (code && state) {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "";
    const protocol = requestHeaders.get("x-forwarded-proto") || "https";
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || (host ? `${protocol}://${host}` : "");
    const callbackParams = new URLSearchParams({
      code,
      state,
    });

    if (redirectUri) {
      callbackParams.set("redirect_uri", redirectUri);
    }

    redirect(`/api/auth/oauth/callback?${callbackParams.toString()}`);
  }

  return <HomePage />;
}
