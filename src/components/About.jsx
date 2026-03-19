import React from "react";

export default function AboutPage({ onNavigate }) {
  return (
    <div style={styles.container}>
      {/* 🟢 ปุ่มย้อนกลับ */}
      <div style={styles.navBar}>
        <button 
          style={styles.backBtn} 
          onClick={() => onNavigate && onNavigate("myshop")}
          onMouseOver={(e) => e.target.style.color = "#fff"}
          onMouseOut={(e) => e.target.style.color = "#a1a1aa"}
        >
          ← กลับหน้าหลัก
        </button>
      </div>

      <div style={styles.content}>
        {/* 🟢 Hero Section */}
        <div style={styles.heroSection}>
          <div style={styles.badge}>🛡️ myOrder Security</div>
          <h1 style={styles.title}>
            ระบบฐานข้อมูล <span style={styles.highlight}>Blacklist</span>
          </h1>
          <p style={styles.subtitle}>
            สร้างมาตรฐานใหม่ให้อีคอมเมิร์ซ ปกป้องร้านค้าและลูกค้าจากการฉ้อโกง 
            ด้วยระบบตรวจสอบและคัดกรองประวัติที่แม่นยำและเชื่อถือได้
          </p>
        </div>

        {/* 🟢 Features Grid */}
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.iconWrapper}>🔒</div>
            <h3 style={styles.cardTitle}>ความปลอดภัยสูงสุด</h3>
            <p style={styles.cardText}>
              ข้อมูลถูกจัดเก็บด้วยระบบเข้ารหัสขั้นสูง มั่นใจได้ว่าข้อมูลส่วนบุคคลและประวัติการทำธุรกรรมจะถูกเก็บรักษาอย่างปลอดภัย
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.iconWrapper}>⚡</div>
            <h3 style={styles.cardTitle}>อัปเดตแบบเรียลไทม์</h3>
            <p style={styles.cardText}>
              เมื่อมีการรายงานผู้กระทำผิด ระบบจะทำการตรวจสอบและอัปเดตสถานะ Blacklist ทันที เพื่อป้องกันความเสียหายที่อาจเกิดขึ้น
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.iconWrapper}>🤝</div>
            <h3 style={styles.cardTitle}>ชุมชนที่เชื่อถือได้</h3>
            <p style={styles.cardText}>
              เรามุ่งมั่นสร้างสังคมการซื้อขายออนไลน์ที่โปร่งใส ร้านค้าที่ผ่านการ Verified จะได้รับความไว้วางใจจากลูกค้ามากขึ้น
            </p>
          </div>
        </div>

        {/* 🟢 Stats / Info Section */}
        <div style={styles.infoBox}>
          <h2 style={styles.infoTitle}>เป้าหมายของเรา</h2>
          <p style={styles.infoText}>
            "บริษัท myOrder สร้างระบบนี้ขึ้นมาเพื่อเป็นศูนย์กลางในการตรวจสอบประวัติผู้ซื้อและผู้ขาย 
            ลดความเสี่ยงในการทำธุรกิจออนไลน์ และส่งเสริมให้เกิดการแข่งขันที่ยุติธรรม 
            เราเชื่อว่าความโปร่งใสคือรากฐานสำคัญของการเติบโตอย่างยั่งยืน"
          </p>
        </div>

        {/* 🟢 Footer & CTA */}
        <div style={styles.footer}>
          <p style={styles.footerText}>พบปัญหาการใช้งานหรือต้องการรายงานผู้กระทำผิด?</p>
          <button style={styles.primaryBtn} onClick={() => alert("เปิดหน้าติดต่อแอดมิน")}>
            ติดต่อทีมงาน myOrder
          </button>
        </div>
      </div>
    </div>
  );
}

// 🎨 Styles (Dark Theme)
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#09090b", // โทนดำลึกแบบ Zinc-950
    color: "#f4f4f5",
    fontFamily: "'Inter', 'Prompt', sans-serif",
    padding: "0 20px",
    overflowX: "hidden",
  },
  navBar: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "24px 0",
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#a1a1aa",
    fontSize: "14px",
    cursor: "pointer",
    transition: "color 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  content: {
    maxWidth: "800px",
    margin: "0 auto",
    paddingBottom: "80px",
  },
  heroSection: {
    textAlign: "center",
    padding: "60px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    color: "#38bdf8",
    padding: "6px 16px",
    borderRadius: "100px",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "24px",
    border: "1px solid rgba(56, 189, 248, 0.2)",
  },
  title: {
    fontSize: "42px",
    fontWeight: "800",
    margin: "0 0 16px 0",
    letterSpacing: "-0.5px",
    lineHeight: "1.2",
  },
  highlight: {
    background: "linear-gradient(to right, #38bdf8, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "16px",
    color: "#a1a1aa",
    maxWidth: "560px",
    lineHeight: "1.6",
    margin: "0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
    marginBottom: "48px",
  },
  card: {
    backgroundColor: "#18181b", // โทนเทาเข้ม
    border: "1px solid #27272a",
    borderRadius: "16px",
    padding: "32px 24px",
    transition: "transform 0.3s ease, boxShadow 0.3s ease",
    cursor: "default",
  },
  iconWrapper: {
    width: "48px",
    height: "48px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 12px 0",
    color: "#e4e4e7",
  },
  cardText: {
    fontSize: "14px",
    color: "#a1a1aa",
    lineHeight: "1.6",
    margin: "0",
  },
  infoBox: {
    backgroundColor: "rgba(56, 189, 248, 0.03)",
    border: "1px solid rgba(56, 189, 248, 0.1)",
    borderRadius: "16px",
    padding: "40px",
    textAlign: "center",
    marginBottom: "48px",
  },
  infoTitle: {
    fontSize: "20px",
    fontWeight: "700",
    margin: "0 0 16px 0",
    color: "#e4e4e7",
  },
  infoText: {
    fontSize: "15px",
    color: "#a1a1aa",
    lineHeight: "1.8",
    margin: "0",
    fontStyle: "italic",
  },
  footer: {
    textAlign: "center",
    paddingTop: "32px",
    borderTop: "1px solid #27272a",
  },
  footerText: {
    fontSize: "14px",
    color: "#a1a1aa",
    marginBottom: "20px",
  },
  primaryBtn: {
    backgroundColor: "#ffffff",
    color: "#09090b",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s ease, backgroundColor 0.2s ease",
  },
};