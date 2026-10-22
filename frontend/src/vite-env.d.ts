/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the JavaSchoolLab API, e.g. https://api.javaschoollab.com/api */
  readonly VITE_API_BASE_URL?: string;
  /** Where course content comes from: 'bundle' (default, compiled in) or 'api' (GET {API_BASE}/content/courses/{id}). */
  readonly VITE_CONTENT_SOURCE?: 'api' | 'bundle';

  /**
   * AdSense publisher id, e.g. ca-pub-1234567890123456. Unset disables every ad slot,
   * which is the correct state for local dev and for builds made before approval.
   */
  readonly VITE_ADSENSE_CLIENT?: string;
  /** Numeric ad unit ids from AdSense > Ads > By ad unit. */
  readonly VITE_AD_SLOT_RAIL_TOP?: string;
  readonly VITE_AD_SLOT_RAIL_BOTTOM?: string;
  readonly VITE_AD_SLOT_CORNER?: string;
  /** Contact address printed on the Privacy Policy and Terms pages. */
  readonly VITE_CONTACT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
