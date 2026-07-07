import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ehAdmin } from "@/lib/session";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = { title: "Painel", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await ehAdmin()) redirect("/admin/dashboard");
  return (
    <main>
      <AdminLoginForm />
    </main>
  );
}
