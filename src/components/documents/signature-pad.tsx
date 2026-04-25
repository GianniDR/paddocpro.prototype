"use client";

import { Eraser, Pen, PenLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SignaturePadDialog({ documentId }: { documentId?: string }) {
  const [open, setOpen] = useState(false);
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#1a3a2a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setSigned(false);
  }, [open]);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setSigned(true);
  }

  function onUp() {
    drawingRef.current = false;
  }

  function clear() {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    setSigned(false);
  }

  function save() {
    if (!signed) return;
    toast.success(documentId ? `Signed document ${documentId.slice(0, 12)}…` : "Signature captured");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" data-testid="signature-pad-trigger">
            <PenLine className="h-3.5 w-3.5" /> Sign document
          </Button>
        }
      />
      <DialogContent className="max-w-2xl" data-testid="dialog-signature-pad">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pen className="h-4 w-4 text-primary" /> Capture signature
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Sign with your mouse, finger or stylus. Hit Save when you&apos;re happy with it.
          </p>
          <div className="rounded-md border bg-card overflow-hidden">
            <canvas
              ref={canvasRef}
              width={680}
              height={220}
              className="block touch-none cursor-crosshair w-full bg-white"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              data-testid="signature-pad-canvas"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={clear} data-testid="signature-pad-clear">
            <Eraser className="h-3.5 w-3.5" /> Clear
          </Button>
          <Button onClick={save} disabled={!signed} data-testid="signature-pad-save">
            Save signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
