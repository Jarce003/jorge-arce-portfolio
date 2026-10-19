import type { ComponentProps, MouseEvent } from "react";

type ImageProps = ComponentProps<"img"> & {
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
};

export function Image({fill=false,priority=false,unoptimized:unused,...rest}:ImageProps){
  const style=fill
    ? {position:"absolute" as const,inset:0,width:"100%",height:"100%",...rest.style}
    : rest.style;
  return <img {...rest} style={style} loading={priority?"eager":"lazy"}/>;
}

type LinkProps = ComponentProps<"a"> & {href:string};
export function Link({href,onClick,...props}:LinkProps){
  function navigate(event:MouseEvent<HTMLAnchorElement>){
    onClick?.(event);
    if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
    if(href.startsWith("/")){
      event.preventDefault();
      window.dispatchEvent(new CustomEvent("jarcedev:navigate",{detail:{href}}));
    }
  }
  return <a {...props} href={href} onClick={navigate}/>;
}
