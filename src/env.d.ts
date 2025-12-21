/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly WEBPAY_API_KEY?: string;
  readonly MERCADOPAGO_ACCESS_TOKEN?: string;
  readonly FLOW_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

