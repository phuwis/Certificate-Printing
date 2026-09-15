import { NextResponse } from "next/server";
import projects from "@/data/projects.json";
import nbtData from "@/data/nbt-69-gen1.json";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = params.id;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({
    project,
    recipients: nbtData,
  });
}
