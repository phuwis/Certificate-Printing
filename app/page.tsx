import Link from "next/link";
import projects from "../data/projects.json";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        ระบบรวบรวมโครงการ สถาบันดำรงราชานุภาพ
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <p className="text-gray-600 mt-2">วันที่: {project.date}</p>
            <p className="text-sm mt-2">{project.description}</p>
            <Link href={`/project/${project.id}`}>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                จัดการและพิมพ์ใบประกาศ
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
