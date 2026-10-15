"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Edit, Mail, Phone, MapPin, Globe } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { jsPDF } from "jspdf";

export default function CVPreviewPage() {
  const cvRef = useRef<HTMLDivElement>(null);
  const [cv, setCv] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    fetchCV();
  }, []);

  const fetchCV = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ success: boolean; cv: any }>("/cv");
      if (res.success && res.cv) {
        setCv(res.cv);
      }
    } catch (e) {
      console.error("Failed to load CV preview:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintDownload = () => {
    window.print();
  };

  const handleJsPdfDownload = () => {
    if (!cv) return;
    try {
      setIsGeneratingPdf(true);
      const doc = new jsPDF({
        unit: "pt",
        format: "a4",
      });

      let y = 40;
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();

      // Name & Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(cv.fullName || "Student CV", margin, y);
      y += 20;

      // Contact Line
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const contactInfo = [cv.email, cv.phone, cv.location].filter(Boolean).join("  |  ");
      doc.text(contactInfo, margin, y);
      y += 15;

      // Horizontal Rule
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 20;

      // Professional Summary
      if (cv.summary) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("PROFESSIONAL SUMMARY", margin, y);
        y += 15;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const splitSummary = doc.splitTextToSize(cv.summary, pageWidth - margin * 2);
        doc.text(splitSummary, margin, y);
        y += splitSummary.length * 12 + 15;
      }

      // Education
      if (cv.education && cv.education.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("EDUCATION", margin, y);
        y += 15;

        cv.education.forEach((edu: any) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(edu.institution || "", margin, y);
          doc.setFont("helvetica", "normal");
          doc.text(`${edu.startDate || ""} - ${edu.endDate || ""}`, pageWidth - margin - 80, y);
          y += 12;

          doc.setFont("helvetica", "italic");
          doc.text(edu.qualification || "", margin, y);
          y += 12;

          if (edu.description) {
            doc.setFont("helvetica", "normal");
            const splitDesc = doc.splitTextToSize(edu.description, pageWidth - margin * 2);
            doc.text(splitDesc, margin, y);
            y += splitDesc.length * 11;
          }
          y += 8;
        });
        y += 10;
      }

      // Experience
      if (cv.experience && cv.experience.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("WORK EXPERIENCE", margin, y);
        y += 15;

        cv.experience.forEach((exp: any) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`${exp.position || ""} - ${exp.company || ""}`, margin, y);
          doc.setFont("helvetica", "normal");
          doc.text(`${exp.startDate || ""} - ${exp.endDate || ""}`, pageWidth - margin - 80, y);
          y += 14;

          if (exp.description) {
            doc.setFont("helvetica", "normal");
            const splitDesc = doc.splitTextToSize(exp.description, pageWidth - margin * 2);
            doc.text(splitDesc, margin, y);
            y += splitDesc.length * 11;
          }
          y += 8;
        });
        y += 10;
      }

      // Skills
      if (cv.skills && cv.skills.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("TECHNICAL & PROFESSIONAL SKILLS", margin, y);
        y += 15;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const skillsText = cv.skills.join(", ");
        const splitSkills = doc.splitTextToSize(skillsText, pageWidth - margin * 2);
        doc.text(splitSkills, margin, y);
        y += splitSkills.length * 12 + 15;
      }

      const fileName = `${(cv.fullName || "Student").replace(/\s+/g, "_")}_CV.pdf`;
      doc.save(fileName);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      // Fallback to window.print()
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton message="Loading CV preview..." count={3} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Header (Hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-charcoal-700/60">
        <Link
          href="/cv"
          className="inline-flex items-center gap-2 text-sm font-medium text-charcoal-400 hover:text-charcoal-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to CV Editor
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/cv">
            <Button variant="outline" size="sm" icon={<Edit className="w-4 h-4" />}>
              Edit CV
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleJsPdfDownload}
            isLoading={isGeneratingPdf}
          >
            Download PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrintDownload}
          >
            Print
          </Button>
        </div>
      </div>

      {/* Printable Resume Canvas */}
      <div
        ref={cvRef}
        className="bg-white border border-slate-200 shadow-md rounded-xl p-8 sm:p-12 text-slate-900 font-sans print:shadow-none print:border-none print:p-0"
      >
        {/* Header */}
        <div className="text-center pb-6 border-b border-slate-200 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            {cv?.fullName || "Student Name"}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
            {cv?.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {cv.email}
              </span>
            )}
            {cv?.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {cv.phone}
              </span>
            )}
            {cv?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {cv.location}
              </span>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {cv?.summary && (
          <div className="py-5 border-b border-slate-100">
            <h2 className="text-xs font-bold text-indigo-700 tracking-wider uppercase mb-2">
              Professional Summary
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {cv.summary}
            </p>
          </div>
        )}

        {/* Education */}
        {cv?.education && cv.education.length > 0 && (
          <div className="py-5 border-b border-slate-100 space-y-4">
            <h2 className="text-xs font-bold text-indigo-700 tracking-wider uppercase">
              Education
            </h2>
            <div className="space-y-3">
              {cv.education.map((edu: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-sm text-slate-900">{edu.institution}</h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{edu.qualification}</p>
                  {edu.description && (
                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {cv?.experience && cv.experience.length > 0 && (
          <div className="py-5 border-b border-slate-100 space-y-4">
            <h2 className="text-xs font-bold text-indigo-700 tracking-wider uppercase">
              Work Experience
            </h2>
            <div className="space-y-4">
              {cv.experience.map((exp: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-sm text-slate-900">
                      {exp.position} — <span className="font-normal text-slate-700">{exp.company}</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {cv?.projects && cv.projects.length > 0 && (
          <div className="py-5 border-b border-slate-100 space-y-4">
            <h2 className="text-xs font-bold text-indigo-700 tracking-wider uppercase">
              Key Projects
            </h2>
            <div className="space-y-3">
              {cv.projects.map((proj: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-sm text-slate-900">
                      {proj.title}
                      {proj.technologies && (
                        <span className="text-xs font-normal text-slate-500 ml-2">
                          ({proj.technologies})
                        </span>
                      )}
                    </h3>
                    {proj.link && (
                      <span className="text-xs text-indigo-600 truncate max-w-xs">{proj.link}</span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {cv?.skills && cv.skills.length > 0 && (
          <div className="py-5 border-b border-slate-100">
            <h2 className="text-xs font-bold text-indigo-700 tracking-wider uppercase mb-2">
              Skills
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">
              {cv.skills.join(" • ")}
            </p>
          </div>
        )}

        {/* Certifications */}
        {cv?.certifications && cv.certifications.length > 0 && (
          <div className="py-5 border-b border-slate-100">
            <h2 className="text-xs font-bold text-indigo-700 tracking-wider uppercase mb-2">
              Certifications
            </h2>
            <div className="space-y-1">
              {cv.certifications.map((cert: any, i: number) => (
                <div key={i} className="flex justify-between text-xs text-slate-700">
                  <span className="font-medium">{cert.name} — {cert.issuer}</span>
                  <span className="text-slate-400">{cert.issueDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {cv?.interests && cv.interests.length > 0 && (
          <div className="pt-5">
            <h2 className="text-xs font-bold text-indigo-700 tracking-wider uppercase mb-1">
              Interests & Extracurriculars
            </h2>
            <p className="text-xs text-slate-600">
              {cv.interests.join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
