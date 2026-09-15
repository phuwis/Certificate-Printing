"use client";

import { useState, useMemo } from "react";
import projects from "@/data/projects.json";
import nbtData from "@/data/nbt-69-gen1.json";
import {
  Search,
  CheckSquare,
  Square,
  Printer,
  UserCheck,
  X,
  Filter,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const projectId = params.id;

  // 1. ดึงข้อมูลโครงการและรายชื่อ
  const projectData = projects.find((p) => p.id === projectId);
  const recipients = projectId === "nbt-69-gen1" ? nbtData : [];

  // 2. States สำหรับการค้นหา และการเลือก
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 3. ดึงรายชื่อสังกัด/หน่วยงานทั้งหมดมาทำ Filter
  const departments = useMemo(() => {
    const depts = new Set(recipients.map((r) => r.department));
    return ["all", ...Array.from(depts)];
  }, [recipients]);

  // 4. กรองรายชื่อตามคำค้นหา (Search) และหน่วยงาน (Department)
  const filteredRecipients = useMemo(() => {
    return recipients.filter((r) => {
      const fullName = `${r.prefix}${r.firstName} ${r.lastName}`;
      const matchesSearch =
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept =
        selectedDept === "all" || r.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [recipients, searchTerm, selectedDept]);

  if (!projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            ไม่พบข้อมูลโครงการ
          </h2>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  // ฟังก์ชั่นเลือก/ยกเลิก เลือกรายชื่อคนนั้นๆ
  const toggleSelect = (fullNameId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(fullNameId)
        ? prev.filter((id) => id !== fullNameId)
        : [...prev, fullNameId],
    );
  };

  // ฟังก์ชั่นเลือกทั้งหมด (เฉพาะรายการที่แสดงอยู่จากการกรอง)
  const handleSelectFilteredAll = () => {
    const filteredIds = filteredRecipients.map(
      (r) => `${r.firstName}-${r.lastName}`,
    );
    const isAllFilteredSelected = filteredIds.every((id) =>
      selectedUsers.includes(id),
    );

    if (isAllFilteredSelected) {
      // ถ้านำออกทั้งหมดเฉพาะที่กรองอยู่
      setSelectedUsers((prev) =>
        prev.filter((id) => !filteredIds.includes(id)),
      );
    } else {
      // เพิ่มเฉพาะรายการที่กรองอยู่เข้า selectedUsers
      setSelectedUsers((prev) =>
        Array.from(new Set([...prev, ...filteredIds])),
      );
    }
  };

  // ฟังก์ชั่นส่งไปพิมพ์ PDF
  const handlePrintSelected = async () => {
    if (selectedUsers.length === 0) {
      alert("กรุณาเลือกรายชื่อผู้ผ่านการอบรมอย่างน้อย 1 คน");
      return;
    }

    setIsGenerating(true);
    const dataToPrint = recipients.filter((r) =>
      selectedUsers.includes(`${r.firstName}-${r.lastName}`),
    );

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: projectData.templatePdf,
          recipients: dataToPrint,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "สร้าง PDF ไม่สำเร็จ");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificates-${projectData.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-4 md:p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> กลับไปหน้ารวมโครงการ
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">
              {projectData.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ประจำปีงบประมาณ พ.ศ. 2569 • ระยะเวลา {projectData.date}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePrintSelected}
            disabled={selectedUsers.length === 0 || isGenerating}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 text-slate-50 dark:text-slate-900 font-medium text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            {isGenerating
              ? "กำลังสร้าง PDF..."
              : `พิมพ์ใบประกาศ (${selectedUsers.length} รายการ)`}
          </button>
        </div>

        {/* Selected Badges Area (แสดงชิปรายการที่เลือก) */}
        {selectedUsers.length > 0 && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                รายชื่อที่เลือกไว้ ({selectedUsers.length})
              </span>
              <button
                onClick={() => setSelectedUsers([])}
                className="text-xs text-rose-600 hover:underline font-medium"
              >
                ล้างรายการทั้งหมด
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1">
              {recipients
                .filter((r) =>
                  selectedUsers.includes(`${r.firstName}-${r.lastName}`),
                )
                .map((r) => {
                  const id = `${r.firstName}-${r.lastName}`;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {r.prefix}
                      {r.firstName} {r.lastName}
                      <button
                        onClick={() => toggleSelect(id)}
                        className="hover:text-rose-500 transition-colors ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="พิมพ์ค้นหาชื่อ, นามสกุล, ตำแหน่ง หรือสังกัด..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="relative w-full sm:w-64">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="all">ทุกสังกัด / หน่วยงาน</option>
              {departments
                .filter((d) => d !== "all")
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Recipients List Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium text-xs">
                  <th className="py-3 px-4 w-12 text-center">
                    <button
                      onClick={handleSelectFilteredAll}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="เลือกทั้งหมดเฉพาะผลการค้นหานี้"
                    >
                      {filteredRecipients.length > 0 &&
                      filteredRecipients.every((r) =>
                        selectedUsers.includes(`${r.firstName}-${r.lastName}`),
                      ) ? (
                        <CheckSquare className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                  <th className="py-3 px-4">ตำแหน่ง</th>
                  <th className="py-3 px-4">สังกัด / หน่วยงาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredRecipients.length > 0 ? (
                  filteredRecipients.map((r, idx) => {
                    const id = `${r.firstName}-${r.lastName}`;
                    const isSelected = selectedUsers.includes(id);

                    return (
                      <tr
                        key={idx}
                        onClick={() => toggleSelect(id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-slate-100/70 dark:bg-slate-800/50"
                            : "hover:bg-slate-50/80 dark:hover:bg-slate-800/20"
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-slate-900 dark:text-slate-100 mx-auto" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 dark:text-slate-700 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {r.prefix}
                          {r.firstName} {r.lastName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {r.position}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {r.department}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 text-center text-slate-400"
                    >
                      ไม่พบรายชื่อที่ตรงกับคำค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="py-3 px-4 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/30">
            <span>
              แสดง {filteredRecipients.length} จากทั้งหมด {recipients.length}{" "}
              รายชื่อ
            </span>
            <span>เลือกอยู่ {selectedUsers.length} รายการ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
