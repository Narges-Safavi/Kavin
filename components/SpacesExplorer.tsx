"use client";
import {
  useState,
  useRef,
  useEffect,
  useTransition,
  useOptimistic,
} from "react";
import { useRouter } from "next/navigation";
import {
  readSpaceFilters,
  spaceFilterQuery,
  type SpaceFilters,
} from "@/lib/space-filters";
import { spaceTypeLabels, type Space, type SpaceType } from "@/lib/data";
import SpaceCard from "./SpaceCard";
import Icon from "./ui/Icon";
import Button from "./ui/Button";
import { formatNumber } from "@/lib/date";
export default function SpacesExplorer({
  spaces,
  filters,
}: {
  spaces: Space[];
  filters: SpaceFilters;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeFilters, setActiveFilters] = useOptimistic(filters);
  const [search, setSearch] = useState(filters.search);
  const [previousSearch, setPreviousSearch] = useState(filters.search);
  if (previousSearch !== filters.search) {
    setPreviousSearch(filters.search);
    setSearch(filters.search);
  }
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), [filters]);
  const { type, capacity, sort } = activeFilters;
  function navigate(change: Partial<SpaceFilters>) {
    clearTimeout(timer.current);
    const nextFilters = readSpaceFilters(
      new URLSearchParams(spaceFilterQuery({ ...filters, search, ...change })),
    );
    const query = spaceFilterQuery(nextFilters);
    startTransition(() => {
      setActiveFilters(nextFilters);
      router.push(query ? `/spaces?${query}` : "/spaces", { scroll: false });
    });
  }
  function updateSearch(value: string) {
    setSearch(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => navigate({ search: value }), 350);
  }
  const reset = () => {
    setSearch("");
    navigate({ search: "", type: "all", capacity: 0, sort: "recommended" });
  };
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
              disabled={pending}
              maxLength={150}
              onChange={(e) => updateSearch(e.target.value)}
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
                disabled={pending}
                onChange={() =>
                  navigate({ type: option.value as SpaceType | "all" })
                }
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
        <div className="field">
          <label htmlFor="capacity">حداقل ظرفیت</label>
          <select
            className="input"
            id="capacity"
            value={capacity}
            disabled={pending}
            onChange={(e) => navigate({ capacity: Number(e.target.value) })}
          >
            {capacity > 0 && ![2, 4, 10].includes(capacity) && (
              <option value={capacity}>
                {formatNumber(capacity)} نفر و بیشتر
              </option>
            )}
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
      <div className="explorer-results" aria-busy={pending}>
        {pending && <p role="status">در حال دریافت فضاها...</p>}
        <div className="results-toolbar">
          <span>
            <strong>{formatNumber(spaces.length)} فضا</strong> برای یک روز کاری
            خوب
          </span>
          <label className="sort-label">
            مرتب‌سازی
            <select
              aria-label="مرتب‌سازی"
              value={sort}
              disabled={pending}
              onChange={(e) =>
                navigate({ sort: e.target.value as SpaceFilters["sort"] })
              }
            >
              <option value="recommended">پیشنهاد کاوین</option>
              <option value="low">کمترین قیمت</option>
              <option value="high">بیشترین قیمت</option>
            </select>
          </label>
        </div>
        {spaces.length ? (
          <div className="spaces-grid explorer-grid">
            {spaces.map((space) => (
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
