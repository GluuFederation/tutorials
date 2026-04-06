import {
  init,
  Cedarling,
  AuthorizeResult,
  init_from_archive_bytes,
} from '@janssenproject/cedarling_wasm';
import logger from './logger';

interface TBootstrapProperties {
  CEDARLING_APPLICATION_NAME: string;
  CEDARLING_POLICY_STORE_URI: string;
  CEDARLING_POLICY_STORE_ID: string;
  CEDARLING_USER_AUTHZ: string;
  CEDARLING_LOG_TYPE: string;
  CEDARLING_LOG_LEVEL: string;
  CEDARLING_WORKLOAD_AUTHZ: string;
  CEDARLING_PRINCIPAL_BOOLEAN_OPERATION: Record<string, any>;
  CEDARLING_ID_TOKEN_TRUST_MODE?: string;
  CEDARLING_JWT_SIG_VALIDATION?: string;
  CEDARLING_JWT_STATUS_VALIDATION?: string;
}

export const cedarlingBootstrapProperties: TBootstrapProperties = {
  CEDARLING_APPLICATION_NAME: 'CloudInfrastructure',
  CEDARLING_POLICY_STORE_URI:
    'https://github.com/kdhttps/new-pd/releases/download/v0.0.8/JansNodeJSCedarling.cjar',
  CEDARLING_POLICY_STORE_ID: '65c38cb629a964b423ee80dcdce7a76e0b37af9579bc',
  CEDARLING_USER_AUTHZ: 'enabled',
  CEDARLING_WORKLOAD_AUTHZ: 'disabled',
  CEDARLING_LOG_TYPE: 'std_out',
  CEDARLING_LOG_LEVEL: 'TRACE',
  CEDARLING_PRINCIPAL_BOOLEAN_OPERATION: {
    '===': [{ var: 'Jans::User' }, 'ALLOW'],
  },
};

export async function fetchPolicyStoreZip(url: string): Promise<ArrayBuffer> {
  let etag = '';
  logger.info(`Fetching policy store from URL: ${url} with ETag: ${etag}`);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'node-fetch',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      redirect: 'follow',
    });

    if (response.status === 304) {
      logger.info('Policy store not modified (304), retrying fetch...');
      const retryResponse = await fetch(url);
      if (!retryResponse.ok) {
        throw new Error(`Failed to fetch policy store: ${retryResponse.statusText}`);
      }
      return await retryResponse.arrayBuffer();
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch policy store: ${response.statusText}`);
    }

    etag = response.headers.get('ETag') || '';
    return await response.arrayBuffer();
  } catch (error) {
    logger.error('Error fetching policy store:', error);
    throw error;
  }
}

class CedarlingClient {
  private static instance: CedarlingClient;
  private cedarling: Cedarling | null = null;
  private initialized = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  private constructor() {}

  static getInstance(): CedarlingClient {
    if (!CedarlingClient.instance) {
      logger.info('WASM initialing. Creating new instance');
      CedarlingClient.instance = new CedarlingClient();
    }
    return CedarlingClient.instance;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async initialize(policyStoreConfig: TBootstrapProperties): Promise<void> {
    if (!this.initialized) {
      const { CEDARLING_POLICY_STORE_URI, ...config } = policyStoreConfig;
      const responseArrayBuffer = await fetchPolicyStoreZip(CEDARLING_POLICY_STORE_URI);
      const bytes = new Uint8Array(responseArrayBuffer);
      this.cedarling = (await init_from_archive_bytes(config, bytes)) as unknown as Cedarling;
      logger.info('WASM initialized', this.cedarling);
      this.initialized = true;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async authorize(request: any): Promise<AuthorizeResult> {
    if (!this.cedarling || !this.initialized) {
      const errorMessage = 'Cedarling not initialized';
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    try {
      const result = await this.cedarling.authorize(request);
      return result;
    } catch (error) {
      logger.error('Error during authorization:', error);
      throw error;
    }
  }
}

export const cedarlingClient = CedarlingClient.getInstance();
