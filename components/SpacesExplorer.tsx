"use client";
import { useState } from "react";
import { spaces, spaceTypeLabels, type SpaceType } from "@/lib/data";
import SpaceCard from "./SpaceCard";
import Icon from "./ui/Icon";
import Button from "./ui/Button";
import { formatNumber } from "@/lib/date";
export default function SpacesExplorer() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<SpaceType | "all">("all");
  const [capacity, setCapacity] = useState(0);
  const [sort, setSort] = useState("recommended");
  const reset = () => {
    setSearch("");
    setType("all");
    setCapacity(0);
    setSort("recommended");
  };
  const normalized = (value: string) =>
    value
      .trim()
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/\u200c/g, " ");
  const filtered = spaces
    .filter(
      (space) =>
        normalized(space.name).includes(normalized(search)) &&
        (type === "all" || space.type === type) &&
        space.capacity >= capacity,
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : 0,
    );
  return (
    <div className="explorer-layout">
      <aside className="filters-card">
        <div className="filter-heading">
          <h2>
            <Icon name="grid" size={18} />
            پیدا کردن فضای تو
          </h2>
          <button className="link-button" onClick={reset}>
            پاک کردن
          </button>
        </div>
        <div className="field">
          <label htmlFor="search">دنبال چه فضایی هستی؟</label>
          <div className="search-input">
            <Icon name="search" size={18} />
            <input
              id="search"
              placeholder="نام فضا را جستجو کن..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <fieldset className="type-filter">
          <legend>نوع فضا</legend>
          {[
            { value: "all", label: "همه فضاها" },
            ...Object.entries(spaceTypeLabels).map(([value, label]) => ({
              value,
              label,
            })),
          ].map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name="spaceType"
                value={option.value}
                checked={type === option.value}
                onChange={() => setType(option.value as SpaceType | "all")}
              />
              <span>{option.label}</span>
              <small>
                {formatNumber(
                  spaces.filter(
                    (space) =>
                      option.value === "all" || space.type === option.value,
                  ).length,
                )}
              </small>
            </label>
          ))}
        </fieldset>
        <div className="field">
          <label htmlFor="capacity">حداقل ظرفیت</label>
          <select
            className="input"
            id="capacity"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          >
            <option value={0}>مهم نیست</option>
            <option value={2}>۲ نفر و بیشتر</option>
            <option value={4}>۴ نفر و بیشتر</option>
            <option value={10}>۱۰ نفر و بیشتر</option>
          </select>
        </div>
        <div className="filter-help">
          <Icon name="coffee" size={24} />
          <strong>فقط لپ‌تاپت رو بیار.</strong>
          <p>اینترنت، چای و قهوه در تمام فضاها همراه شماست.</p>
        </div>
      </aside>
      <div className="explorer-results">
        <div className="results-toolbar">
          <span>
            <strong>{formatNumber(filtered.length)} فضا</strong> برای یک روز
            کاری خوب
          </span>
          <label className="sort-label">
            مرتب‌سازی
            <select
              aria-label="مرتب‌سازی"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recommended">پیشنهاد کاوین</option>
              <option value="low">کمترین قیمت</option>
              <option value="high">بیشترین قیمت</option>
            </select>
          </label>
        </div>
        {filtered.length ? (
          <div className="spaces-grid explorer-grid">
            {filtered.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              <Icon name="search" size={32} />
            </span>
            <h2>این بار فضایی پیدا نشد</h2>
            <p>نام کوتاه‌تری جستجو کن یا فیلترها را تغییر بده.</p>
            <Button variant="secondary" onClick={reset}>
              نمایش همه فضاها
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
