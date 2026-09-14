import { NextRequest, NextResponse } from "next/server";
import { getSessionMailbox } from "@/lib/session";
import { getMessage, deleteMessage } from "@/lib/mailtm";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let token: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }

    if (!token) {
      const session = await getSessionMailbox();
      if (session?.token) {
        token = session.token;
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "No active mailbox session found" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing message ID" }, { status: 400 });
    }

    const message = await getMessage(token, id);

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch message content",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let token: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }

    if (!token) {
      const session = await getSessionMailbox();
      if (session?.token) {
        token = session.token;
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "No active mailbox session found" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing message ID" }, { status: 400 });
    }

    await deleteMessage(token, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete message",
      },
      { status: 500 }
    );
  }
}
