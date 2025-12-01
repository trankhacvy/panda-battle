export async function sendSponsoredTransactionToBackend(
  serializedTransaction: string
): Promise<string> {
  const response = await fetch("/api/sponsor-transaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transaction: serializedTransaction }),
  });

  if (!response.ok) {
    let errorData: { error?: string; details?: string } | null = null;
    try {
      errorData = (await response.json()) as {
        error?: string;
        details?: string;
      };
    } catch {
      // Ignore JSON parsing errors – we still throw a generic error below.
    }

    const errorMessage =
      errorData?.error ||
      `Failed to send sponsored transaction: ${response.status} ${response.statusText}`;
    const error = new Error(errorMessage);
    // Attach details to error object for easier access
    if (errorData?.details) {
      (error as Error & { details?: string }).details = errorData.details;
    }
    throw error;
  }

  const json = (await response.json()) as {
    transactionHash?: string;
  };

  if (!json.transactionHash) {
    throw new Error("Backend did not return a transaction hash");
  }

  return json.transactionHash;
}
