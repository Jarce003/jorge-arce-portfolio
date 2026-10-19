import type { Locale } from "@/lib/i18n";

type Props={lang:Locale;className?:string};

/** Same-site language navigation works inside the Next.js iframe and when
 * this standalone R3F scene is opened directly during development. */
export function WorldLanguageSwitch({lang,className=""}:Props){
  const change=(next:Locale)=>{
    if(next===lang)return;
    const target="/"+next;
    if(window.top && window.top!==window.self){
      window.top.location.assign(target);
    }else if(window.location.pathname.startsWith("/experience/")){
      window.location.assign(target);
    }else{
      window.location.assign("/?lang="+next);
    }
  };
  return (
    <nav className={"world-language-switch "+className}
      aria-label={lang==="es"?"Idioma":"Language"}>
      {(["es","en"] as const).map(code=>(
        <button type="button" key={code}
          aria-current={lang===code?"page":undefined}
          aria-label={code==="es"?"Español":"English"}
          title={code==="es"?"Español":"English"}
          onClick={()=>change(code)}>
          {code.toUpperCase()}
        </button>
      ))}
    </nav>
  );
}
