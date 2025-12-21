/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly MERCADOPAGO_ACCESS_TOKEN?: string;
  readonly PUBLIC_MERCADOPAGO_PUBLIC_KEY?: string;
  readonly TRANSBANK_API_KEY?: string;
  readonly TRANSBANK_COMMERCE_CODE?: string;
  readonly TRANSBANK_ENVIRONMENT?: 'integration' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

