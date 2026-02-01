import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./client";

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/");
    }

    // Check if user is admin
    const user = session.user as any;
    if (user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return <AdminDashboardClient user={user} />;
}
