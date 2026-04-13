export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL ?? "https://crucial-mouse-27.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
