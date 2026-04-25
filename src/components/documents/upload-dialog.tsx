"use client";

import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth/current";
import { now } from "@/lib/mock/clock";
import { newId } from "@/lib/mock/id-prefixes";
import { mutate, useDataset } from "@/lib/mock/store";
import type { DocumentCategory, DocumentEntityType } from "@/types";

const ALLOWED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const MAX_BYTES = 25 * 1024 * 1024;

const CATEGORIES: DocumentCategory[] = [
  "passport",
  "vaccination_cert",
  "insurance",
  "livery_agreement",
  "dbs_cert",
  "first_aid",
  "liability_waiver",
  "yard_rules",
  "vet_letter",
  "other",
];

export function UploadDocumentDialog() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("vaccination_cert");
  const [entityType, setEntityType] = useState<DocumentEntityType>("horse");
  const [entityId, setEntityId] = useState("");
  const [expiry, setExpiry] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const horses = dataset.horses.filter((h) => h.tenantId === tenantId);
  const clients = dataset.clients.filter((c) => c.tenantId === tenantId);

  function reset() {
    setFile(null);
    setTitle("");
    setCategory("vaccination_cert");
    setEntityType("horse");
    setEntityId("");
    setExpiry("");
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setError(null);
    if (!f) return setFile(null);
    if (f.size > MAX_BYTES) {
      setError(`File is ${(f.size / 1024 / 1024).toFixed(1)} MB. Maximum is 25 MB.`);
      return setFile(null);
    }
    if (!ALLOWED_MIME.includes(f.type) && !["pdf", "docx", "jpg", "jpeg", "png"].some((ext) => f.name.toLowerCase().endsWith(ext))) {
      setError("Only PDF, DOCX, JPEG and PNG files are supported.");
      return setFile(null);
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[a-z]+$/i, ""));
  }

  async function submit() {
    if (!file || !tenantId) return;
    if (!entityId) {
      setError("Pick the entity this document belongs to.");
      return;
    }
    setSubmitting(true);
    const userId = session?.userId ?? "";
    await mutate((d) => {
      d.documents.unshift({
        id: newId("document", `upload-${Date.now()}`),
        tenantId,
        createdAt: now().toISOString(),
        updatedAt: now().toISOString(),
        entityType,
        entityId,
        category,
        title: title || file.name,
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type || "application/octet-stream",
        uploadedById: userId,
        expiryDate: expiry ? new Date(expiry).toISOString() : null,
        version: 1,
        previousVersionId: null,
        signatures: [],
      });
    });
    setSubmitting(false);
    toast.success(`Uploaded ${title || file.name}`);
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" data-testid="documents-upload-trigger">
            <Plus className="h-3.5 w-3.5" /> Upload document
          </Button>
        }
      />
      <DialogContent className="max-w-lg" data-testid="dialog-upload-document">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>PDF, DOCX, JPEG, or PNG · max 25 MB.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="upload-file">File *</Label>
            <Input
              id="upload-file"
              ref={fileRef}
              type="file"
              accept={ALLOWED_MIME.join(",")}
              onChange={handleFile}
              data-testid="dialog-upload-document-file"
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                {file.name} · {(file.size / 1024).toFixed(0)} KB
              </p>
            )}
            {error && (
              <p className="text-xs text-destructive" data-testid="dialog-upload-document-error">
                {error}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="upload-title">Title</Label>
            <Input
              id="upload-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="dialog-upload-document-title"
              placeholder="Whisper — vaccination certificate"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v as DocumentCategory)}>
                <SelectTrigger data-testid="dialog-upload-document-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Linked to</Label>
              <Select
                value={entityType}
                onValueChange={(v) => {
                  if (!v) return;
                  setEntityType(v as DocumentEntityType);
                  setEntityId("");
                }}
              >
                <SelectTrigger data-testid="dialog-upload-document-entity-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horse">Horse</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{entityType === "horse" ? "Horse" : "Client"}</Label>
            <Select value={entityId} onValueChange={(v) => v && setEntityId(v)}>
              <SelectTrigger data-testid="dialog-upload-document-entity">
                <SelectValue placeholder={`Pick a ${entityType}`} />
              </SelectTrigger>
              <SelectContent>
                {entityType === "horse"
                  ? horses.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.stableName}
                      </SelectItem>
                    ))
                  : clients.map((c) => {
                      const u = dataset.users.find((u) => u.id === c.userAccountId);
                      return (
                        <SelectItem key={c.id} value={c.id}>
                          {u ? `${u.firstName} ${u.lastName}` : c.id}
                        </SelectItem>
                      );
                    })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Expiry (optional)</Label>
            <Input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              data-testid="dialog-upload-document-expiry"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="dialog-upload-document-cancel">
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || !file || !entityId}
            data-testid="dialog-upload-document-submit"
          >
            <Upload className="h-3.5 w-3.5" /> {submitting ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
