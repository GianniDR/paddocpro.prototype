"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { HorseIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setSession } from "@/lib/auth/current";
import { MOCK_DATASET } from "@/lib/mock/seed";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("sarah.mitchell@riverbend.paddocpro.test");
  const [password, setPassword] = useState("demo");
  const [tenantId, setTenantId] = useState(MOCK_DATASET.tenants[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Mock auth — find a yard manager for the chosen tenant.
    const tenant = MOCK_DATASET.tenants.find((t) => t.id === tenantId);
    const manager = MOCK_DATASET.users.find((u) => u.tenantId === tenantId && u.role === "yard_manager");
    if (!tenant || !manager) {
      toast.error("Yard not found");
      setSubmitting(false);
      return;
    }
    setSession({ userId: manager.id, tenantId: tenant.id, role: "yard_manager" });
    toast.success(`Welcome back, ${manager.firstName}`);
    setTimeout(() => router.push("/dashboard"), 200);
  }

  return (
    <main className="min-h-svh flex items-center justify-center bg-background p-6" data-testid="login-page">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <HorseIcon size={36} className="text-primary" />
            <h1 className="text-3xl font-display italic font-semibold tracking-normal">
              paddoc <span className="text-primary">|</span> pro
            </h1>
          </div>
          <CardTitle className="text-base font-medium">Sign in to your yard</CardTitle>
          <CardDescription className="text-xs">Every detail, cared for.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" data-testid="login-form">
            <div className="space-y-1.5">
              <Label htmlFor="login-tenant">Yard</Label>
              <Select value={tenantId} onValueChange={(v) => v && setTenantId(v)}>
                <SelectTrigger id="login-tenant" data-testid="login-tenant">
                  <SelectValue placeholder="Pick a yard" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_DATASET.tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id} data-testid={`login-tenant-${t.slug}`}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="login-email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="login-password"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Demo mode — any email and password unlock the chosen yard.
              </p>
            </div>
            <Button type="submit" className="w-full" data-testid="login-submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
