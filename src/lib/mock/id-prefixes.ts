export const ID_PREFIX = {
  tenant: "ten_",
  user: "usr_",
  client: "client_",
  horse: "horse_",
  stable: "stable_",
  paddock: "pad_",
  paddockRotationGroup: "rot_",
  liveryPackage: "pkg_",
  liveryAddOn: "addon_",
  resource: "res_",
  booking: "bk_",
  task: "tsk_",
  taskTemplate: "tsktpl_",
  feedPlan: "feed_",
  inventory: "inv_",
  supplier: "sup_",
  purchaseOrder: "po_",
  healthEvent: "he_",
  prescription: "rx_",
  document: "doc_",
  thread: "thr_",
  message: "msg_",
  incident: "inc_",
  visitor: "vis_",
  shift: "shf_",
  rotaTemplate: "rota_",
  cert: "cert_",
  charge: "ch_",
  invoice: "invc_",
  payment: "pmt_",
  creditNote: "cn_",
  notification: "not_",
  audit: "aud_",
  movement: "mov_",
  rbacRow: "rbac_",
} as const;

let counter = 0;
const RESET_TOKEN = "20260425";

/** Deterministic id generator — increments a counter so output is reproducible across reloads. */
export function newId(kind: keyof typeof ID_PREFIX, seed?: string | number): string {
  counter += 1;
  const suffix = seed != null ? String(seed) : `${RESET_TOKEN}${counter.toString(36).padStart(4, "0")}`;
  return `${ID_PREFIX[kind]}${suffix}`;
}

export function resetIdCounter() {
  counter = 0;
}
