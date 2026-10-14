"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const maxImageSize = 5 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

export default function RequestForm({ initialItem = "", initialImage = null }: { initialItem?: string; initialImage?: File | null }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [item, setItem] = useState("");
  const [submittedItem, setSubmittedItem] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(initialImage);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImage) setReferenceImage(initialImage);
  }, [initialImage]);

  useEffect(() => {
    if (!referenceImage) {
      setImagePreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(referenceImage);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [referenceImage]);

  useEffect(() => {
    function receiveSearchItem(event: Event) {
      const nextItem = (event as CustomEvent<string>).detail;
      if (typeof nextItem !== "string" || !nextItem.trim()) return;

      setItem(nextItem.trim());
      setStatus("idle");
      setErrorMessage("");
      window.requestAnimationFrame(() => document.getElementById("item")?.focus());
    }

    window.addEventListener("nicho-xpress:request-item", receiveSearchItem);
    return () => window.removeEventListener("nicho-xpress:request-item", receiveSearchItem);
  }, []);

  useEffect(() => {
    if (!initialItem.trim()) return;
    setItem(initialItem.trim());
    setStatus("idle");
    setErrorMessage("");
  }, [initialItem]);

  function selectReferenceImage(file: File | undefined) {
    if (!file) return;
    if (!allowedImageTypes.includes(file.type)) {
      setErrorMessage("Choose a JPG, PNG or WebP image.");
      setStatus("error");
      return;
    }
    if (file.size > maxImageSize) {
      setErrorMessage("The image must be 5 MB or smaller.");
      setStatus("error");
      return;
    }
    setReferenceImage(file);
    setUploadedImagePath(null);
    setErrorMessage("");
    setStatus("idle");
  }

  function removeReferenceImage() {
    setReferenceImage(null);
    setUploadedImagePath(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const requestedItem = String(formData.get("item") ?? item).trim();
    const notes = String(formData.get("notes") ?? "").trim();
    const budget = String(formData.get("budget") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const requestNotes = [
      budget ? `Target budget (ZMW): ${budget}` : "",
      category ? `Category: ${category}` : "",
      notes,
    ].filter(Boolean).join("\n").slice(0, 1200);

    if (referenceImage && (!allowedImageTypes.includes(referenceImage.type) || referenceImage.size > maxImageSize)) {
      setStatus("error");
      setErrorMessage("Choose a JPG, PNG or WebP image up to 5 MB.");
      return;
    }

    try {
      let imagePath = uploadedImagePath;
      if (referenceImage && !imagePath) {
        const extension = referenceImage.type === "image/jpeg" ? "jpg" : referenceImage.type === "image/png" ? "png" : "webp";
        imagePath = `requests/${crypto.randomUUID()}.${extension}`;
        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from("nicho-xpress-request-images")
          .upload(imagePath, referenceImage, {
            cacheControl: "3600",
            contentType: referenceImage.type,
            upsert: false,
          });
        if (uploadError) throw new Error("We couldn't attach that image. Please try again or send the request without it.");
        setUploadedImagePath(imagePath);
      }

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: formData.get("item"),
          name: formData.get("name"),
          phone: formData.get("phone"),
          notes: requestNotes,
          imagePath,
          website: formData.get("website"),
        }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "We couldn't send your request. Please try again.");
      }

      setSubmittedItem(requestedItem);
      setStatus("success");
      form.reset();
      setItem("");
      setReferenceImage(null);
      setUploadedImagePath(null);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't send your request. Please try again shortly.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="request-result" role="status" aria-live="polite">
        <span className="result-icon" aria-hidden="true">
          ✓
        </span>
        <div>
          <h3>Your request to order “{submittedItem}” has been sent.</h3>
          <p>
            We’ll check the item and message you with the full price in kwacha.
            You can decide if you’d like to go ahead.
          </p>
          <button
            className="text-button"
            type="button"
            onClick={() => {
              setStatus("idle");
              setSubmittedItem("");
            }}
          >
            Start another request <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <label htmlFor="item">What would you like us to find?</label>
      <input
        id="item"
        name="item"
        type="text"
        value={item}
        onChange={(event) => setItem(event.target.value)}
        placeholder="Paste a product link or describe it"
        autoComplete="off"
        minLength={3}
        maxLength={2000}
        required
      />

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="request-budget">Target budget <span>Optional, ZMW</span></label>
          <input id="request-budget" name="budget" type="number" min="0" max="999999999" placeholder="e.g. 3500" inputMode="decimal" />
        </div>
        <div className="form-field">
          <label htmlFor="request-category">Category <span>Optional</span></label>
          <select id="request-category" name="category" defaultValue="">
            <option value="">Choose a category</option>
            <option>Electronics &amp; tech</option>
            <option>Solar &amp; power</option>
            <option>Fashion &amp; footwear</option>
            <option>Auto parts</option>
            <option>Home &amp; living</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="customer-name">Your name</label>
          <input
            id="customer-name"
            name="name"
            type="text"
            placeholder="e.g. Chanda"
            autoComplete="name"
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="customer-phone">Phone / WhatsApp</label>
          <input
            id="customer-phone"
            name="phone"
            type="tel"
            placeholder="+260 97 000 0000"
            autoComplete="tel"
            required
          />
        </div>
      </div>

      <label htmlFor="request-notes">Anything we should know? <span>Optional</span></label>
      <textarea
        id="request-notes"
        name="notes"
        placeholder="Size, colour, model, quantity or budget"
        rows={3}
      />

      <div className="request-image-upload">
        <label htmlFor="request-reference-image">Product photo <span>Optional</span></label>
        <input
          ref={imageInputRef}
          id="request-reference-image"
          className="request-image-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => selectReferenceImage(event.target.files?.[0])}
        />
        {imagePreview ? (
          <div className="request-image-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Selected product reference" />
            <span>{referenceImage?.name}</span>
            <button type="button" onClick={removeReferenceImage}>Remove</button>
          </div>
        ) : (
          <label className="request-image-pick" htmlFor="request-reference-image">
            <span aria-hidden="true">＋</span> Attach a product photo or screenshot
          </label>
        )}
        <p className="request-image-note">JPG, PNG or WebP · up to 5 MB · visible to our sourcing team only</p>
      </div>

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button className="button button-dark form-submit" type="submit" disabled={status === "sending"}>
        <span className="form-submit-label">
          {status === "sending"
            ? "Sending request…"
                        : item.trim()
              ? `Request to order “${item.trim()}”`
              : "Send my request"}
        </span>
        {status !== "sending" && <span aria-hidden="true">↗</span>}
      </button>
      {status === "error" ? (
        <p className="form-error" role="alert">{errorMessage}</p>
      ) : (
        <p className="form-note">This is just a request. We’ll contact you about the item before you decide.</p>
      )}
    </form>
  );
}
