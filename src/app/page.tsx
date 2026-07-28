import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import AuthPage from "./(auth)/page";

const JWT_SECRET = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-in-production";

export default function Home() {
	const ck = cookies();

	let token: string | undefined;
	try {
		if (typeof (ck as any).get === "function") {
			token = (ck as any).get("ks_token")?.value;
		} else if ((ck as any)["ks_token"]) {
			const v = (ck as any)["ks_token"];
			token = typeof v === "object" ? v?.value ?? String(v) : String(v);
		}
	} catch {
		token = undefined;
	}

	if (token) {
		try {
			jwt.verify(token, JWT_SECRET);
			redirect("/feed");
		} catch {
			// invalid token — fall through to render auth page
		}
	}

	return <AuthPage />;
}
