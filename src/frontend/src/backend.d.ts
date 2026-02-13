import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
/**
 * / This backend does not fetch or store marine/beach conditions.
 * / Marine integration is client-side only. (Open-Meteo queries from the TypeScript frontend)
 */
export interface backendInterface {
}
