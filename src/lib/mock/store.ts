"use client";

import { useSyncExternalStore } from "react";

import { type Dataset,freshSeed, MOCK_DATASET } from "./seed";

let snapshot: Dataset = MOCK_DATASET;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot(): Dataset {
  return snapshot;
}

function getServerSnapshot(): Dataset {
  return MOCK_DATASET;
}

export function useDataset(): Dataset {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function readDataset(): Dataset {
  return snapshot;
}

interface QueueEntry {
  fn: (d: Dataset) => void;
  resolve: () => void;
  reject: (e: Error) => void;
}

const queue: QueueEntry[] = [];
let flushing = false;

export async function mutate(fn: (d: Dataset) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    if (!flushing) flush();
  });
}

function flush() {
  flushing = true;
  while (queue.length) {
    const { fn, resolve, reject } = queue.shift()!;
    try {
      const next: Dataset = structuredClone(snapshot);
      fn(next);
      snapshot = next;
      emit();
      resolve();
    } catch (err) {
      reject(err as Error);
    }
  }
  flushing = false;
}

export function reseed() {
  snapshot = freshSeed();
  emit();
}

// Test-time hooks (DCE'd in production)
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__paddocpro_reseed = reseed;
}
