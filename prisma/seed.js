const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ฟังก์ชันช่วยอ่านไฟล์ JSON ป้องกันกรณีหาไฟล์ไม่พบ
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(` Error reading ${filePath}:`, error.message);
  }
  return [];
}

async function main() {
  console.log("🌱 Starting Database Seeding...");

  const dataDir = path.join(process.cwd(), "data");

  // 1. อ่านข้อมูล projects.json
  const projectsPath = path.join(dataDir, "projects.json");
  const projectsData = readJsonFile(projectsPath);

  if (!projectsData || projectsData.length === 0) {
    console.error("❌ ไม่พบข้อมูลใน data/projects.json");
    return;
  }

  // 2. ลูปบันทึกข้อมูล Project
  for (const proj of projectsData) {
    console.log(`\n📌 Processing Project: ${proj.name} (${proj.id})`);

    // แปลง Object/Array เป็น JSON String เพื่อเก็บลง SQLite
    const projectRecord = {
      id: proj.id,
      slug: proj.id,
      name: proj.name,
      course: proj.course || null,
      date: proj.date || null,
      location: proj.location || null,
      description: proj.description || null,
      host: proj.host || null,
      objectives: proj.objectives ? JSON.stringify(proj.objectives) : null,
      criterias: proj.criterias ? JSON.stringify(proj.criterias) : "[]",
      files: proj.files ? JSON.stringify(proj.files) : "[]",
      templatePdf: proj.templatePdf || "",
      recipientsFile: proj.recipientsFile || null,
    };

    // Upsert Project (สร้างใหม่ หรือ อัปเดตถ้ามีอยู่แล้ว)
    const savedProject = await prisma.project.upsert({
      where: { id: proj.id },
      update: projectRecord,
      create: projectRecord,
    });

    // 3. อ่านไฟล์รายชื่อผู้เข้าร่วมอบรม (recipientsFile) ถ้ามีระบุไว้
    // 3. อ่านไฟล์รายชื่อผู้เข้าร่วมอบรม (recipientsFile) ถ้ามีระบุไว้
    if (proj.recipientsFile) {
      const recipientsPath = path.join(dataDir, proj.recipientsFile);
      const recipientsData = readJsonFile(recipientsPath);

      //  ลบข้อมูล Graduate เก่าของโครงการนี้ออกเสมอ (ไม่ว่าไฟล์ใหม่จะมีข้อมูลหรือเป็น [] ว่างเปล่า)
      await prisma.graduate.deleteMany({
        where: { projectId: savedProject.id },
      });

      if (Array.isArray(recipientsData) && recipientsData.length > 0) {
        let addedCount = 0;
        for (const recipient of recipientsData) {
          if (recipient.firstName) {
            await prisma.graduate.create({
              data: {
                projectId: savedProject.id,
                prefix: recipient.prefix || null,
                firstName: recipient.firstName,
                lastName: recipient.lastName || "",
                position: recipient.position || null,
                department: recipient.department || null,
                idCardLast4: recipient.idCardLast4 || null,
              },
            });
            addedCount++;
          }
        }
        console.log(
          `   ✅ เพิ่มรายชื่อผู้เข้าร่วมอบรมจำนวน ${addedCount} รายการจาก ${proj.recipientsFile}`,
        );
      } else {
        console.log(
          `   🧹 ล้างรายชื่อเก่าเรียบร้อยแล้ว (ไฟล์ ${proj.recipientsFile} เป็นอาร์เรย์ว่าง)`,
        );
      }
    }
  }

  console.log("\n🎉 Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
