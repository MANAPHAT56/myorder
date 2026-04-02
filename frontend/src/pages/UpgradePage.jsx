import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { COOLDOWN_DAYS } from "../utils/helpers";

const WIZARD_STEPS = ["ตรวจสอบ", "อัปโหลด", "ยืนยัน"];

export default function UpgradePage({ user, notify }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [checks, setChecks] = useState({
    eligible: null,
    failed_count: 0,
    days_remaining: 0,
  });
  const [files, setFiles] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [entityType, setEntityType] = useState("individual");
  const fileRefs = useRef({});

  if (!user) {
    return (
      <div className="page">
        <div
          className="section"
          style={{ paddingTop: 40, textAlign: "center" }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h2
            style={{
              fontFamily: "var(--display)",
              fontSize: 20,
              marginBottom: 12,
            }}
          >
            ไม่มีสิทธิ์เข้าถึงหน้านี้
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/")}
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  const runChecks = async () => {
    try {
      const result = await api.checkUpgradeEligibility();
      setChecks(result);
      const shopData = await api.getMyShop();
      const data = shopData.data ? shopData.data : shopData;
      setEntityType(data.is_company ? "company" : "individual");
    } catch (e) {
      setChecks({
        eligible: false,
        failed_count: 0,
        days_remaining: 0,
        error: e.message,
      });
    }
  };

  useEffect(() => {
    if (step === 0) runChecks();
  }, [step]);

  const getRequiredDocs = () =>
    entityType === "individual"
      ? [
          {
            key: "id_card",
            label: "สำเนาบัตรประชาชน",
            hint: "ถ่ายภาพให้ชัด ครบ 4 มุม",
          },
          {
            key: "selfie_id",
            label: "รูปถ่ายคู่บัตรประชาชน",
            hint: "ถือบัตร ถ่ายให้เห็นหน้าและบัตร",
          },
        ]
      : [
          {
            key: "vat",
            label: "ภพ.20",
            hint: "เอกสารจากกรมสรรพากร",
          },
          {
            key: "dir_id",
            label: "บัตรประชาชนกรรมการ",
            hint: "สำเนาพร้อมเซ็นรับรอง",
          },
          {
            key: "selfie_dir",
            label: "รูปถ่ายกรรมการคู่บัตร",
            hint: "กรรมการถือบัตร ถ่ายให้ชัด",
          },
        ];

  const handleFileChange = (key, file) =>
    setFiles((p) => ({ ...p, [key]: file }));
  const allFilesUploaded = getRequiredDocs().every((d) => files[d.key]);

  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      Object.entries(files).forEach(([key, file], idx) => {
        fd.append(`files[${idx}]`, file);
        fd.append(`labels[${idx}]`, key);
      });
      await api.submitUpgrade(fd);
      setSubmitted(true);
      notify("ส่งคำขอเรียบร้อยแล้ว รอแอดมินตรวจสอบ", "success");
    } catch (e) {
      notify("ส่งคำขอไม่สำเร็จ: " + e.message, "error");
    }
  };

  return (
    <div className="page">
      <div className="section" style={{ paddingTop: 28, maxWidth: 680 }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 20 }}
          onClick={() => navigate("/myshop")}
        >
          ← กลับ
        </button>

        {submitted ? (
          <div
            className="dash-card"
            style={{ textAlign: "center", padding: 48 }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2
              style={{
                fontFamily: "var(--display)",
                fontSize: 22,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              ส่งคำขอเรียบร้อยแล้ว!
            </h2>
            <p
              style={{
                color: "var(--text2)",
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              ทีมแอดมินจะตรวจสอบและแจ้งผลภายใน 1–3 วันทำการ
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/myshop")}
            >
              กลับหน้าร้านค้า
            </button>
          </div>
        ) : (
          <>
            <h2
              style={{
                fontFamily: "var(--display)",
                fontSize: 22,
                fontWeight: 600,
                marginBottom: 28,
              }}
            >
              ยื่นขอเลื่อนขั้น 1 → 2
            </h2>

            {/* Wizard steps */}
            <div className="wizard-steps">
              {WIZARD_STEPS.map((s, i) => (
                <div className="wizard-step" key={s}>
                  <div
                    className={`step-circle ${
                      i < step ? "done" : i === step ? "active" : ""
                    }`}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <div
                    className={`step-label ${
                      i < step ? "done" : i === step ? "active" : ""
                    }`}
                  >
                    {s}
                  </div>
                </div>
              ))}
            </div>

            {/* Step 0: Eligibility check */}
            {step === 0 && (
              <div className="dash-card">
                <div className="dash-card-title">ตรวจสอบคุณสมบัติ</div>
                <div className="dash-card-sub">
                  ระบบกำลังตรวจสอบสิทธิ์ก่อนดำเนินการ
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 24,
                  }}
                >
                  {checks.eligible === null && (
                    <div className="alert alert-info">
                      ⏳ กำลังตรวจสอบ...
                    </div>
                  )}
                  {checks.eligible === false && (
                    <div className="alert alert-error">
                      <div>
                        <div
                          style={{ fontWeight: 700, marginBottom: 6 }}
                        >
                          ✕ ไม่สามารถยื่นขอได้ในขณะนี้
                        </div>
                        <div
                          style={{ fontSize: 13, lineHeight: 1.7 }}
                        >
                          {checks.days_remaining > 0 ? (
                            <>
                              ต้องรออีก{" "}
                              <strong>
                                {checks.days_remaining} วัน
                              </strong>{" "}
                              ก่อนยื่นใหม่ได้
                            </>
                          ) : (
                            checks.error || "กรุณาติดต่อทีมงาน"
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {checks.eligible === true &&
                    checks.failed_count > 0 &&
                    !checks.was_reset && (
                      <>
                        <div className="alert alert-success">
                          ✓ สามารถยื่นขอเลื่อนขั้นได้
                        </div>
                        <div className="alert alert-warn">
                          <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                            ⚠️ ขอเลื่อนขั้นไม่ผ่านมาแล้ว{" "}
                            <strong>
                              {checks.failed_count} / 3 ครั้ง
                            </strong>
                            <br />
                            หากไม่ผ่านอีก{" "}
                            <strong>
                              {3 - checks.failed_count} ครั้ง
                            </strong>{" "}
                            จะต้องรอ {COOLDOWN_DAYS} วัน
                          </div>
                        </div>
                      </>
                    )}
                  {checks.eligible === true &&
                    checks.failed_count === 0 &&
                    !checks.was_reset && (
                      <div className="alert alert-success">
                        ✓ สามารถยื่นขอเลื่อนขั้นได้
                      </div>
                    )}
                  {checks.eligible === true && checks.was_reset && (
                    <>
                      <div className="alert alert-success">
                        ✓ ครบกำหนดแล้ว สามารถยื่นขอได้อีกครั้ง
                      </div>
                      <div
                        className="alert alert-info"
                        style={{ fontSize: 13 }}
                      >
                        💡 จำนวนครั้งที่ไม่ผ่านถูก reset เป็น 0 แล้ว
                      </div>
                    </>
                  )}
                </div>
                {checks.eligible !== null && (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigate("/myshop")}
                    >
                      ยกเลิก
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={!checks.eligible}
                      onClick={() => setStep(1)}
                    >
                      ถัดไป →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Upload docs */}
            {step === 1 && (
              <div className="dash-card">
                <div className="dash-card-title">ยื่นเอกสาร</div>
                <div className="dash-card-sub">
                  กรุณาอัปโหลดเอกสารให้ครบถ้วน
                </div>
                <div
                  className="alert alert-info"
                  style={{ marginBottom: 20 }}
                >
                  💡 เอกสารควรถ่ายให้ชัดเจน ตัวอักษรอ่านออก
                </div>
                {getRequiredDocs().map((doc) => (
                  <div key={doc.key} className="form-group">
                    <label className="form-label">{doc.label} *</label>
                    <div
                      className={`upload-zone ${
                        files[doc.key] ? "filled" : ""
                      }`}
                      onClick={() => {
                        if (!fileRefs.current[doc.key])
                          fileRefs.current[doc.key] =
                            document.createElement("input");
                        fileRefs.current[doc.key].type = "file";
                        fileRefs.current[doc.key].accept =
                          "image/*,.pdf";
                        fileRefs.current[doc.key].onchange = (e) =>
                          handleFileChange(
                            doc.key,
                            e.target.files[0]
                          );
                        fileRefs.current[doc.key].click();
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8 }}>
                        {files[doc.key] ? "✅" : "📄"}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--text2)",
                        }}
                      >
                        {files[doc.key]
                          ? files[doc.key].name
                          : "คลิกเพื่ออัปโหลด"}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text3)",
                          marginTop: 4,
                        }}
                      >
                        {doc.hint}
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setStep(0)}
                  >
                    ← ย้อนกลับ
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={!allFilesUploaded}
                    onClick={() => setStep(2)}
                  >
                    ถัดไป →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Confirm */}
            {step === 2 && (
              <div className="dash-card">
                <div className="dash-card-title">ยืนยันการส่งคำขอ</div>
                <div style={{ marginBottom: 20 }}>
                  {Object.values(files).map((f) => (
                    <div
                      key={f.name}
                      style={{
                        fontSize: 13,
                        color: "var(--green)",
                        padding: "4px 0",
                      }}
                    >
                      ✓ {f.name}
                    </div>
                  ))}
                </div>
                <div
                  className="alert alert-warn"
                  style={{ marginBottom: 20 }}
                >
                  ⚠️ เมื่อส่งแล้วจะไม่สามารถแก้ไขเอกสารได้
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setStep(1)}
                  >
                    ← ย้อนกลับ
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    📩 ส่งคำขอ
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
