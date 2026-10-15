"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Save,
  Eye,
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  FolderGit2,
  Heart,
  User,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function CVBuilderPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");

  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [certifications, setCertifications] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchCV();
    }
  }, [user, authLoading]);

  const fetchCV = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ success: boolean; cv: any }>("/cv");
      if (res.success && res.cv) {
        const c = res.cv;
        setFullName(c.fullName || user?.fullName || "");
        setEmail(c.email || user?.email || "");
        setPhone(c.phone || "");
        setLocation(c.location || "");
        setSummary(c.summary || "");
        setEducation(c.education || []);
        setExperience(c.experience || []);
        setSkills(c.skills || []);
        setCertifications(c.certifications || []);
        setProjects(c.projects || []);
        setInterests(c.interests || []);
      }
    } catch (e) {
      console.warn("Could not load CV, using defaults.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (redirectOnSave: boolean = false) => {
    try {
      setIsSaving(true);
      setSavedSuccess(false);

      await apiRequest("/cv", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email,
          phone,
          location,
          summary,
          education,
          experience,
          skills,
          certifications,
          projects,
          interests,
        }),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);

      if (redirectOnSave) {
        router.push("/cv/preview");
      }
    } catch (err: any) {
      alert("Failed to save CV: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Education Helpers
  const addEducation = () => {
    setEducation([
      ...education,
      { institution: "", qualification: "", startDate: "", endDate: "", description: "" },
    ]);
  };
  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };
  const updateEducation = (index: number, field: string, val: string) => {
    const next = [...education];
    next[index][field] = val;
    setEducation(next);
  };

  // Experience Helpers
  const addExperience = () => {
    setExperience([
      ...experience,
      { company: "", position: "", startDate: "", endDate: "", description: "" },
    ]);
  };
  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };
  const updateExperience = (index: number, field: string, val: string) => {
    const next = [...experience];
    next[index][field] = val;
    setExperience(next);
  };

  // Project Helpers
  const addProject = () => {
    setProjects([
      ...projects,
      { title: "", role: "", technologies: "", description: "", link: "" },
    ]);
  };
  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };
  const updateProject = (index: number, field: string, val: string) => {
    const next = [...projects];
    next[index][field] = val;
    setProjects(next);
  };

  // Certifications Helpers
  const addCertification = () => {
    setCertifications([
      ...certifications,
      { name: "", issuer: "", issueDate: "" },
    ]);
  };
  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };
  const updateCertification = (index: number, field: string, val: string) => {
    const next = [...certifications];
    next[index][field] = val;
    setCertifications(next);
  };

  // Skills Helpers
  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };
  const removeSkill = (sk: string) => {
    setSkills(skills.filter((s) => s !== sk));
  };

  // Interests Helpers
  const addInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };
  const removeInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  if (loading) {
    return <LoadingSkeleton message="Loading CV builder..." count={4} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Sticky top action header */}
      <div className="sticky top-0 z-20 bg-charcoal-950/95 backdrop-blur-xs py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-charcoal-700/60">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-100 tracking-tight">CV Builder</h1>
          <p className="text-sm text-charcoal-400">
            Design your professional student CV with structured manual entries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            Save & Preview
          </Button>
          <Button
            variant="primary"
            icon={savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            onClick={() => handleSave(false)}
            isLoading={isSaving}
          >
            {savedSuccess ? "Saved!" : "Save CV"}
          </Button>
        </div>
      </div>

      {/* 1. Personal Information */}
      <Card>
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-charcoal-700/60">
          <User className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-charcoal-100">Personal Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+27 71 234 5678"
          />
          <Input
            label="Location / City"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Johannesburg, South Africa"
          />
        </div>
      </Card>

      {/* 2. Professional Summary */}
      <Card>
        <div className="pb-3 mb-4 border-b border-charcoal-700/60">
          <h2 className="text-base font-semibold text-charcoal-100">Professional Summary</h2>
          <p className="text-xs text-charcoal-400 mt-0.5">
            A concise 2-4 sentence introduction highlighting your studies, focus, and career goals.
          </p>
        </div>
        <textarea
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="e.g. Second-year Computer Science student at University of the Witwatersrand with strong foundations in full-stack web technologies, searching for a 2025 Summer Internship..."
          className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-charcoal-100 placeholder-charcoal-500 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-charcoal-600"
        />
      </Card>

      {/* 3. Education */}
      <Card>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-charcoal-700/60">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-charcoal-100">Education</h2>
          </div>
          <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={addEducation}>
            Add Education
          </Button>
        </div>

        {education.length === 0 ? (
          <p className="text-xs text-charcoal-400 italic py-2">No education entries added yet.</p>
        ) : (
          <div className="space-y-4">
            {education.map((edu, idx) => (
              <div key={idx} className="p-4 bg-charcoal-900/60 rounded-xl border border-charcoal-700/80 relative space-y-3">
                <button
                  type="button"
                  onClick={() => removeEducation(idx)}
                  className="absolute top-3 right-3 text-charcoal-400 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <Input
                    label="Institution / University"
                    placeholder="e.g. University of Cape Town"
                    value={edu.institution}
                    onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                  />
                  <Input
                    label="Qualification / Degree"
                    placeholder="e.g. BSc Computer Science (Expected Distinction)"
                    value={edu.qualification}
                    onChange={(e) => updateEducation(idx, "qualification", e.target.value)}
                  />
                  <Input
                    label="Start Year"
                    placeholder="e.g. 2022"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(idx, "startDate", e.target.value)}
                  />
                  <Input
                    label="End Year / Expected"
                    placeholder="e.g. 2025"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(idx, "endDate", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-300 mb-1">
                    Relevant Coursework & Achievements
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Algorithms & Data Structures (86%), Database Systems (84%). Dean's Merit List."
                    value={edu.description}
                    onChange={(e) => updateEducation(idx, "description", e.target.value)}
                    className="w-full px-3 py-1.5 bg-charcoal-950 border border-charcoal-700 rounded-lg text-charcoal-100 placeholder-charcoal-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 4. Work Experience */}
      <Card>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-charcoal-700/60">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-charcoal-100">Work Experience</h2>
          </div>
          <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={addExperience}>
            Add Experience
          </Button>
        </div>

        {experience.length === 0 ? (
          <p className="text-xs text-charcoal-400 italic py-2">No work experience entries added yet.</p>
        ) : (
          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={idx} className="p-4 bg-charcoal-900/60 rounded-xl border border-charcoal-700/80 relative space-y-3">
                <button
                  type="button"
                  onClick={() => removeExperience(idx)}
                  className="absolute top-3 right-3 text-charcoal-400 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <Input
                    label="Company / Organization"
                    placeholder="e.g. Standard Bank Group"
                    value={exp.company}
                    onChange={(e) => updateExperience(idx, "company", e.target.value)}
                  />
                  <Input
                    label="Position / Role"
                    placeholder="e.g. Junior Software Engineering Intern"
                    value={exp.position}
                    onChange={(e) => updateExperience(idx, "position", e.target.value)}
                  />
                  <Input
                    label="Start Date"
                    placeholder="e.g. Jun 2024"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                  />
                  <Input
                    label="End Date"
                    placeholder="e.g. Aug 2024 or Present"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-300 mb-1">
                    Key Responsibilities & Impact
                  </label>
                  <textarea
                    rows={3}
                    placeholder="• Built REST API endpoints in Express serving 5,000+ daily requests.&#10;• Collaborated with senior engineers using Git feature branches and code reviews."
                    value={exp.description}
                    onChange={(e) => updateExperience(idx, "description", e.target.value)}
                    className="w-full px-3 py-1.5 bg-charcoal-950 border border-charcoal-700 rounded-lg text-charcoal-100 placeholder-charcoal-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 5. Skills */}
      <Card>
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-charcoal-700/60">
          <Code className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-charcoal-100">Skills</h2>
        </div>

        <form onSubmit={addSkill} className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Add skill (e.g. TypeScript, React, PostgreSQL, Docker)..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-charcoal-900 border border-charcoal-700 rounded-lg text-sm text-charcoal-100 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-charcoal-600"
          />
          <Button type="submit" variant="secondary" size="sm">
            Add
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {skills.map((sk) => (
            <span
              key={sk}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/15 text-indigo-300 rounded-full text-xs font-medium border border-indigo-500/30"
            >
              {sk}
              <button
                type="button"
                onClick={() => removeSkill(sk)}
                className="hover:text-rose-400 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
          {skills.length === 0 && (
            <p className="text-xs text-charcoal-400 italic">No skills listed yet.</p>
          )}
        </div>
      </Card>

      {/* 6. Projects */}
      <Card>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-charcoal-700/60">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-charcoal-100">Projects</h2>
          </div>
          <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={addProject}>
            Add Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <p className="text-xs text-charcoal-400 italic py-2">No projects added yet.</p>
        ) : (
          <div className="space-y-4">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-4 bg-charcoal-900/60 rounded-xl border border-charcoal-700/80 relative space-y-3">
                <button
                  type="button"
                  onClick={() => removeProject(idx)}
                  className="absolute top-3 right-3 text-charcoal-400 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <Input
                    label="Project Title"
                    placeholder="e.g. Distributed Task Scheduler"
                    value={proj.title}
                    onChange={(e) => updateProject(idx, "title", e.target.value)}
                  />
                  <Input
                    label="Tech Stack"
                    placeholder="e.g. Next.js, Node.js, PostgreSQL"
                    value={proj.technologies}
                    onChange={(e) => updateProject(idx, "technologies", e.target.value)}
                  />
                </div>
                <Input
                  label="Project URL / GitHub"
                  placeholder="https://github.com/..."
                  value={proj.link}
                  onChange={(e) => updateProject(idx, "link", e.target.value)}
                />
                <div>
                  <label className="block text-xs font-medium text-charcoal-300 mb-1">
                    Project Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe problem solved, technical challenges, and results..."
                    value={proj.description}
                    onChange={(e) => updateProject(idx, "description", e.target.value)}
                    className="w-full px-3 py-1.5 bg-charcoal-950 border border-charcoal-700 rounded-lg text-charcoal-100 placeholder-charcoal-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 7. Certifications */}
      <Card>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-charcoal-700/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-charcoal-100">Certifications</h2>
          </div>
          <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={addCertification}>
            Add Certification
          </Button>
        </div>

        {certifications.length === 0 ? (
          <p className="text-xs text-charcoal-400 italic py-2">No certifications added yet.</p>
        ) : (
          <div className="space-y-3">
            {certifications.map((cert, idx) => (
              <div key={idx} className="p-3 bg-charcoal-900/60 rounded-lg border border-charcoal-700/80 flex items-center justify-between gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                  <Input
                    placeholder="Certification Name (e.g. AWS Cloud Practitioner)"
                    value={cert.name}
                    onChange={(e) => updateCertification(idx, "name", e.target.value)}
                  />
                  <Input
                    placeholder="Issuer (e.g. Amazon Web Services)"
                    value={cert.issuer}
                    onChange={(e) => updateCertification(idx, "issuer", e.target.value)}
                  />
                  <Input
                    placeholder="Issue Date (e.g. 2024)"
                    value={cert.issueDate}
                    onChange={(e) => updateCertification(idx, "issueDate", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCertification(idx)}
                  className="text-charcoal-400 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 8. Interests */}
      <Card>
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-charcoal-700/60">
          <Heart className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-charcoal-100">Interests</h2>
        </div>

        <form onSubmit={addInterest} className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Add interest (e.g. Open Source, Hackathons, Robotics, Chess)..."
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-charcoal-900 border border-charcoal-700 rounded-lg text-sm text-charcoal-100 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-charcoal-600"
          />
          <Button type="submit" variant="secondary" size="sm">
            Add
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {interests.map((it) => (
            <span
              key={it}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-charcoal-800 text-charcoal-200 rounded-full text-xs font-medium border border-charcoal-700"
            >
              {it}
              <button
                type="button"
                onClick={() => removeInterest(it)}
                className="hover:text-rose-400 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
          {interests.length === 0 && (
            <p className="text-xs text-charcoal-400 italic">No interests listed yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
