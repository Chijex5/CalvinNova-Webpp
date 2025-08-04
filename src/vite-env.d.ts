/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STREAM_API_KEY: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_PAYSTACK_LIVE_PUBLIC_KEY: string;
  readonly VITE_PAYSTACK_LIVE_SECRET_KEY: string;
  readonly VITE_PAYSTACK_TEST_PUBLIC_KEY: string;
  readonly VITE_PAYSTACK_TEST_SECRET_KEY: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}