export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Force a public DNS resolver — some hosts advertise a link-local IPv6
    // resolver that Node's DNS client can't query, breaking mongodb+srv:// lookups.
    const dns = await import("dns");
    dns.setServers(["8.8.8.8"]);
  }
}
