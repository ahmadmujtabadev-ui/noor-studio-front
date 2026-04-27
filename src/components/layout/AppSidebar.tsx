import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, BookOpen, Library, FolderKanban, Globe,
  CreditCard, Settings, HelpCircle, Sparkles, ChevronLeft, ChevronRight,
  Plus, LogOut, Zap, Check,
  Layers, Wand2, ImageIcon, BookMarked, Rocket, PenLine,
  Moon, Feather, Frame, Brush, LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { Button } from "@/components/ui/button";
import { useUser, useCredits, useAuthStore } from "@/hooks/useAuth";
import { useBookBuilderNavStore } from "@/lib/store/bookBuilderNavStore";
import { useKbNavStore } from "@/lib/store/kbNavStore";
import { useUniverses } from "@/hooks/useUniverses";

const KB_WORKFLOWS = [
  { id: "faith",      label: "Faith & Language", icon: Moon,       firstSection: "islamicValues"      },
  { id: "story",      label: "Character Voice",  icon: Feather,    firstSection: "characterGuides"    },
  { id: "visual",     label: "Background",       icon: Brush,      firstSection: "backgroundSettings" },
  { id: "bookFormat", label: "Book Format",      icon: LayoutGrid, firstSection: "bookFormatting"     },
  { id: "cover",      label: "Cover Design",     icon: Frame,      firstSection: "coverDesign"        },
] as const;

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard",        href: "/app/dashboard" },
  { icon: Globe,           label: "Universes",        href: "/app/universes" },
  { icon: Users,           label: "Characters",       href: "/app/characters" },
  { icon: Library,         label: "Knowledge Base",   href: "/app/knowledge-base" },
  { icon: FolderKanban,    label: "Projects",         href: "/app/projects" },
];

const createNavItems = [
  { icon: Plus, label: "New Book", href: "/app/books/new" },
];

const bottomNavItems = [
  { icon: CreditCard, label: "Billing", href: "/app/billing" },
  { icon: Settings, label: "Settings", href: "/app/settings" },
  { icon: HelpCircle, label: "Help", href: "/app/help" },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  const user = useUser();
  const credits = useCredits();
  const logout = useAuthStore((s) => s.logout);
  const { universes } = useUniverses();
  const hasUniverse = universes.length > 0;
  const bookNav = useBookBuilderNavStore();
  const isOnBookBuilder = location.pathname.startsWith('/app/books');

  const kbNav = useKbNavStore();
  const isOnKB = location.pathname === '/app/knowledge-base';

  const layoutStep = bookNav.isChapterBook ? 5 : 4;
  const illStep    = bookNav.isChapterBook ? 6 : 5;
  const coverStep  = bookNav.isChapterBook ? 7 : 6;
  const exportStep = bookNav.isChapterBook ? 8 : 7;
  const BOOK_PHASES = [
    { step: 1,           label: "Story",          icon: BookOpen   },
    { step: 2,           label: "Structure",      icon: Layers     },
    { step: 3,           label: "Style",          icon: Wand2      },
    ...(bookNav.isChapterBook ? [{ step: 4, label: "Writing", icon: PenLine }] : []),
    { step: layoutStep,  label: "Layout",         icon: LayoutGrid },
    { step: illStep,     label: "Illustrations",  icon: ImageIcon  },
    { step: coverStep,   label: "Cover",          icon: BookMarked },
    { step: exportStep,  label: "Publish",        icon: Rocket     },
  ];

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const isLowCredits = credits < 10;

  const NavLink = ({
    item,
    highlight = false,
  }: {
    item: { icon: typeof LayoutDashboard; label: string; href: string };
    highlight?: boolean;
  }) => {
    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
          isRTL && "flex-row-reverse",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold"
            : highlight
            ? "bg-sidebar-accent/50 text-sidebar-foreground hover:bg-sidebar-accent"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <item.icon className={cn("w-5 h-5 shrink-0", collapsed && "mx-auto")} />
        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "fixed top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-40",
        isRTL ? "right-0 border-l border-sidebar-border" : "left-0 border-r border-sidebar-border",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("h-16 flex items-center justify-between px-4 border-b border-sidebar-border", isRTL && "flex-row-reverse")}>
        <Link to="/" className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">
              Noor<span className="text-sidebar-primary">Studio</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground"
        >
          {collapsed
            ? isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            : isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Credits Display */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          <Link
            to="/app/billing"
            className={cn(
              "flex items-center justify-between p-2.5 rounded-lg transition-colors",
              "bg-sidebar-accent hover:bg-sidebar-accent/80"
            )}
          >
            <div className="flex items-center gap-2">
              <Zap className={cn("w-4 h-4", isLowCredits ? "text-destructive" : "text-sidebar-primary")} />
              <span className="text-sm font-medium text-sidebar-foreground">Credits</span>
            </div>
            <span className={cn("text-sm font-bold", isLowCredits ? "text-destructive" : "text-sidebar-foreground")}>
              {credits}
            </span>
          </Link>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <div key={item.href}>
              <NavLink item={item} />

              {/* Knowledge Base workflow sub-nav */}
              {item.href === "/app/knowledge-base" && isOnKB && !collapsed && (
                <div className="mt-1.5 ml-4 space-y-0.5 pb-1">
                  {KB_WORKFLOWS.map((wf) => {
                    const isActive = kbNav.activeWorkflow === wf.id;
                    const isDone = kbNav.completedWorkflows.has(wf.id);
                    const Icon = wf.icon;
                    return (
                      <button
                        key={wf.id}
                        onClick={() => kbNav.setKbNav(wf.id, wf.firstSection)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 text-left",
                          isActive
                            ? "bg-[#F5A623]/15 text-[#F5A623] font-semibold"
                            : "text-white/45 hover:text-white/80 hover:bg-white/6"
                        )}
                      >
                        <Icon className={cn(
                          "w-3.5 h-3.5 shrink-0 transition-colors",
                          isActive ? "text-[#F5A623]" : "text-white/35"
                        )} />
                        <span className="truncate tracking-wide">{wf.label}</span>
                        <span className={cn(
                          "ml-auto w-2 h-2 rounded-full shrink-0 transition-colors",
                          isActive ? "bg-[#F5A623] animate-pulse" : isDone ? "bg-emerald-400/80" : "bg-white/15"
                        )} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="mt-6">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Create
            </p>
          )}
          <nav className="space-y-1">
            {createNavItems.map((item) =>
              item.href === "/app/books/new" && !hasUniverse ? (
                <div
                  key={item.href}
                  title="Create a Universe first to unlock book creation"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl opacity-40 cursor-not-allowed",
                    "bg-sidebar-accent/50 text-sidebar-foreground/60",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 shrink-0", collapsed && "mx-auto")} />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </div>
              ) : (
                <NavLink key={item.href} item={item} highlight />
              )
            )}
            {!collapsed && !hasUniverse && (
              <p className="px-3 mt-1 text-[10px] text-amber-400/70 leading-snug">
                Create a Universe first
              </p>
            )}
          </nav>

          {/* Book builder phase sub-nav */}
          {isOnBookBuilder && !collapsed && (
            <div className="mt-1 ml-3 pl-3 border-l-2 border-primary/25 space-y-0.5">
              {BOOK_PHASES.map((phase) => {
                const isDone   = bookNav.completedSteps.includes(phase.step);
                const isActive = bookNav.step === phase.step;
                return (
                  <div
                    key={phase.step}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-all",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : isDone
                        ? "text-emerald-500 dark:text-emerald-400"
                        : "text-sidebar-foreground/40"
                    )}
                  >
                    <phase.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1 truncate">{phase.label}</span>
                    {isDone  && <Check className="w-3 h-3 shrink-0 text-emerald-500" />}
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="py-4 px-3 border-t border-sidebar-border">
        <nav className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
      </div>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent",
            collapsed && "justify-center",
            isRTL && "flex-row-reverse"
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-semibold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate capitalize">
                  {user?.plan || "free"} Plan
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-sidebar-border transition-colors text-sidebar-foreground/60 hover:text-destructive"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
