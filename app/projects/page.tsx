// app/projects/page.tsx
import Link from "next/link";
import React from "react";
import { allProjects } from "contentlayer/generated";
import { Navigation } from "../components/nav";
import { Card } from "../components/card";
import { Article } from "./article";
import { Redis } from "@upstash/redis";
import { Eye } from "lucide-react";

export const revalidate = 60;

/** Build-safe Redis (fallback to null if not configured) */
function getRedis(): Redis | null {
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      return Redis.fromEnv();
    }
  } catch {}
  return null;
}

export default async function ProjectsPage() {
  // Source list: published first; if 'published' is missing, treat as true
  const projects = allProjects
    .filter((p) => (typeof p.published === "boolean" ? p.published : true))
    .sort((a, b) => {
      const ad = a.date ? new Date(a.date).getTime() : -Infinity;
      const bd = b.date ? new Date(b.date).getTime() : -Infinity;
      return bd - ad;
    });

  // Early return if you have no projects yet
  if (projects.length === 0) {
    return (
      <div className="relative pb-16">
        <Navigation />
        <div className="px-6 pt-20 mx-auto max-w-3xl lg:px-8 md:pt-24 lg:pt-32">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">Projects</h2>
          <p className="mt-4 text-zinc-400">No projects yet. Add an MDX file in <code>content/projects/</code>.</p>
        </div>
      </div>
    );
  }

  // Build-safe pageviews
  const redis = getRedis();
  let views: Record<string, number> = {};
  if (redis) {
    try {
      const keys = projects.map((p) => ["pageviews", "projects", p.slug ?? p._raw.flattenedPath].join(":"));
      const vals = await redis.mget<number[]>(...keys);
      views = vals.reduce((acc, v, i) => {
        const slug = projects[i].slug ?? projects[i]._raw.flattenedPath;
        acc[slug] = v ?? 0;
        return acc;
      }, {} as Record<string, number>);
    } catch {
      // ignore; keep empty views
    }
  }

  // Pick “featured” and the next two items safely
  const [featured, top2, top3, ...rest] = projects;

  // Remaining grid (excluding whatever we showed as featured/top2/top3)
  const featuredSlug = featured?.slug ?? featured?._raw.flattenedPath;
  const top2Slug = top2?.slug ?? top2?._raw.flattenedPath;
  const top3Slug = top3?.slug ?? top3?._raw.flattenedPath;

  const sorted = projects.filter(
    (p) => {
      const s = p.slug ?? p._raw.flattenedPath;
      return s !== featuredSlug && s !== top2Slug && s !== top3Slug;
    }
  );

  return (
    <div className="relative pb-16">
      <Navigation />
      <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">Projects</h2>
          <p className="mt-4 text-zinc-400">Robotics, embedded systems, and control projects.</p>
        </div>

        <div className="w-full h-px bg-zinc-800" />

        {/* Featured + Top 2 (only render if present) */}
        {(featured || top2 || top3) && (
          <div className="grid grid-cols-1 gap-8 mx-auto lg:grid-cols-2 ">
            {featured && (
              <Card>
                <Link href={`/projects/${featured.slug ?? featured._raw.flattenedPath}`}>
                  <article className="relative w-full h-full p-4 md:p-8">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-zinc-100">
                        {featured.date ? (
                          <time dateTime={new Date(featured.date).toISOString()}>
                            {Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(featured.date))}
                          </time>
                        ) : (
                          <span>SOON</span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Eye className="w-4 h-4" />
                        {Intl.NumberFormat("en-US", { notation: "compact" }).format(
                          views[featuredSlug ?? ""] ?? 0,
                        )}
                      </span>
                    </div>

                    <h2 className="mt-4 text-3xl font-bold text-zinc-100 group-hover:text-white sm:text-4xl font-display">
                      {featured.title}
                    </h2>
                    {featured.description && (
                      <p className="mt-4 leading-8 duration-150 text-zinc-400 group-hover:text-zinc-300">
                        {featured.description}
                      </p>
                    )}
                    <div className="absolute bottom-4 md:bottom-8">
                      <p className="hidden text-zinc-200 hover:text-zinc-50 lg:block">
                        Read more <span aria-hidden="true">&rarr;</span>
                      </p>
                    </div>
                  </article>
                </Link>
              </Card>
            )}

            <div className="flex flex-col w-full gap-8 mx-auto border-t border-gray-900/10 lg:mx-0 lg:border-t-0 ">
              {[top2, top3].filter(Boolean).map((project) => {
                const slug = project!.slug ?? project!._raw.flattenedPath;
                return (
                  <Card key={slug}>
                    <Article project={project!} views={views[slug] ?? 0} />
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {sorted.length > 0 && <div className="hidden w-full h-px md:block bg-zinc-800" />}

        {/* Remaining grid */}
        <div className="grid grid-cols-1 gap-4 mx-auto lg:mx-0 md:grid-cols-3">
          {[0, 1, 2].map((col) => (
            <div key={col} className="grid grid-cols-1 gap-4">
              {sorted
                .filter((_, i) => i % 3 === col)
                .map((project) => {
                  const slug = project.slug ?? project._raw.flattenedPath;
                  return (
                    <Card key={slug}>
                      <Article project={project} views={views[slug] ?? 0} />
                    </Card>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
