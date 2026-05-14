import soc from "@/assets/services/soc.jpg";
import edr from "@/assets/services/edr.jpg";
import xdr from "@/assets/services/xdr.jpg";
import cloud from "@/assets/services/cloud.jpg";
import iam from "@/assets/services/iam.jpg";

export const categoryImages: Record<string, string> = {
  soc,
  edr,
  xdr,
  cloud,
  iam,
};

export function imageForCategory(category: string): string {
  const c = category.trim().toLowerCase();

  if (c.startsWith("soc")) return soc;
  if (c.startsWith("edr") || c.includes("endpoint")) return edr;
  if (c.startsWith("xdr")) return xdr;
  if (c.startsWith("cloud")) return cloud;

  // fallback IAM
  return iam;
}
