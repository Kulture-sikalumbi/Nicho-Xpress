"use client";

import { useMemo, useState } from "react";
import { requestStatuses } from "@/lib/request-status";
import type { RequestStatus } from "@/lib/request-status";

export type SourcingRequest = {
  id: string;
  customer_name: string;
  item_request: string;
  phone: string;
  notes: string | null;
  image_url: string | null;
  status: RequestStatus;
  created_at_label: string;
};

type RequestFilter = "all" | "open" | "complete";

const statusLabels: Record<RequestStatus, string> = {
  received: "New request",
  reviewing: "Reviewing",
  quoted: "Quote sent",
  approved: "Approved",
  purchased: "Purchased abroad",
  in_transit: "In transit",
  ready: "Ready for handover",
  delivered: "Delivered",
  declined: "Unable to source",
  cancelled: "Cancelled",
};

const completeStatuses: RequestStatus[] = ["delivered", "declined", "cancelled"];

function formatPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export default function RequestsTable({ initialRequests }: { initialRequests: SourcingRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState<RequestFilter>("all");
  const [search, setSearch] = useState("");
  const [draftStatuses, setDraftStatuses] = useState<Record<string, RequestStatus>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const visibleRequests = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return requests.filter((request) => {
      const isComplete = completeStatuses.includes(request.status);
      const matchesFilter = filter === "all" || (filter === "complete" ? isComplete : !isComplete);
      const matchesSearch = !searchTerm || [
        request.customer_name,
        request.item_request,
        request.phone,
      ].some((value) => value.toLowerCase().includes(searchTerm));
      return matchesFilter && matchesSearch;
    });
  }, [requests, filter, search]);

  async function saveStatus(requestId: string) {
    const status = draftStatuses[requestId];
    if (!status) return;
    setSavingId(requestId);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId, status }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Couldn't update this request.");

      setRequests((current) => current.map((request) => (
        request.id === requestId ? { ...request, status } : request
      )));
      setDraftStatuses((current) => {
        const next = { ...current };
        delete next[requestId];
        return next;
      });
      setMessage("Request status updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Couldn't update this request.");
    } finally {
      setSavingId(null);
    }
  }

  const allCount = requests.length;
  const openCount = requests.filter((request) => !completeStatuses.includes(request.status)).length;
  const completeCount = allCount - openCount;

  return (
    <>
      <div className="inbox-toolbar">
        <div className="inbox-filters" role="group" aria-label="Filter requests">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")} type="button">All <span>{allCount}</span></button>
          <button className={filter === "open" ? "active" : ""} onClick={() => setFilter("open")} type="button">Open <span>{openCount}</span></button>
          <button className={filter === "complete" ? "active" : ""} onClick={() => setFilter("complete")} type="button">Complete <span>{completeCount}</span></button>
        </div>
        <label className="inbox-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, item or phone"
            aria-label="Search requests"
          />
        </label>
      </div>

      {message && <p className="inbox-message" role="status">{message}</p>}
      {error && <p className="inbox-error" role="alert">{error}</p>}

      {visibleRequests.length === 0 ? (
        <div className="inbox-empty">
          <span aria-hidden="true">⌕</span>
          <h2>{requests.length === 0 ? "No requests yet" : "No matching requests"}</h2>
          <p>{requests.length === 0 ? "New item requests will appear here." : "Try a different search or filter."}</p>
        </div>
      ) : (
        <div className="inbox-list">
          {visibleRequests.map((request) => {
            const selectedStatus = draftStatuses[request.id] ?? request.status;
            const hasStatusChange = selectedStatus !== request.status;
            return (
              <article className="inbox-card" key={request.id}>
                <div className="inbox-card-top">
                  <span className={`status-pill status-${request.status}`}>{statusLabels[request.status]}</span>
                  <span className="inbox-date">Received {request.created_at_label}</span>
                </div>
                <div className="inbox-card-body">
                  <div className="inbox-item">
                    <span className="inbox-label">ITEM REQUEST</span>
                    <h2>{request.item_request}</h2>
                    {request.notes && <p className="inbox-notes">{request.notes}</p>}
                    {request.image_url && (
                      <a className="inbox-reference-image" href={request.image_url} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={request.image_url} alt={`Reference photo for ${request.item_request}`} />
                        <span>View customer reference photo <span aria-hidden="true">↗</span></span>
                      </a>
                    )}
                  </div>
                  <div className="inbox-customer">
                    <span className="inbox-label">CUSTOMER</span>
                    <strong>{request.customer_name}</strong>
                    <a href={`tel:${formatPhone(request.phone)}`}>{request.phone}</a>
                  </div>
                </div>
                <div className="inbox-card-bottom">
                  <label className="status-select-label">
                    <span>Order status</span>
                    <select
                      value={selectedStatus}
                      onChange={(event) => setDraftStatuses((current) => ({
                        ...current,
                        [request.id]: event.target.value as RequestStatus,
                      }))}
                    >
                      {requestStatuses.map((status) => (
                        <option key={status} value={status}>{statusLabels[status]}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="inbox-save"
                    type="button"
                    disabled={!hasStatusChange || savingId === request.id}
                    onClick={() => void saveStatus(request.id)}
                  >
                    {savingId === request.id ? "Saving…" : "Save status"}
                    {savingId !== request.id && <span aria-hidden="true">↗</span>}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
