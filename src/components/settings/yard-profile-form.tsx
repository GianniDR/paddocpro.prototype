"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth/current";
import { now } from "@/lib/mock/clock";
import { mutate, useDataset } from "@/lib/mock/store";
import type { Tenant } from "@/types";

export function YardProfileForm() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const tenant = dataset.tenants.find((t) => t.id === tenantId);
  if (!tenant) return null;
  // Re-mount the form whenever tenantId changes so initial state derives from the new tenant.
  return <YardProfileFormInner key={tenant.id} tenant={tenant} />;
}

function YardProfileFormInner({ tenant }: { tenant: Tenant }) {
  const [name, setName] = useState(tenant.name);
  const [phone, setPhone] = useState(tenant.phone);
  const [addressLine1, setAddressLine1] = useState(tenant.addressLine1);
  const [city, setCity] = useState(tenant.city);
  const [postcode, setPostcode] = useState(tenant.postcode);
  const [emergencyContactName, setEcName] = useState(tenant.emergencyContactName);
  const [emergencyContactPhone, setEcPhone] = useState(tenant.emergencyContactPhone);
  const [vatNumber, setVatNumber] = useState(tenant.vatNumber ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);

  async function save() {
    setSubmitting(true);
    await mutate((d) => {
      const t = d.tenants.find((t) => t.id === tenant.id);
      if (!t) return;
      t.name = name;
      t.phone = phone;
      t.addressLine1 = addressLine1;
      t.city = city;
      t.postcode = postcode;
      t.emergencyContactName = emergencyContactName;
      t.emergencyContactPhone = emergencyContactPhone;
      t.vatNumber = vatNumber || null;
      t.updatedAt = now().toISOString();
    });
    setSubmitting(false);
    setDirty(false);
    toast.success("Yard profile saved");
  }

  function bind(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setDirty(true);
    };
  }

  return (
    <div className="p-4 pb-12 flex-1 max-w-3xl" data-testid="yard-profile-form">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Yard name *">
              <Input value={name} onChange={bind(setName)} data-testid="yard-profile-name" />
            </Field>
            <Field label="Phone">
              <Input value={phone} onChange={bind(setPhone)} data-testid="yard-profile-phone" />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input value={addressLine1} onChange={bind(setAddressLine1)} data-testid="yard-profile-address" />
            </Field>
            <Field label="City">
              <Input value={city} onChange={bind(setCity)} data-testid="yard-profile-city" />
            </Field>
            <Field label="Postcode">
              <Input value={postcode} onChange={bind(setPostcode)} data-testid="yard-profile-postcode" />
            </Field>
            <Field label="Emergency contact name">
              <Input
                value={emergencyContactName}
                onChange={bind(setEcName)}
                data-testid="yard-profile-emergency-name"
              />
            </Field>
            <Field label="Emergency contact phone">
              <Input
                value={emergencyContactPhone}
                onChange={bind(setEcPhone)}
                data-testid="yard-profile-emergency-phone"
              />
            </Field>
            <Field label="VAT number">
              <Input value={vatNumber} onChange={bind(setVatNumber)} data-testid="yard-profile-vat" />
            </Field>
          </div>
          <div className="pt-4 border-t flex items-center gap-3">
            <Button onClick={save} size="sm" disabled={submitting || !dirty} data-testid="yard-profile-save">
              <Save className="h-3.5 w-3.5" /> {submitting ? "Saving…" : "Save changes"}
            </Button>
            {dirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
