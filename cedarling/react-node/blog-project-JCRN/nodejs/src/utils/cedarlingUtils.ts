import { init, Cedarling, AuthorizeResult } from '@janssenproject/cedarling_wasm';
import logger from './logger';

export const cedarlingBootstrapProperties = {
  CEDARLING_APPLICATION_NAME: 'JansBlogPlatform',
  CEDARLING_POLICY_STORE_URI:
    'https://raw.githubusercontent.com/kdhttps/pd-first/refs/heads/agama-lab-policy-designer/e3a8d6281e8538a0977bf544428c260004601bc289ff.json',
  CEDARLING_USER_AUTHZ: 'enabled',
  CEDARLING_LOG_TYPE: 'std_out',
  CEDARLING_LOG_LEVEL: 'TRACE',
  CEDARLING_LOG_TTL: 120,
  CEDARLING_PRINCIPAL_BOOLEAN_OPERATION: {
    '===': [{ var: 'Jans::User' }, 'ALLOW'],
  },
  CEDARLING_JWT_SIG_VALIDATION: 'disabled',
  CEDARLING_JWT_STATUS_VALIDATION: 'disabled',
  CEDARLING_JWT_SIGNATURE_ALGORITHMS_SUPPORTED: ['RS256'],
};

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
  async initialize(policyStoreConfig: any): Promise<void> {
    if (!this.initialized) {
      this.cedarling = (await init(policyStoreConfig)) as unknown as Cedarling;
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
