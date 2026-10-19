import type { ReactNode } from "react";

// Lucide-style outline icon paths: consistent 24px optical size, no icon font
// or extra network dependency on first paint.
export type WorldIconName="moon"|"sun"|"camera"|"siren"|"grid"|"reset"|"help";
const art:Record<WorldIconName,ReactNode>={
  moon:<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>,
  sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>,
  camera:<><path d="M14.8 4H9.2l-1.9 2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.3z"/><circle cx="12" cy="13" r="3.5"/></>,
  siren:<><path d="M5 18h14M6 18V11a6 6 0 0 1 12 0v7M12 2v2M3 6l2 2M21 6l-2 2M2 12h2m16 0h2"/><path d="M9 18v-6a3 3 0 0 1 3-3"/></>,
  grid:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  reset:<><path d="M3 11a9 9 0 1 1 2.8 6.5"/><path d="M3 4v7h7"/></>,
  help:<><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.5 2.5 0 0 1 4.7 1.1c0 1.7-2.5 2.1-2.5 3.9"/><circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none"/></>,
};
export function WorldIcon({name,size=20}:{name:WorldIconName;size?:number}){
  return <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
    viewBox="0 0 24 24" width={size} height={size} fill="none"
    stroke="currentColor" strokeWidth="1.85" strokeLinecap="round"
    strokeLinejoin="round">{art[name]}</svg>;
}
