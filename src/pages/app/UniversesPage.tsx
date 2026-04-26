import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Globe, Users, BookOpen, Loader2, Info } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUniverses } from "@/hooks/useUniverses";

export default function UniversesPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { universes, loading, error } = useUniverses();

  const filteredUniverses = universes.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.description?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <AppLayout
      title="Universes"
      subtitle="Manage your story universes and series"
      actions={
        <Button variant="hero" onClick={() => navigate('/app/universes/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Universe
        </Button>
      }
    >
      {/* Universe concept explainer — T-12 */}
      {!loading && !error && universes.length === 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-foreground/80">
            A <strong>Universe</strong> is your series world — the shared setting, tone, and values that keep every book consistent. Create one Universe per series, then add characters, a Knowledge Base (Book DNA), and generate books inside it.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search universes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniverses.map((universe) => (
              <Link
                key={universe.id}
                to={`/app/universes/${universe.id}`}
                className="card-glow p-6 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{universe.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{universe.description}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{universe.characterCount ?? 0} characters</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>{universe.bookCount ?? 0} books</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredUniverses.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {search ? "No universes match your search." : "No universes yet."}
              </p>
              {!search && (
                <Button variant="hero" onClick={() => navigate('/app/universes/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Universe
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
