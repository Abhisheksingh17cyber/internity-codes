import { getServerSession } from "next-auth";
import { authOptions, prisma } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// GET - Fetch all users and stats
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as { role?: string };
        if (user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch all users with snippet count
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                _count: {
                    select: { snippets: true }
                }
            },
            orderBy: { id: 'desc' }
        });

        // Calculate stats
        const totalUsers = users.length;
        const totalSnippets = users.reduce((acc, u) => acc + (u._count?.snippets || 0), 0);
        const admins = users.filter(u => u.role === 'ADMIN').length;
        
        return NextResponse.json({
            users,
            stats: {
                totalUsers,
                totalSnippets,
                admins,
                recentUsers: Math.min(totalUsers, 3) // Placeholder
            }
        });
    } catch (error) {
        console.error("Admin users GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH - Update user role
export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as { role?: string };
        if (user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { userId, role } = await request.json();

        if (!userId || !role || !['USER', 'ADMIN'].includes(role)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        // Prevent removing admin from primary admin
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (targetUser?.email === 'abhiisingh240@gmail.com' && role !== 'ADMIN') {
            return NextResponse.json({ error: "Cannot demote primary admin" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("Admin users PATCH error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE - Delete user
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as { role?: string };
        if (user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        // Prevent deleting primary admin
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (targetUser?.email === 'abhiisingh240@gmail.com') {
            return NextResponse.json({ error: "Cannot delete primary admin" }, { status: 400 });
        }

        await prisma.user.delete({ where: { id: userId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin users DELETE error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
