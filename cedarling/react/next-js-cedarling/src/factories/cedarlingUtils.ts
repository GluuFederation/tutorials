import initWasm, {
  Cedarling,
  AuthorizeResult,
  init_from_archive_bytes,
} from "@janssenproject/cedarling_wasm";

export const cedarlingBootstrapProperties = {
  CEDARLING_APPLICATION_NAME: "TaskManager",
  CEDARLING_USER_AUTHZ: "enabled",
  CEDARLING_WORKLOAD_AUTHZ: "disabled",
  CEDARLING_LOG_TYPE: "std_out",
  CEDARLING_LOG_LEVEL: "TRACE",
  CEDARLING_PRINCIPAL_BOOLEAN_OPERATION: {
    "===": [{ var: "Jans::User" }, "ALLOW"],
  },
};

export async function fetchPolicyStoreZip(): Promise<ArrayBuffer> {
  console.info(`Fetching policy store via API endpoint`);
  try {
    const response = await fetch("/api/policy-store", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch policy store: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error("Error fetching policy store:", error);
    throw error;
  }
}

class CedarlingClient {
  private static instance: CedarlingClient;
  private cedarling: Cedarling | null = null;
  private initialized = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private wasmModule: any = null;

  private constructor() {}

  static getInstance(): CedarlingClient {
    if (!CedarlingClient.instance) {
      CedarlingClient.instance = new CedarlingClient();
    }
    return CedarlingClient.instance;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async initialize(policyStoreConfig: any): Promise<void> {
    if (!this.initialized) {
      this.wasmModule = await initWasm();
      const responseArrayBuffer = await fetchPolicyStoreZip();
      const bytes = new Uint8Array(responseArrayBuffer);
      this.cedarling = (await init_from_archive_bytes(
        policyStoreConfig,
        bytes,
      )) as unknown as Cedarling;
      console.log("WASM initialized", this.cedarling);

      this.initialized = true;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async authorize(request: any): Promise<AuthorizeResult> {
    if (!this.cedarling || !this.initialized) {
      throw new Error("Cedarling not initialized");
    }
    try {
      const result = await this.cedarling.authorize(request);
      return result;
    } catch (error) {
      console.error("Error during authorization:", error);
      throw error;
    }
  }
}

export const cedarlingClient = CedarlingClient.getInstance();
