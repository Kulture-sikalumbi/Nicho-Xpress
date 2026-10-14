import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";
import RequestsTable from "./requests-table";
import type { SourcingRequest } from "./requests-table";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function SetupNotice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="admin-setup-notice">
      <span className="admin-setup-mark">i</span>
      <div><h2>{title}</h2><p>{children}</p></div>
    </div>
  );
}

export default async function AdminInboxPage() {
  const supabase = await createClient();
  const { data: { claims } } = await supabase.auth.getClaims();
  if (!claims) redirect("/admin/login");

  const { data: isStaff, error: staffError } = await supabase.rpc("is_nicho_xpress_staff");
  const email = typeof claims.email === "string" ? claims.email : "Signed-in account";

  if (staffError) {
    return (
      <AdminFrame email={email}>
        <SetupNotice title="Finish the staff database setup">
          Run the staff access migration and add this Supabase Auth account to the staff table.
        </SetupNotice>
      </AdminFrame>
    );
  }

  if (!isStaff) {
    return (
      <AdminFrame email={email}>
        <SetupNotice title="This account isn’t on the staff list">
          Sign-in worked, but this account hasn’t been approved to view customer requests. Add its Auth user ID to <code>public.nicho_xpress_staff</code> in Supabase.
        </SetupNotice>
      </AdminFrame>
    );
  }

  const { data, error } = await supabase
    .from("custom_sourcing_requests")
    .select("id, customer_name, item_request, phone, notes, image_path, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <AdminFrame email={email}>
        <SetupNotice title="Couldn’t load the request inbox">
          Check that both database migrations have been run and that the Data API is enabled for this project.
        </SetupNotice>
      </AdminFrame>
    );
  }

  const formatter = new Intl.DateTimeFormat("en-ZM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lusaka",
  });
  const rows = data ?? [];
  const imagePaths = rows.flatMap((request) => request.image_path ? [request.image_path] : []);
  const imageUrlByPath = new Map<string, string>();
  if (imagePaths.length > 0) {
    const { data: signedImages } = await supabase.storage
      .from("nicho-xpress-request-images")
      .createSignedUrls(imagePaths, 60 * 60);
    for (const image of signedImages ?? []) {
      if (image.path && image.signedUrl) imageUrlByPath.set(image.path, image.signedUrl);
    }
  }
  const requests = rows.map((request) => ({
    ...request,
    image_url: request.image_path ? imageUrlByPath.get(request.image_path) ?? null : null,
    status: request.status as SourcingRequest["status"],
    created_at_label: formatter.format(new Date(request.created_at)),
  })) satisfies SourcingRequest[];
  const newCount = requests.filter((request) => request.status === "received").length;

  return (
    <AdminFrame email={email}>
      <section className="admin-welcome">
        <div>
          <div className="admin-eyebrow"><span /> SOURCING OPERATIONS</div>
          <h1>Request inbox<span>.</span></h1>
          <p>Review what customers are looking for and keep each order moving.</p>
        </div>
        <div className="admin-summary">
          <span className="admin-summary-icon" aria-hidden="true">↗</span>
          <span><strong>{newCount}</strong><small>New requests</small></span>
        </div>
      </section>

      <section className="admin-inbox-section">
        <div className="admin-section-heading">
          <div><h2>Customer requests</h2><p>Latest 100 requests · Status changes save to Supabase</p></div>
          <span className="admin-total">{requests.length} total</span>
        </div>
        <RequestsTable initialRequests={requests} />
      </section>
    </AdminFrame>
  );
}

function AdminFrame({ children, email }: { children: ReactNode; email: string }) {
  return (
    <main className="admin-page">
      <header className="admin-header">
        <a className="brand" href="/" aria-label="Nicho-Xpress home">
          <span className="brand-mark">n<span>x</span></span>
          <span className="brand-word">Nicho<span>-Xpress</span></span>
          <span className="admin-brand-divider" />
          <span className="admin-brand-label">OPS</span>
        </a>
        <div className="admin-header-actions">
          <span className="admin-user"><span className="admin-user-dot" />{email}</span>
          <a className="admin-site-link" href="/">View website <span aria-hidden="true">↗</span></a>
          <LogoutButton />
        </div>
      </header>
      <div className="admin-content">{children}</div>
      <footer className="admin-footer"><span>NICHO-XPRESS OPERATIONS</span><span>Customer request information is for staff use.</span></footer>
    </main>
  );
}
