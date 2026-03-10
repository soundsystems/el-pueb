"use client";

import { domAnimation, LazyMotion, m as motion } from "framer-motion";
import { Instagram } from "lucide-react";
import useSWR from "swr";

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  timestamp: string;
}

interface InstagramFeedProps {
  maxPosts?: number;
  updateInterval?: number; // in milliseconds, default 7 days
}

interface InstagramApiResponse {
  error?: string;
  posts: InstagramPost[];
}

const INSTAGRAM_HANDLE = "elpueblitonwa";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
const CACHE_KEY = "instagram-feed";
const CACHE_TIMESTAMP_KEY = "instagram-feed-timestamp";

const fetchInstagramPosts = async ({
  maxPosts,
  updateInterval,
}: {
  maxPosts: number;
  updateInterval: number;
}): Promise<{ lastUpdated: Date | null; posts: InstagramPost[] }> => {
  const cached = localStorage.getItem(CACHE_KEY);
  const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

  if (cached && cachedTimestamp) {
    const lastUpdate = new Date(Number.parseInt(cachedTimestamp, 10));
    const now = new Date();
    const timeDiff = now.getTime() - lastUpdate.getTime();

    if (timeDiff < updateInterval) {
      return {
        posts: JSON.parse(cached) as InstagramPost[],
        lastUpdated: lastUpdate,
      };
    }
  }

  const response = await fetch("/api/instagram-feed");

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as InstagramApiResponse;

  if (data.error) {
    throw new Error(data.error);
  }

  const recentPosts = data.posts.slice(0, maxPosts);
  localStorage.setItem(CACHE_KEY, JSON.stringify(recentPosts));
  localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

  return {
    posts: recentPosts,
    lastUpdated: new Date(),
  };
};

export default function InstagramFeed({
  maxPosts = 3,
  updateInterval = 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
}: InstagramFeedProps) {
  const { data, error, isLoading } = useSWR(
    ["instagram-feed", maxPosts, updateInterval],
    () => fetchInstagramPosts({ maxPosts, updateInterval }),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );
  const posts = data?.posts ?? [];
  const lastUpdated = data?.lastUpdated ?? null;

  if (isLoading) {
    return (
      <section className="w-full rounded-xl bg-stone-50/40 pt-4 pb-10 shadow-lg backdrop-blur-sm">
        <div className="mx-auto w-full max-w-screen-lg px-4 md:px-10 lg:px-14">
          <h2 className="mb-10 text-center font-black text-2xl text-[#0f8540] md:text-3xl">
            Follow Us on Instagram
          </h2>
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0f8540] border-t-transparent" />
              <span className="text-stone-600">Loading Instagram posts...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && posts.length === 0) {
    return (
      <section className="w-full rounded-xl bg-stone-50/40 pt-4 pb-10 shadow-lg backdrop-blur-sm">
        <div className="mx-auto w-full max-w-screen-lg px-4 md:px-10 lg:px-14">
          <h2 className="mb-10 text-center font-black text-2xl text-[#0f8540] md:text-3xl">
            Follow Us on Instagram
          </h2>
          <div className="flex items-center justify-center py-20">
            <p className="text-center text-stone-600">
              Unable to load Instagram posts at this time. Please try again
              later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <section className="w-full rounded-xl bg-stone-50/40 pt-4 pb-10 shadow-lg backdrop-blur-sm">
        <div className="mx-auto w-full max-w-screen-lg px-4 md:px-10 lg:px-14">
          <h2 className="mb-10 text-center font-black text-2xl text-[#0f8540] md:text-3xl">
            Follow Us on Instagram
          </h2>

          <div className="flex flex-col items-center space-y-6">
            {/* Instagram posts grid */}
            <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
              {posts.map((post, index) => (
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  key={post.id}
                  transition={{ delay: index * 0.2 }}
                >
                  <a
                    className="block"
                    href={post.permalink}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-full border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                      <img
                        alt={post.caption || "Instagram post"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        src={post.media_url}
                      />
                      {post.media_type === "VIDEO" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white bg-opacity-80">
                            <svg
                              className="ml-1 h-6 w-6 text-black"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                      {post.media_type === "CAROUSEL_ALBUM" && (
                        <div className="absolute top-2 right-2 rounded-full bg-white bg-opacity-80 p-1">
                          <svg
                            className="h-4 w-4 text-black"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Follow us button */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.6 }}
            >
              <a
                className="inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                href={INSTAGRAM_URL}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Instagram className="h-5 w-5" />
                <span>Follow @{INSTAGRAM_HANDLE}</span>
              </a>
            </motion.div>

            {/* Last updated info */}
            {lastUpdated && (
              <motion.p
                animate={{ opacity: 1 }}
                className="mt-4 text-stone-500 text-xs"
                initial={{ opacity: 0 }}
                transition={{ delay: 0.8 }}
              >
                Last updated: {lastUpdated.toLocaleDateString()}
              </motion.p>
            )}
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
