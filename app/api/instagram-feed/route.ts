import { type NextRequest, NextResponse } from "next/server";

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  timestamp: string;
}

interface InstagramApiResponse {
  data: InstagramPost[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get Instagram access token from environment variables
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      console.error("Instagram access token not configured");
      // Return fallback data for development/testing when no token is configured
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          posts: [
            {
              id: "1",
              media_url:
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop",
              permalink: "https://instagram.com/el_pueb",
              caption: "Delicious food at El Pueblito! 🌮",
              media_type: "IMAGE" as const,
              timestamp: new Date().toISOString(),
            },
            {
              id: "2",
              media_url:
                "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop",
              permalink: "https://instagram.com/el_pueb",
              caption: "Fresh ingredients, authentic flavors! 🌶️",
              media_type: "IMAGE" as const,
              timestamp: new Date().toISOString(),
            },
            {
              id: "3",
              media_url:
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop",
              permalink: "https://instagram.com/el_pueb",
              caption: "Family dinner time! 👨‍👩‍👧‍👦",
              media_type: "IMAGE" as const,
              timestamp: new Date().toISOString(),
            },
          ],
        });
      }

      return NextResponse.json(
        { error: "Instagram integration not configured" },
        { status: 500 }
      );
    }

    // Fetch recent media from Instagram Basic Display API
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_url,permalink,caption,media_type,timestamp&access_token=${accessToken}&limit=10`
    );

    if (!response.ok) {
      throw new Error(
        `Instagram API error: ${response.status} ${response.statusText}`
      );
    }

    const data: InstagramApiResponse = await response.json();

    if (!(data.data && Array.isArray(data.data))) {
      throw new Error("Invalid response from Instagram API");
    }

    // Filter and process posts
    const posts = data.data
      .filter((post) => post.media_url) // Only include posts with media
      .slice(0, 10); // Limit to 10 posts

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching Instagram posts:", error);

    // Return fallback data for development/testing
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        posts: [
          {
            id: "1",
            media_url:
              "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop",
            permalink: "https://instagram.com/el_pueb",
            caption: "Delicious food at El Pueblito! 🌮",
            media_type: "IMAGE" as const,
            timestamp: new Date().toISOString(),
          },
          {
            id: "2",
            media_url:
              "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop",
            permalink: "https://instagram.com/el_pueb",
            caption: "Fresh ingredients, authentic flavors! 🌶️",
            media_type: "IMAGE" as const,
            timestamp: new Date().toISOString(),
          },
          {
            id: "3",
            media_url:
              "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop",
            permalink: "https://instagram.com/el_pueb",
            caption: "Family dinner time! 👨‍👩‍👧‍👦",
            media_type: "IMAGE" as const,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch Instagram posts" },
      { status: 500 }
    );
  }
}
