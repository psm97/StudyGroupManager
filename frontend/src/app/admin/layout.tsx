import AdminSidebar from "./_components/AdminSidebar";
import AdminTopbar from "./_components/AdminTopbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout" style={{display:"flex", minHeight:"100vh", background:"#f1f5f9"}}>
      <AdminSidebar />
      <div className="admin-main" style={{flex:1, marginLeft:256, display:"flex", flexDirection:"column", minWidth:0}}>
        <AdminTopbar />
        <main style={{flex:1, padding:"20px 24px"}}>
          {children}
        </main>
      </div>
      <style>{`
        @media (max-width: 1024px) { .admin-main { margin-left: 0 !important; } }
        * { font-family: 'Pretendard', -apple-system, sans-serif; box-sizing: border-box; }
      `}</style>
    </div>
  );
}
