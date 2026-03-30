export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_POLICY_STORE_URL;

    if (!url) {
      throw new Error(
        "NEXT_PUBLIC_POLICY_STORE_URL environment variable is not set",
      );
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "node-fetch",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch policy store: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching policy store:", error);
    return Response.json(
      { error: "Failed to fetch policy store" },
      { status: 500 },
    );
  }
}
