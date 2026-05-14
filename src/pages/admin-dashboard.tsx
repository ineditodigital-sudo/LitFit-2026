import { useState } from "react";
import { 
  Package, 
  LogOut, 
  LayoutDashboard, 
  ShoppingBag, 
  Tags,
  Menu,
  Settings
} from "lucide-react";
import { AdminShipping } from "./admin-shipping";
import { AdminProducts } from "./admin-products";
import { AdminOrders } from "./admin-orders";
import { AdminSettings } from "./admin-settings";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from "../components/ui/sheet";

interface AdminDashboardProps {
  onLogout: () => void;
  adminToken: string;
}

type AdminTab = "shipping" | "orders" | "products" | "settings";

export function AdminDashboard({ onLogout, adminToken }: AdminDashboardProps) {
  const [currentTab, setCurrentTab] = useState<AdminTab>("orders");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: "orders", label: "Pedidos", icon: ShoppingBag },
    { id: "shipping", label: "Envíos (EI)", icon: Package },
    { id: "products", label: "Productos", icon: Tags },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  const NavButton = ({ id, label, icon: Icon, mobile = false }: { id: AdminTab, label: string, icon: any, mobile?: boolean, key?: any }) => (
    <button 
      onClick={() => {
        setCurrentTab(id);
        if (mobile) setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
        currentTab === id 
        ? "bg-[#0F172A] text-white shadow-xl shadow-slate-200" 
        : "text-[#64748B] hover:bg-slate-50 font-bold"
      }`}
    >
       <Icon className={`w-4 h-4 ${currentTab === id ? "text-[#00AAC7]" : ""}`} />
       <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#E2E8F0] p-6 hidden lg:flex flex-col z-40">
        <div className="flex items-center gap-2 mb-8 px-2">
           <div className="w-8 h-8 bg-[#EA580C] rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-orange-200">L</div>
           <span className="font-black text-sm uppercase tracking-tighter text-[#0F172A]">Litfit Central</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-4 px-2">Navegación</p>
          
          {navigationItems.map((item) => (
            <NavButton key={item.id} id={item.id as AdminTab} label={item.label} icon={item.icon} />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-black text-[11px] uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"
          >
             <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-screen">
        <div className="mb-10 lg:hidden flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-3">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <Menu className="w-6 h-6 text-[#0F172A]" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-6 flex flex-col">
                  <SheetHeader className="mb-8 px-2 text-left">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-[#EA580C] rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-orange-200">L</div>
                       <SheetTitle className="font-black text-sm uppercase tracking-tighter text-[#0F172A]">Litfit Central</SheetTitle>
                    </div>
                  </SheetHeader>
                  
                  <nav className="space-y-2 flex-1">
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-4 px-2">Navegación</p>
                    {navigationItems.map((item) => (
                      <NavButton key={item.id} id={item.id as AdminTab} label={item.label} icon={item.icon} mobile />
                    ))}
                  </nav>

                  <div className="mt-auto pt-6 border-t border-gray-100">
                    <button 
                      onClick={onLogout} 
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-black text-[11px] uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"
                    >
                       <LogOut className="w-4 h-4" /> Salir
                    </button>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#EA580C] rounded-lg flex items-center justify-center text-white font-black text-xs">L</div>
                <span className="font-black text-sm uppercase text-[#0F172A]">Litfit Central</span>
              </div>
           </div>
           <button onClick={onLogout} className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
             <LogOut className="w-5 h-5"/>
           </button>
        </div>

        <div className="bg-white/40 backdrop-blur-sm p-2 rounded-[40px]">
           <div className="bg-white border-2 border-slate-100 rounded-[36px] min-h-[80vh] p-6 md:p-10">
              {currentTab === "shipping" && <AdminShipping adminToken={adminToken} />}
              {currentTab === "orders" && <AdminOrders adminToken={adminToken} />}
              {currentTab === "products" && <AdminProducts adminToken={adminToken} />}
              {currentTab === "settings" && <AdminSettings adminToken={adminToken} />}
           </div>
        </div>
      </main>
    </div>
  );
}

