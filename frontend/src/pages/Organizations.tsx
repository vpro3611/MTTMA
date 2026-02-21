import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { routes } from '../config/routes';
import * as meApi from '../api/me';
import * as orgApi from '../api/org';
import type { OrganizationSearchResult, SearchOrganizationsQuery } from '../types/organization';

function toDateTimeLocalValue(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function Organizations() {
  const navigate = useNavigate();
  const [createName, setCreateName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [sortBy, setSortBy] = useState<SearchOrganizationsQuery['sortBy']>('createdAt');
  const [order, setOrder] = useState<SearchOrganizationsQuery['order']>('desc');
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [list, setList] = useState<OrganizationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const buildSearchParams = (): SearchOrganizationsQuery => {
    const q = query.trim();
    if (!q) return { query: '', limit: 20, offset: 0 };
    const params: SearchOrganizationsQuery = {
      query: q,
      sortBy,
      order,
      limit: limit || undefined,
      offset: offset || undefined,
    };
    if (createdFrom) {
      const from = new Date(createdFrom);
      if (!Number.isNaN(from.getTime())) params.createdFrom = from.toISOString();
    }
    if (createdTo) {
      const to = new Date(createdTo);
      if (!Number.isNaN(to.getTime())) params.createdTo = to.toISOString();
    }
    return params;
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = createName.trim();
    if (name.length < 3) return;
    setCreateError(null);
    setCreating(true);
    try {
      const created = await orgApi.createOrganization(name);
      setCreateName('');
      navigate(routes.organization(created.id));
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setError(null);
    setLoading(true);
    setSubmitted(true);
    meApi
      .searchOrganizations(buildSearchParams())
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : 'Search failed'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="page organizations-page">
      <nav className="page-nav">
        <Link to={routes.dashboard}>Dashboard</Link>
        <Link to={routes.home}>Home</Link>
      </nav>
      <h1>Organizations</h1>
      <form onSubmit={handleCreateOrg} className="auth-form inline-form">
        <label>New organization name <input type="text" value={createName} onChange={(e) => setCreateName(e.target.value)} minLength={3} maxLength={255} placeholder="Name" required /></label>
        <button type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create organization'}</button>
      </form>
      {createError && <div className="auth-error">{createError}</div>}
      <form onSubmit={handleSearch} className="org-search-form">
        <div className="search-form">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            minLength={1}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
        <button
          type="button"
          className="filters-toggle"
          onClick={() => setShowFilters((v) => !v)}
        >
          {showFilters ? 'Hide filters' : 'Show filters'}
        </button>
        {showFilters && (
          <div className="org-filters">
            <label>
              Created from (date-time)
              <input
                type="datetime-local"
                value={createdFrom ? toDateTimeLocalValue(createdFrom) : ''}
                onChange={(e) => setCreatedFrom(e.target.value ? new Date(e.target.value).toISOString() : '')}
              />
            </label>
            <label>
              Created to (date-time)
              <input
                type="datetime-local"
                value={createdTo ? toDateTimeLocalValue(createdTo) : ''}
                onChange={(e) => setCreatedTo(e.target.value ? new Date(e.target.value).toISOString() : '')}
              />
            </label>
            <label>
              Sort by
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SearchOrganizationsQuery['sortBy'])}
              >
                <option value="createdAt">Created at</option>
                <option value="membersCount">Members count</option>
              </select>
            </label>
            <label>
              Order
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as SearchOrganizationsQuery['order'])}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
            <label>
              Limit (1–100)
              <input
                type="number"
                min={1}
                max={100}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value) || 20)}
              />
            </label>
            <label>
              Offset
              <input
                type="number"
                min={0}
                value={offset}
                onChange={(e) => setOffset(Number(e.target.value) || 0)}
              />
            </label>
          </div>
        )}
      </form>
      {error && <div className="auth-error">{error}</div>}
      {submitted && !loading && (
        <ul className="org-list">
          {list.length === 0 ? (
            <li>No organizations found.</li>
          ) : (
            list.map((org) => (
              <li key={org.id}>
                <Link to={routes.organization(org.id)}>
                  {org.name}
                </Link>
                <span className="org-meta"> · {org.membersCount} members</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
