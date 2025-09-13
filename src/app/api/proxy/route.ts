import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url, method, headers, body } = await request.json();

    // Validate URL
    if (!url || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Invalid URL provided" },
        { status: 400 }
      );
    }

    // Parse headers
    let requestHeaders: Record<string, string> = {};
    if (headers) {
      headers.split("\n").forEach((header: string) => {
        const [key, value] = header.split(":").map((s: string) => s.trim());
        if (key && value) {
          requestHeaders[key] = value;
        }
      });
    }

    // Make the API call
    const response = await fetch(url, {
      method: method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...requestHeaders,
      },
      body: body && (method === "POST" || method === "PUT") ? body : undefined,
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      status: response.status,
      data: data,
    });
  } catch (error: any) {
    console.error("API Proxy Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "API call failed",
      },
      { status: 500 }
    );
  }
}
