"use client"
import React, { useEffect, useState } from "react";
import {
    Plus,
    Users,
    Image as ImageIcon,
    X,
    Globe,
    Lock,
    ShieldCheck,
} from "lucide-react";
import { createCommunity, getCategories } from "@/libs/api";
import { getAccessToken } from "@/app/actions/post-votes";
import { Category } from "@/libs/types";

const isPrivate_OPTIONS: {
    id: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}[] = [
        {
            id: "public",
            label: "Public",
            description: "Anyone can view, post, and comment",
            icon: Globe,
        },
        {
            id: "restricted",
            label: "Restricted",
            description: "Anyone can view, only approved members can post",
            icon: ShieldCheck,
        },
        {
            id: "private",
            label: "Private",
            description: "Only approved members can view and post",
            icon: Lock,
        },
    ];

const MAX_NAME = 30;
const MAX_DESCRIPTION = 200;

export default function CreateCommunityPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<Category | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isPrivate, setIsPrivate] = useState<boolean>(false);
    const [visiblity, setVisiblity] = useState<string>("public")
    const [rules, setRules] = useState<string[]>([""]);
    const [banner, setBanner] = useState<File | null>(null);
    const [icon, setIcon] = useState<File | null>(null);

    useEffect(() =>{
        getCategories()
        .then((data) => setCategories(data))
        .catch((error) => console.error("Error fetching categories:", error));
    },[]);

    const updateRule = (index: number, value: string) => {
        setRules((prev) => prev.map((r, i) => (i === index ? value : r)));
        console.log(rules);
    };

    const addRule = () => setRules((prev) => [...prev, ""]);

    const removeRule = (index: number) =>
        setRules((prev) => prev.filter((_, i) => i !== index));

    const canSubmit = name.trim().length >= 3 && category !== null;

    const submit = async () => {
        if (category){
            const token = await getAccessToken();
            createCommunity({
                name: name,
                category_id: category.id,
                description: description,
                is_private: isPrivate,
                banner: banner,
                icon: icon,
                rules: rules,
            }, token)
            .then(res=>console.log(res))
            .catch(error=>console.log(error));
        }
    }

    return (
        <main className="mx-auto min-w-0 max-w-5xl flex-1 space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    Create a community
                </h1>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Build a space for students to ask questions and share what they
                    know.
                </p>
            </div>

            {/* Live preview card */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                <div className="relative h-20 bg-linear-to-br from-indigo-500 to-indigo-700">
                    <div
                        className="absolute inset-0 opacity-25"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle, white 1px, transparent 1px)",
                            backgroundSize: "16px 16px",
                        }}
                    />
                </div>
                <div className="px-5 pb-5">
                    <div className="-mt-7 z-10 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-indigo-100 shadow-xl dark:border-neutral-900 dark:bg-indigo-950">
                        <Users className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h3 className="mt-3 font-semibold text-neutral-900 dark:text-neutral-100">
                        {name.trim() ? `r/${name.replace(/\s+/g, "")}` : "c/YourCommunity"}
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">0 members · just now</p>
                    <p className="mt-2.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                        {description.trim() || "Your community description will appear here."}
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                {/* Name */}
                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            Community name
                        </label>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">
                            {name.length}/{MAX_NAME}
                        </span>
                    </div>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400 dark:text-neutral-500">
                            r/
                        </span>
                        <input
                            type="text"
                            value={name}
                            maxLength={MAX_NAME}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="ComputerScience"
                            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-8 pr-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                        />
                    </div>
                    <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                        Community names cannot be changed once created.
                    </p>
                </div>

                {/* Description */}
                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            Description
                        </label>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">
                            {description.length}/{MAX_DESCRIPTION}
                        </span>
                    </div>
                    <textarea
                        value={description}
                        maxLength={MAX_DESCRIPTION}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What's this community about?"
                        rows={3}
                        className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((c) => {
                            const active = category === c;
                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setCategory(c)}
                                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${active
                                            ? "border-indigo-600 bg-indigo-600 text-white"
                                            : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                                        }`}
                                >
                                    {c.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Banner + icon upload */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="banner-image" className="mb-2 block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            Banner image
                        </label>
                        <div className="relative">
                            <input
                                id="banner-image"
                                type="file"
                                accept="image/*"
                                onChange={(event) => setBanner(event.target.files?.[0] ?? null)}
                                className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                            />
                            <div className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/70 transition-colors peer-hover:border-indigo-400 peer-hover:bg-indigo-50/50 peer-focus-visible:border-indigo-500 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/30 dark:border-neutral-700 dark:bg-neutral-800/70 dark:peer-hover:bg-indigo-950/40">
                                <ImageIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                                <span className="max-w-[90%] truncate text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    {banner?.name || "Choose a banner image"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="community-icon" className="mb-2 block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            Icon
                        </label>
                        <div className="relative">
                            <input
                                id="community-icon"
                                type="file"
                                accept="image/*"
                                onChange={(event) => setIcon(event.target.files?.[0] ?? null)}
                                className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                            />
                            <div className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/70 transition-colors peer-hover:border-indigo-400 peer-hover:bg-indigo-50/50 peer-focus-visible:border-indigo-500 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/30 dark:border-neutral-700 dark:bg-neutral-800/70 dark:peer-hover:bg-indigo-950/40">
                                <ImageIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                                <span className="max-w-[90%] truncate text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    {icon?.name || "Choose an icon image"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* isPrivate */}
                <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        isPrivate
                    </label>
                    <div className="space-y-2">
                        {isPrivate_OPTIONS.map((v) => {
                            const active = visiblity === v.id;
                            const Icon = v.icon;
                            return (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => {setIsPrivate(v.id === "private"); setVisiblity(v.id)}}
                                    className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${active
                                            ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40"
                                            : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                                        }`}
                                >
                                    <div
                                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${active
                                                ? "border-indigo-600 bg-indigo-600"
                                                : "border-neutral-300 dark:border-neutral-600"
                                            }`}
                                    >
                                        {active && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                        )}
                                    </div>
                                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
                                    <div>
                                        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                            {v.label}
                                        </div>
                                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {v.description}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Rules */}
                <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        Community rules{" "}
                        <span className="font-normal text-neutral-400 dark:text-neutral-500">(optional)</span>
                    </label>
                    <div className="space-y-2">
                        {rules.map((rule, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="w-5 shrink-0 text-sm font-semibold text-neutral-400 dark:text-neutral-500">
                                    {i + 1}.
                                </span>
                                <input
                                    type="text"
                                    value={rule}
                                    onChange={(e) => updateRule(i, e.target.value)}
                                    placeholder="e.g. Keep discussions academic and respectful"
                                    className="flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                                />
                                {rules.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRule(i)}
                                        className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addRule}
                        className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add a rule
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pb-6">
                <button
                    type="button"
                    className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={submit}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
                >
                    Create Community
                </button>
            </div>
        </main>
    );
}