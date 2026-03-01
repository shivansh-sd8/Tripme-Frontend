"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
    MapPin,
    Plus,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Upload,
    Link2,
    RefreshCw,
    CheckCircle,
    XCircle,
    Save,
    X,
    GripVertical,
    Globe,
} from "lucide-react";

interface Destination {
    _id: string;
    name: string;
    description: string;
    image: string;
    staysLabel: string;
    displayOrder: number;
    isActive: boolean;
    searchCity: string;
    createdAt: string;
}

const EMPTY_FORM = {
    name: "",
    description: "",
    image: "",
    staysLabel: "",
    displayOrder: 0,
    isActive: true,
    searchCity: "",
};

type FormData = typeof EMPTY_FORM;

// ── Reusable tiny components ──────────────────────────────────────────────────
const Toast = ({
    toast,
}: {
    toast: { message: string; type: "success" | "error" } | null;
}) => {
    if (!toast) return null;
    return (
        <div
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold animate-fade-in ${toast.type === "success"
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : "bg-gradient-to-r from-red-500 to-rose-600"
                }`}
        >
            {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
                <XCircle className="w-5 h-5 shrink-0" />
            )}
            {toast.message}
        </div>
    );
};

const StatPill = ({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) => (
    <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-white/40 shadow-sm">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-sm font-medium text-gray-700">
            {label}: <span className="font-bold text-gray-900">{value}</span>
        </span>
    </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
function DestinationModal({
    open,
    onClose,
    onSave,
    initial,
    saving,
}: {
    open: boolean;
    onClose: () => void;
    onSave: (data: FormData) => void;
    initial: FormData | null;
    saving: boolean;
}) {
    const [form, setForm] = useState<FormData>(initial || EMPTY_FORM);
    const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setForm(initial || EMPTY_FORM);
    }, [initial, open]);

    if (!open) return null;

    const set = (field: keyof FormData, value: any) =>
        setForm((f) => ({ ...f, [field]: value }));

    const isEdit = !!initial && !!(initial as any)._id;

    const uploadFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            const token = localStorage.getItem("tripme_token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
            const res = await fetch(`${apiUrl}/upload/image`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            const url = data?.data?.url || data?.url || "";
            if (url) set("image", url);
            else throw new Error("No URL in response");
        } catch (err: any) {
            alert(err.message || "Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) uploadFile(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
        e.target.value = "";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isEdit ? "Edit Destination" : "Add Popular Destination"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Image preview */}
                    {form.image && (
                        <div className="relative rounded-2xl overflow-hidden h-44 bg-gray-100">
                            <img
                                src={form.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        "https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=800&q=80";
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <div className="absolute bottom-3 left-3 text-white font-semibold text-lg drop-shadow">
                                {form.name || "Destination Name"}
                            </div>
                        </div>
                    )}

                    {/* Form fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Destination Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                                placeholder="e.g. Goa"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={form.description}
                                onChange={(e) => set("description", e.target.value)}
                                rows={3}
                                placeholder="Short description of the destination"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>

                        {/* Image — tabbed Upload / URL */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Destination Image <span className="text-red-500">*</span>
                            </label>

                            {/* Tab switcher */}
                            <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-3 w-fit">
                                <button
                                    type="button"
                                    onClick={() => setImageTab("upload")}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors ${imageTab === "upload" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                    <Upload className="w-3.5 h-3.5" /> Upload File
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageTab("url")}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors ${imageTab === "url" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                    <Link2 className="w-3.5 h-3.5" /> Paste URL
                                </button>
                            </div>

                            {imageTab === "upload" ? (
                                <>
                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    {/* Drop zone */}
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleFileDrop}
                                        onClick={() => !uploading && fileInputRef.current?.click()}
                                        className={`relative flex flex-col items-center justify-center gap-2 h-32 rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none
                                            ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50"}
                                            ${uploading ? "opacity-70 cursor-not-allowed" : ""}`}
                                    >
                                        {uploading ? (
                                            <>
                                                <RefreshCw className="w-7 h-7 text-blue-500 animate-spin" />
                                                <p className="text-xs text-blue-600 font-medium">Uploading…</p>
                                            </>
                                        ) : form.image ? (
                                            <>
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200">
                                                    <img src={form.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <p className="text-xs text-emerald-600 font-semibold">✓ Uploaded — click to replace</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <Upload className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <p className="text-xs text-gray-600 font-medium">
                                                    {dragOver ? "Drop image here" : "Drag & drop or click to select"}
                                                </p>
                                                <p className="text-[11px] text-gray-400">JPG, PNG, WebP · max 5 MB</p>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* URL tab */
                                <input
                                    type="url"
                                    value={form.image}
                                    onChange={(e) => set("image", e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            )}
                        </div>


                        {/* Search City */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Search City <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2 items-center">
                                <Globe className="w-5 h-5 text-gray-400 shrink-0" />
                                <input
                                    type="text"
                                    value={form.searchCity}
                                    onChange={(e) => set("searchCity", e.target.value)}
                                    placeholder="e.g. Goa"
                                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Stays Label */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Stays Label
                            </label>
                            <input
                                type="text"
                                value={form.staysLabel}
                                onChange={(e) => set("staysLabel", e.target.value)}
                                placeholder="e.g. 120+ Stays"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Display Order */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Display Order
                            </label>
                            <input
                                type="number"
                                value={form.displayOrder}
                                onChange={(e) => set("displayOrder", Number(e.target.value))}
                                min={0}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold text-gray-700">Active</label>
                            <button
                                type="button"
                                onClick={() => set("isActive", !form.isActive)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? "bg-blue-500" : "bg-gray-300"}`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0"}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(form)}
                        disabled={saving || !form.name || !form.image || !form.searchCity}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {saving ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saving ? "Saving…" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PopularDestinationPage() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Destination | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem("tripme_token");
        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    const fetchDestinations = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/popular-destinations", {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setDestinations(data?.data?.destinations || data?.destinations || []);
        } catch (err: any) {
            showToast("Failed to load destinations", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDestinations();
    }, [fetchDestinations]);

    const handleSave = async (form: FormData) => {
        setSaving(true);
        const isEdit = !!editTarget;
        const url = isEdit
            ? `/api/admin/popular-destinations/${editTarget!._id}`
            : "/api/admin/popular-destinations";
        const method = isEdit ? "PUT" : "POST";
        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData?.message || `HTTP ${res.status}`);
            }
            showToast(isEdit ? "Destination updated!" : "Destination added!", "success");
            setModalOpen(false);
            setEditTarget(null);
            fetchDestinations();
        } catch (err: any) {
            showToast(err.message || "Failed to save destination", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this destination?")) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/popular-destinations/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error();
            showToast("Destination deleted", "success");
            fetchDestinations();
        } catch {
            showToast("Failed to delete", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggle = async (dest: Destination) => {
        try {
            const res = await fetch(`/api/admin/popular-destinations/${dest._id}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...dest, isActive: !dest.isActive }),
            });
            if (!res.ok) throw new Error();
            showToast(dest.isActive ? "Destination hidden" : "Destination shown", "success");
            fetchDestinations();
        } catch {
            showToast("Failed to update status", "error");
        }
    };

    const activeCount = destinations.filter((d) => d.isActive).length;
    const inactiveCount = destinations.length - activeCount;

    return (
        <AdminLayout>
            <Toast toast={toast} />

            <DestinationModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditTarget(null); }}
                onSave={handleSave}
                initial={editTarget ? { ...editTarget } : null}
                saving={saving}
            />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Popular Destinations</h1>
                            <p className="text-sm text-gray-500">Manage homepage destination cards</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <StatPill label="Total" value={destinations.length} color="bg-blue-500" />
                        <StatPill label="Active" value={activeCount} color="bg-emerald-500" />
                        <StatPill label="Hidden" value={inactiveCount} color="bg-gray-400" />
                        <button
                            onClick={fetchDestinations}
                            title="Refresh"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? "animate-spin" : ""}`} />
                        </button>
                        <button
                            onClick={() => { setEditTarget(null); setModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Destination
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : destinations.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <Globe className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="text-lg font-medium">No destinations yet</p>
                        <p className="text-sm">Click &ldquo;Add Destination&rdquo; to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {destinations.map((dest) => (
                            <div
                                key={dest._id}
                                className={`group relative rounded-3xl overflow-hidden shadow-md bg-white transition-all hover:shadow-xl hover:-translate-y-1 ${!dest.isActive ? "opacity-60" : ""}`}
                            >
                                {/* Image */}
                                <div className="relative h-44 bg-gray-100">
                                    <img
                                        src={dest.image}
                                        alt={dest.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=800&q=80";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    {/* Order badge */}
                                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full px-2 py-0.5">
                                        <GripVertical className="w-3 h-3" />
                                        #{dest.displayOrder}
                                    </div>
                                    {/* Active badge */}
                                    <div className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${dest.isActive ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"}`}>
                                        {dest.isActive ? "Active" : "Hidden"}
                                    </div>
                                    {/* Name */}
                                    <div className="absolute bottom-3 left-3 text-white font-bold text-lg drop-shadow">
                                        {dest.name}
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="px-4 py-3 space-y-1">
                                    {dest.staysLabel && (
                                        <p className="text-xs text-blue-600 font-semibold">{dest.staysLabel}</p>
                                    )}
                                    {dest.description && (
                                        <p className="text-xs text-gray-500 line-clamp-2">{dest.description}</p>
                                    )}
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> {dest.searchCity}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="px-4 pb-4 flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggle(dest)}
                                        title={dest.isActive ? "Hide" : "Show"}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        {dest.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        {dest.isActive ? "Hide" : "Show"}
                                    </button>
                                    <button
                                        onClick={() => { setEditTarget(dest); setModalOpen(true); }}
                                        title="Edit"
                                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dest._id)}
                                        disabled={deletingId === dest._id}
                                        title="Delete"
                                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-40"
                                    >
                                        {deletingId === dest._id ? (
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}