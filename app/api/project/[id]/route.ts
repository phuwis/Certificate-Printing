import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  ObjectivesType,
  CriteriaType,
  ProjectFileType,
  FormattedProject,
  ProjectApiResponse,
} from "@/types/project";

// Helper for Safe JSON Parsing
function safeJsonParse<T>(
  jsonString: string | null | undefined,
  fallback: T,
): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("JSON Parse Error:", error);
    return fallback;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ProjectApiResponse>> {
  try {
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        graduates: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลโครงการ" },
        { status: 404 },
      );
    }

    const { graduates, objectives, criterias, files, ...projectData } =
      project as any;

    const formattedProject: FormattedProject = {
      ...projectData,
      objectives: safeJsonParse<ObjectivesType | null>(objectives, null),
      criterias: safeJsonParse<CriteriaType[]>(criterias, []),
      files: safeJsonParse<ProjectFileType[]>(files, []),
    };

    return NextResponse.json({
      project: formattedProject,
      recipients: graduates,
    });
  } catch (error: any) {
    console.error("Fetch Project Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message },
      { status: 500 },
    );
  }
}
