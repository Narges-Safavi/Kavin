"use client";

import { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Input from "@/components/ui/Input";
import SpaceCard from "@/components/SpaceCard";
import { Space, fetchSpaces } from "@/lib/data";

type LoadStatus = "loading" | "success" | "error";

export default function SpacesPage() {
  const [allSpaces, setAllSpaces] = useState<Space[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [search, setSearch] = useState("");
  const [minCapacity, setMinCapacity] = useState(0);

  useEffect(() => {
    fetchSpaces()
      .then((data) => {
        setAllSpaces(data);
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, []);

  const filteredSpaces = allSpaces.filter(
    (space) =>
      space.name.includes(search) && space.capacity >= minCapacity
  );

  return (
    <Container className="py-10">
      <PageHeader
        title="فضاهای کاری"
        description="فضای مناسب کار و جلسات خود را پیدا کنید."
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <Input
          id="search"
          label="جستجو"
          placeholder="نام فضا را وارد کنید"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-900">
            حداقل ظرفیت
          </label>
          <select
            value={minCapacity}
            onChange={(e) => setMinCapacity(Number(e.target.value))}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option value={0}>همه</option>
            <option value={2}>حداقل ۲ نفر</option>
            <option value={5}>حداقل ۵ نفر</option>
            <option value={10}>حداقل ۱۰ نفر</option>
          </select>
        </div>
      </div>

      {status === "loading" && (
        <p className="text-zinc-500">در حال بارگذاری فضاها...</p>
      )}

      {status === "error" && (
        <p className="text-red-600">
          مشکلی در دریافت فضاها پیش آمد. لطفاً دوباره تلاش کنید.
        </p>
      )}

      {status === "success" && filteredSpaces.length === 0 && (
        <p className="text-zinc-500">فضایی با این مشخصات پیدا نشد.</p>
      )}

      {status === "success" && filteredSpaces.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredSpaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}
    </Container>
  );
}