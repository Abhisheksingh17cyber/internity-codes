import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./client";

interface SessionUser {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    id?: string;
}

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/");
    }

    // Check if user is admin
    const user = session.user as SessionUser;
    if (user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return <AdminDashboardClient user={user} />;
}
