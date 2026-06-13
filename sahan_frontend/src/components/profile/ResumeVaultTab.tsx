import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileText, Mail, Loader2, Download, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { resumeApi } from "../../services/api";
import { HarvardCV } from "../resume/HarvardCV";
import { CoverLetterDocument } from "../resume/CoverLetterDocument";
import type { UserProfile, ResumeHistory } from "../../types";

function StatusBadge({ status }: { status: ResumeHistory["status"] }) {
  if (status === "completed")
    return <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700"><CheckCircle2 size={10} /> Completed</span>;
  if (status === "processing")
    return <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700"><Clock size={10} /> Processing</span>;
  return <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600"><XCircle size={10} /> Failed</span>;
}

interface Props {
  profile: UserProfile | null;
}

export function ResumeVaultTab({ profile }: Props) {
  const [resumes, setResumes] = useState<ResumeHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumeApi.list().then(setResumes).finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-[15px] text-slate-900">Generated Documents ({resumes.length})</h2>
          <p className="font-sans text-[12px] text-slate-400">Fetched from ResumeHistory model</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-slate-300" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-10">
            <FileText size={28} className="text-stone-200 mx-auto mb-3" />
            <p className="font-sans text-[13px] text-slate-400">No documents yet. Tailor your first resume.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between p-4 border border-stone-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] text-slate-900 truncate">{r.job_title || "Tailored Resume"}</p>
                  <p className="font-sans text-[12px] text-slate-400 mt-0.5">
                    {r.company_name || <span className="italic">General Application</span>} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <StatusBadge status={r.status} />
                  {r.status === "completed" && profile && (
                    <>
                      {/* CV download — cover_letter stripped so PDF contains only the resume */}
                      <PDFDownloadLink
                        document={
                          <HarvardCV
                            profile={profile}
                            tailored={{ ...r.tailored_data, cover_letter: "" }}
                            jobTitle={r.job_title}
                            companyName={r.company_name}
                          />
                        }
                        fileName={`${r.job_title?.replace(/\s/g, "_") || "Resume"}_CV.pdf`}
                      >
                        {({ loading: pdfLoading }) => (
                          <button
                            onClick={e => e.stopPropagation()}
                            className="font-sans text-[12px] font-semibold px-3 py-1.5 border border-stone-200 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-1.5"
                          >
                            {pdfLoading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />} CV
                          </button>
                        )}
                      </PDFDownloadLink>

                      {/* Cover letter download */}
                      {r.tailored_data?.cover_letter ? (
                        <PDFDownloadLink
                          document={
                            <CoverLetterDocument
                              profile={profile}
                              tailored={r.tailored_data}
                              jobTitle={r.job_title}
                              companyName={r.company_name}
                            />
                          }
                          fileName={`${r.job_title?.replace(/\s/g, "_") || "Cover_Letter"}_Letter.pdf`}
                        >
                          {({ loading: pdfLoading }) => (
                            <button
                              onClick={e => e.stopPropagation()}
                              className="font-sans text-[12px] font-semibold px-3 py-1.5 border border-stone-200 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-1.5"
                            >
                              {pdfLoading ? <Loader2 size={11} className="animate-spin" /> : <Mail size={11} />} Letter
                            </button>
                          )}
                        </PDFDownloadLink>
                      ) : (
                        <button
                          disabled
                          onClick={e => e.stopPropagation()}
                          className="font-sans text-[12px] font-semibold px-3 py-1.5 border border-stone-100 rounded-lg text-slate-300 flex items-center gap-1.5 cursor-not-allowed"
                          title="No cover letter generated for this entry"
                        >
                          <Mail size={11} /> Letter
                        </button>
                      )}
                    </>
                  )}
                  {r.status === "failed" && (
                    <button className="font-sans text-[12px] font-semibold px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 flex items-center gap-1.5">
                      <RefreshCw size={11} /> Retry
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
