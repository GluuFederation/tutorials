import { init, Cedarling, AuthorizeResult } from '@janssenproject/cedarling_wasm';
import logger from './logger';

export const cedarlingBootstrapProperties = {
  CEDARLING_APPLICATION_NAME: 'CloudInfrastructure',
  CEDARLING_POLICY_STORE_URI:
    'https://raw.githubusercontent.com/kdhttps/pd-first/refs/heads/agama-lab-policy-designer/22942366f5ad4d8338514bc402d4b901b056051f2bed.json',
  CEDARLING_USER_AUTHZ: 'enabled',
  CEDARLING_LOG_TYPE: 'std_out',
  CEDARLING_LOG_LEVEL: 'INFO',
  CEDARLING_LOG_TTL: 120,
  CEDARLING_PRINCIPAL_BOOLEAN_OPERATION: {
    '===': [{ var: 'Jans::User' }, 'ALLOW'],
  },
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
